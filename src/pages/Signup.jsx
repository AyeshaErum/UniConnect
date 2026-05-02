import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Separator } from '../components/ui/Separator'
import { signUpWithEmail, loginWithGoogle } from '../firebase/auth'
import { staggerContainer, staggerItem } from '../lib/motion'
import toast from 'react-hot-toast'

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading]   = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [errors, setErrors]     = useState({})
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function validate() {
    const e = {}
    if (!form.name.trim())         e.name     = 'Name is required'
    if (!form.email)               e.email    = 'Email is required'
    if (form.password.length < 6)  e.password = 'Min 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return !Object.keys(e).length
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await signUpWithEmail(form.email, form.password, form.name)
      toast.success('Welcome to UniConnect!')
      navigate('/')
    } catch (err) {
      toast.error(friendlyError(err.code))
    } finally { setLoading(false) }
  }

  async function handleGoogle() {
    setGLoading(true)
    try {
      await loginWithGoogle()
      navigate('/')
    } catch (err) {
      toast.error(err.message)
    } finally { setGLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4 py-8">
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="w-full max-w-sm relative z-10"
      >
        <motion.div variants={staggerItem} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-gradient shadow-glow-teal mb-4">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Join UniConnect</h1>
          <p className="text-sm text-muted-foreground mt-1">Connect, Learn &amp; Grow with your campus</p>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-card-lg space-y-4"
        >
          <Button variant="outline" className="w-full" onClick={handleGoogle} loading={gLoading} type="button">
            {!gLoading && <GoogleIcon />}
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input label="Full Name" icon={User} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Alex Chen" error={errors.name} required />
            <Input label="Email" type="email" icon={Mail} value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@university.edu" error={errors.email} required />
            <Input label="Password" type="password" icon={Lock} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 6 characters" error={errors.password} required />
            <Input label="Confirm Password" type="password" icon={Lock} value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Repeat password" error={errors.confirm} required />
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Account <ArrowRight size={15} />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

function friendlyError(code) {
  const m = {
    'auth/email-already-in-use': 'That email is already registered.',
    'auth/invalid-email':        'Invalid email address.',
    'auth/weak-password':        'Password is too weak.',
  }
  return m[code] || 'Sign up failed. Please try again.'
}
