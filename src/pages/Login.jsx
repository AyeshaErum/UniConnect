import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Separator } from '../components/ui/Separator'
import { loginWithEmail, loginWithGoogle } from '../firebase/auth'
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

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [gLoading, setGLoading] = useState(false)

  async function handleEmail(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await loginWithEmail(email, password)
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
      toast.error(friendlyError(err.code))
    } finally { setGLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <motion.div variants={staggerItem} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-gradient shadow-glow-teal mb-4">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your UniConnect account</p>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-card-lg space-y-4"
        >
          {/* Google */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogle}
            loading={gLoading}
            type="button"
          >
            {!gLoading && <GoogleIcon />}
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <Input
              type="email" label="Email" icon={Mail}
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@university.edu" autoComplete="email" required
            />
            <Input
              type="password" label="Password" icon={Lock}
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Your password" autoComplete="current-password" required
            />
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign In <ArrowRight size={15} />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            No account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">Sign up free</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

function friendlyError(code) {
  const m = {
    'auth/wrong-password':     'Incorrect password.',
    'auth/user-not-found':     'No account with that email.',
    'auth/invalid-email':      'Invalid email address.',
    'auth/too-many-requests':  'Too many attempts. Try again later.',
    'auth/invalid-credential': 'Invalid credentials.',
  }
  return m[code] || 'Sign in failed. Please try again.'
}
