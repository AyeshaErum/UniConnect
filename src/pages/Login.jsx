import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { loginWithEmail, loginWithGoogle } from '../firebase/auth'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail]     = useState('')
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
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGLoading(true)
    try {
      await loginWithGoogle()
      navigate('/')
    } catch (err) {
      toast.error(friendlyError(err.code))
    } finally {
      setGLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-pattern px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-navy-600 flex items-center justify-center mx-auto mb-3 shadow-glow">
            <span className="text-white font-display font-bold text-2xl">U</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-navy-300 mt-1">Sign in to UniConnect</p>
        </div>

        <div className="bg-navy-900/90 backdrop-blur border border-navy-700 rounded-2xl p-6 shadow-card space-y-4">
          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={gLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl bg-white text-gray-800 font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {gLoading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-navy-700" />
            <span className="text-xs text-navy-400">or</span>
            <div className="flex-1 h-px bg-navy-700" />
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            <Input
              label="Email" type="email" icon={Mail}
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@university.edu" required
            />
            <Input
              label="Password" type="password" icon={Lock}
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Your password" required
            />
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              <LogIn size={16} /> Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-navy-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-teal-400 hover:text-teal-300 font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function friendlyError(code) {
  const map = {
    'auth/wrong-password':     'Incorrect password.',
    'auth/user-not-found':     'No account with that email.',
    'auth/invalid-email':      'Invalid email address.',
    'auth/too-many-requests':  'Too many attempts. Try again later.',
    'auth/invalid-credential': 'Invalid credentials.',
  }
  return map[code] || 'Sign in failed. Please try again.'
}
