import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import { trackPageView } from './utils/analytics'

import Home          from './pages/Home'
import Login         from './pages/Login'
import Signup        from './pages/Signup'
import Profile       from './pages/Profile'
import Discover      from './pages/Discover'
import HelpBoard     from './pages/HelpBoard'
import Masterclasses from './pages/Masterclasses'
import Messages      from './pages/Messages'
import Leaderboard   from './pages/Leaderboard'
import SuccessStories from './pages/SuccessStories'
import Settings      from './pages/Settings'

const PAGE_NAMES = {
  '/':                'Home',
  '/discover':        'Discover',
  '/help-board':      'Help Board',
  '/masterclasses':   'Masterclasses',
  '/messages':        'Messages',
  '/leaderboard':     'Leaderboard',
  '/success-stories': 'Success Stories',
  '/settings':        'Settings',
}

function usePageTracking() {
  const location = useLocation()
  useEffect(() => {
    const name = PAGE_NAMES[location.pathname]
      ?? (location.pathname.startsWith('/profile') ? 'Profile' : location.pathname)
    trackPageView(name)
  }, [location.pathname])
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  usePageTracking()

  return (
    <Routes>
      {/* Public auth routes — no navbar */}
      <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Protected app routes — with navbar + footer */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/"                element={<Home />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/discover"        element={<Discover />} />
                <Route path="/help-board"      element={<HelpBoard />} />
                <Route path="/masterclasses"   element={<Masterclasses />} />
                <Route path="/messages"        element={<Messages />} />
                <Route path="/leaderboard"     element={<Leaderboard />} />
                <Route path="/success-stories" element={<SuccessStories />} />
                <Route path="/settings"        element={<Settings />} />
                <Route path="*"               element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm mt-3">Loading UniConnect…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <AppRoutes />
    </div>
  )
}
