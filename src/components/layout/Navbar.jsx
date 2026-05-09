import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Home, Users, HelpCircle, GraduationCap,
  MessageSquare, Trophy, Star, Settings, LogOut,
  Sun, Moon, Menu,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { logout } from '../../firebase/auth'
import Avatar from '../ui/Avatar'
import { Button } from '../ui/Button'
import { Separator } from '../ui/Separator'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetBody } from '../ui/Sheet'
import NotificationBell from '../notifications/NotificationBell'
import { cn } from '../../lib/utils'
import logoSvg from '../../assets/logo.svg'
import toast from 'react-hot-toast'

const NAV_LINKS = [
  { to: '/',                label: 'Home',         icon: Home },
  { to: '/discover',        label: 'Discover',     icon: Users },
  { to: '/help-board',      label: 'Help Board',   icon: HelpCircle },
  { to: '/masterclasses',   label: 'Masterclasses', icon: GraduationCap },
  { to: '/messages',        label: 'Messages',     icon: MessageSquare },
  { to: '/leaderboard',     label: 'Leaderboard',  icon: Trophy },
  { to: '/success-stories', label: 'Stories',      icon: Star },
]

export default function Navbar() {
  const { user, profile } = useAuth()
  const { dark, toggle }  = useTheme()
  const navigate          = useNavigate()

  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
    } catch {
      toast.error('Logout failed')
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/90 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <img src={logoSvg} alt="UniConnect logo" className="w-7 h-7" />
          <span className="font-bold text-base text-foreground tracking-tight hidden sm:block">
            Uni<span className="text-primary">Connect</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )
              }
            >
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost" size="icon"
            onClick={toggle}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={dark ? 'moon' : 'sun'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </motion.div>
            </AnimatePresence>
          </Button>

          {user && <NotificationBell />}

          {user && (
            <div className="hidden sm:flex items-center gap-1.5">
              <Link to={`/profile/${user.uid}`}>
                <Avatar src={profile?.photoURL} name={profile?.name} size="sm" className="hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer" />
              </Link>
              <Button variant="ghost" size="icon-sm" onClick={handleLogout} aria-label="Log out">
                <LogOut size={14} />
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu size={18} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>
                  <span className="font-bold text-foreground">Uni<span className="text-primary">Connect</span></span>
                </SheetTitle>
              </SheetHeader>
              <SheetBody>
                <nav className="flex flex-col gap-1">
                  {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === '/'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-full text-sm transition-all duration-200',
                          isActive
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        )
                      }
                    >
                      <Icon size={17} />
                      {label}
                    </NavLink>
                  ))}

                  <Separator className="my-3" />

                  <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                      cn('flex items-center gap-3 px-3 py-2.5 rounded-full text-sm transition-all duration-200',
                        isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent')
                    }
                  >
                    <Settings size={17} /> Settings
                  </NavLink>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-full text-sm text-accent-pink hover:bg-accent-pink/10 transition-colors"
                  >
                    <LogOut size={17} /> Log out
                  </button>
                </nav>
              </SheetBody>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
