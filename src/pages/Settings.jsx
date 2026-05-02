import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Trash2, Shield, Palette, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Switch } from '../components/ui/Switch'
import { Label } from '../components/ui/Input'
import { Separator } from '../components/ui/Separator'
import PageWrapper from '../components/layout/PageWrapper'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { changePassword, deleteAccount } from '../firebase/auth'
import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { staggerContainer, staggerItem } from '../lib/motion'
import toast from 'react-hot-toast'

export default function Settings() {
  const { dark, toggle }  = useTheme()
  const { user }          = useAuth()
  const navigate          = useNavigate()
  const [pw, setPw]       = useState({ new: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [delLoading, setDelLoading]       = useState(false)

  async function handleChangePassword(e) {
    e.preventDefault()
    if (pw.new.length < 6)       { toast.error('Minimum 6 characters'); return }
    if (pw.new !== pw.confirm)   { toast.error('Passwords do not match'); return }
    setPwLoading(true)
    try {
      await changePassword(pw.new)
      toast.success('Password updated!')
      setPw({ new: '', confirm: '' })
    } catch (err) {
      toast.error(err.code === 'auth/requires-recent-login' ? 'Re-login required' : 'Failed to update password')
    } finally { setPwLoading(false) }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') { toast.error('Type DELETE to confirm'); return }
    setDelLoading(true)
    try {
      await deleteDoc(doc(db, 'users', user.uid))
      await deleteAccount()
      toast.success('Account deleted')
      navigate('/login')
    } catch (err) {
      toast.error(err.code === 'auth/requires-recent-login' ? 'Re-login required' : 'Failed to delete account')
    } finally { setDelLoading(false) }
  }

  return (
    <PageWrapper>
      <div className="container py-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
          {/* Appearance */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Palette size={17} className="text-primary" /> Appearance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between py-1">
                  <div>
                    <Label className="text-sm font-medium">Dark Mode</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Saved across sessions</p>
                  </div>
                  <Switch checked={dark} onCheckedChange={toggle} aria-label="Toggle dark mode" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Password */}
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock size={17} className="text-primary" /> Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <Input
                    label="New Password" type="password"
                    value={pw.new} onChange={e => setPw(p => ({ ...p, new: e.target.value }))}
                    placeholder="Min 6 characters"
                  />
                  <Input
                    label="Confirm Password" type="password"
                    value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                    placeholder="Repeat new password"
                  />
                  <Button type="submit" variant="outline" loading={pwLoading}>Update Password</Button>
                </form>
                <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
                  <Shield size={11} /> Applies to email accounts only — not Google sign-in.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Danger zone */}
          <motion.div variants={staggerItem}>
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-destructive">
                  <AlertTriangle size={17} /> Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <div className="space-y-3">
                  <Input
                    label='Type "DELETE" to confirm'
                    value={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                  />
                  <Button
                    variant="destructive"
                    loading={delLoading}
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== 'DELETE'}
                  >
                    <Trash2 size={14} /> Delete My Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
