import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, HelpCircle, Calendar, GraduationCap,
  MessageSquare, Trophy, Star, ArrowRight, Zap, Database,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import { getAllUsers, getHelpPosts } from '../firebase/firestore'
import { seedDatabase } from '../utils/seedData'
import toast from 'react-hot-toast'

const SECTIONS = [
  { to: '/discover',        icon: Users,         label: 'Discover Students', desc: 'Find peers, filter by major & skills', color: 'teal' },
  { to: '/help-board',      icon: HelpCircle,    label: 'Help Board',        desc: 'Ask questions, get answers fast',      color: 'yellow' },
  { to: '/events',          icon: Calendar,      label: 'Events',            desc: 'Study groups, workshops & hackathons', color: 'coral' },
  { to: '/mentorship',      icon: GraduationCap, label: 'Mentorship',        desc: 'Learn from seniors in your field',     color: 'navy' },
  { to: '/messages',        icon: MessageSquare, label: 'Messages',          desc: 'Chat with your connections',           color: 'green' },
  { to: '/leaderboard',     icon: Trophy,        label: 'Leaderboard',       desc: 'Top helpers on campus',                color: 'yellow' },
  { to: '/success-stories', icon: Star,          label: 'Success Stories',   desc: 'Inspiration from your peers',          color: 'teal' },
]

const iconColors = {
  teal:   'bg-teal-500/15 text-teal-400',
  yellow: 'bg-accent-yellow/15 text-accent-yellow',
  coral:  'bg-accent-coral/15 text-accent-coral',
  navy:   'bg-navy-700 text-navy-300',
  green:  'bg-accent-green/15 text-accent-green',
}

export default function Home() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({ users: 0, posts: 0 })
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    Promise.all([getAllUsers(), getHelpPosts()])
      .then(([users, posts]) => setStats({ users: users.length, posts: posts.length }))
      .catch(() => {})
  }, [])

  async function handleSeed() {
    setSeeding(true)
    try {
      await seedDatabase()
      toast.success('Demo data loaded! Refresh pages to see content.')
      setStats(s => ({ ...s, users: s.users + 5 }))
    } catch (err) {
      toast.error('Seed failed: ' + err.message)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 border border-navy-700 p-8 md:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <Avatar src={profile?.photoURL} name={profile?.name} size="lg" />
            <div>
              <p className="text-navy-300 text-sm">Welcome back,</p>
              <h1 className="font-display text-2xl font-bold text-white">
                {profile?.name || user?.displayName || 'Student'} 👋
              </h1>
            </div>
          </div>
          <p className="text-navy-300 max-w-xl">
            Your campus network is growing. Discover peers, share skills, and build something great together.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-navy-800 rounded-xl px-4 py-2 text-sm">
              <span className="text-teal-400 font-bold text-lg">{stats.users}</span>
              <span className="text-navy-400 ml-1">students</span>
            </div>
            <div className="bg-navy-800 rounded-xl px-4 py-2 text-sm">
              <span className="text-accent-yellow font-bold text-lg">{stats.posts}</span>
              <span className="text-navy-400 ml-1">help posts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-white">Explore UniConnect</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {SECTIONS.map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to}>
              <Card hover className="p-5 h-full">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${iconColors[color]}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm">{label}</h3>
                    <p className="text-xs text-navy-400 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                  <ArrowRight size={14} className="text-navy-500 shrink-0 mt-0.5" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Profile completion nudge */}
      {profile && !profile.major && (
        <Card className="p-5 border-teal-500/30 bg-teal-500/5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400">
                <Zap size={20} />
              </div>
              <div>
                <p className="font-semibold text-white">Complete your profile</p>
                <p className="text-sm text-navy-400">Add your major, skills & bio to get discovered</p>
              </div>
            </div>
            <Link to={`/profile/${user?.uid}`}>
              <button className="px-4 py-2 bg-teal-500 text-navy-950 rounded-xl text-sm font-semibold hover:bg-teal-400 transition-colors">
                Set up profile
              </button>
            </Link>
          </div>
        </Card>
      )}

      {/* Seed data button — useful for first-run demo */}
      <Card className="p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-navy-700 text-navy-300">
              <Database size={20} />
            </div>
            <div>
              <p className="font-semibold text-white">Load demo data</p>
              <p className="text-sm text-navy-400">Populate with sample students, posts & events</p>
            </div>
          </div>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {seeding ? 'Loading...' : 'Seed Database'}
          </button>
        </div>
      </Card>
    </div>
  )
}
