import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Home, Users, HelpCircle, Calendar, GraduationCap,
  MessageSquare, Trophy, Star, Settings, LogOut, Sun, Moon, Menu, X,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { logout } from '../../firebase/auth'
import Avatar from '../ui/Avatar'
import NotificationBell from '../notifications/NotificationBell'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { to: '/',               label: 'Home',           icon: Home },
  { to: '/discover',       label: 'Discover',       icon: Users },
  { to: '/help-board',     label: 'Help Board',     icon: HelpCircle },
  { to: '/events',         label: 'Events',         icon: Calendar },
  { to: '/mentorship',     label: 'Mentorship',     icon: GraduationCap },
  { to: '/messages',       label: 'Messages',       icon: MessageSquare },
  { to: '/leaderboard',    label: 'Leaderboard',    icon: Trophy },
  { to: '/success-stories',label: 'Success',        icon: Star },
]

export default function Navbar() {
  const { user, profile } = useAuth()
  const { dark, toggle }  = useTheme()
  const navigate          = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
    } catch {
      toast.error('Logout failed')
    }
  }

  return (
    <nav className="sticky top-0 z-40 bg-navy-950/95 backdrop-blur-md border-b border-navy-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-navy-600 flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">U</span>
          </div>
          <span className="font-display font-bold text-lg text-white hidden sm:block">
            Uni<span className="text-teal-400">Connect</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-400'
                    : 'text-navy-300 hover:text-white hover:bg-navy-800'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-navy-400 hover:text-white hover:bg-navy-800 transition-colors"
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user && <NotificationBell />}

          {user && (
            <div className="flex items-center gap-2">
              <Link to={`/profile/${user.uid}`}>
                <Avatar src={profile?.photoURL} name={profile?.name} size="sm" />
              </Link>
              <button
                onClick={handleLogout}
                className="hidden sm:flex p-2 rounded-lg text-navy-400 hover:text-accent-coral transition-colors"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 rounded-lg text-navy-400 hover:text-white hover:bg-navy-800"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-navy-800 bg-navy-950 px-4 py-3 space-y-1 animate-fade-in">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive ? 'bg-teal-500/15 text-teal-400' : 'text-navy-300 hover:text-white hover:bg-navy-800'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          <div className="border-t border-navy-800 pt-2 mt-2">
            <Link
              to="/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-navy-300 hover:text-white hover:bg-navy-800"
            >
              <Settings size={18} /> Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-accent-coral hover:bg-accent-coral/10"
            >
              <LogOut size={18} /> Log out
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
