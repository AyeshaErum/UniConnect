import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Sun, Moon, Trash2, Shield } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { changePassword, deleteAccount } from '../firebase/auth'
import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import toast from 'react-hot-toast'

export default function Settings() {
  const { dark, toggle } = useTheme()
  const { user }         = useAuth()
  const navigate         = useNavigate()

  const [pw, setPw]     = useState({ current: '', new: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [delLoading, setDelLoading]       = useState(false)

  async function handleChangePassword(e) {
    e.preventDefault()
    if (pw.new.length < 6)       { toast.error('New password must be at least 6 characters'); return }
    if (pw.new !== pw.confirm)   { toast.error('Passwords do not match'); return }
    setPwLoading(true)
    try {
      await changePassword(pw.new)
      toast.success('Password updated!')
      setPw({ current: '', new: '', confirm: '' })
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        toast.error('Please re-login and try again (session expired)')
      } else {
        toast.error('Failed to change password')
      }
    } finally {
      setPwLoading(false)
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Type DELETE to confirm')
      return
    }
    setDelLoading(true)
    try {
      // Delete user profile document
      await deleteDoc(doc(db, 'users', user.uid))
      await deleteAccount()
      toast.success('Account deleted')
      navigate('/login')
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        toast.error('Please re-login first to delete your account')
      } else {
        toast.error('Failed to delete account')
      }
    } finally {
      setDelLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="font-display text-2xl font-bold text-white">Settings</h1>

      {/* Appearance */}
      <Card className="p-5">
        <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
          {dark ? <Moon size={18} /> : <Sun size={18} />}
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Dark Mode</p>
            <p className="text-xs text-navy-400 mt-0.5">Easier on the eyes — saved across sessions</p>
          </div>
          <button
            onClick={toggle}
            className={`relative w-12 h-6 rounded-full transition-colors ${dark ? 'bg-teal-500' : 'bg-navy-600'}`}
            role="switch"
            aria-checked={dark}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${dark ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </Card>

      {/* Change password */}
      <Card className="p-5">
        <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
          <Lock size={18} /> Change Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <Input
            label="New Password" type="password"
            value={pw.new} onChange={e => setPw(p => ({ ...p, new: e.target.value }))}
            placeholder="Min 6 characters"
          />
          <Input
            label="Confirm New Password" type="password"
            value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
            placeholder="Repeat new password"
          />
          <Button type="submit" variant="secondary" loading={pwLoading}>Update Password</Button>
        </form>
        <p className="text-xs text-navy-400 mt-3 flex items-center gap-1">
          <Shield size={11} /> If you signed in with Google, password change doesn't apply.
        </p>
      </Card>

      {/* Danger zone */}
      <Card className="p-5 border-accent-coral/30">
        <h2 className="font-display font-semibold text-accent-coral mb-4 flex items-center gap-2">
          <Trash2 size={18} /> Danger Zone
        </h2>
        <p className="text-sm text-navy-300 mb-4">
          Permanently delete your account and all data. This cannot be undone.
        </p>
        <div className="space-y-3">
          <Input
            label='Type "DELETE" to confirm'
            value={deleteConfirm}
            onChange={e => setDeleteConfirm(e.target.value)}
            placeholder="DELETE"
          />
          <Button
            variant="danger"
            loading={delLoading}
            onClick={handleDeleteAccount}
            disabled={deleteConfirm !== 'DELETE'}
          >
            <Trash2 size={15} /> Delete My Account
          </Button>
        </div>
      </Card>
    </div>
  )
}
