import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, HelpCircle, Calendar, GraduationCap, MessageSquare,
  Trophy, Star, ArrowRight, Zap, Database, TrendingUp, BookOpen,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import PageWrapper from '../components/layout/PageWrapper'
import { getAllUsers, getHelpPosts } from '../firebase/firestore'
import { seedDatabase } from '../utils/seedData'
import { staggerContainer, staggerItem } from '../lib/motion'
import { cn } from '../lib/utils'
import toast from 'react-hot-toast'

const SECTIONS = [
  { to: '/discover',        icon: Users,         label: 'Discover Students', desc: 'Filter by major, skills & availability', color: 'primary' },
  { to: '/help-board',      icon: HelpCircle,    label: 'Help Board',        desc: 'Ask questions, get answers fast',         color: 'warning' },
  { to: '/events',          icon: Calendar,      label: 'Events',            desc: 'Study groups, workshops & hackathons',     color: 'destructive' },
  { to: '/mentorship',      icon: GraduationCap, label: 'Mentorship',        desc: 'Learn from seniors in your field',         color: 'secondary' },
  { to: '/messages',        icon: MessageSquare, label: 'Messages',          desc: 'Real-time chat with connections',          color: 'success' },
  { to: '/leaderboard',     icon: Trophy,        label: 'Leaderboard',       desc: 'Top helpers on campus',                    color: 'warning' },
  { to: '/success-stories', icon: Star,          label: 'Success Stories',   desc: 'Inspiration from your peers',              color: 'primary' },
]

const colorMap = {
  primary:     'bg-primary/10 text-primary border-primary/20',
  secondary:   'bg-secondary/10 text-secondary border-secondary/20',
  warning:     'bg-amber-500/10 text-amber-400 border-amber-500/20',
  destructive: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  success:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

export default function Home() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({ users: 0, posts: 0 })
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    Promise.all([getAllUsers(), getHelpPosts()])
      .then(([u, p]) => setStats({ users: u.length, posts: p.length }))
      .catch(() => {})
  }, [])

  async function handleSeed() {
    setSeeding(true)
    try {
      await seedDatabase()
      toast.success('Demo data loaded!')
      setStats(s => ({ ...s, users: s.users + 5 }))
    } catch (err) {
      toast.error('Seed failed: ' + err.message)
    } finally { setSeeding(false) }
  }

  return (
    <PageWrapper>
      <div className="container py-8 space-y-10 max-w-6xl">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-8 md:p-10"
        >
          {/* Glows */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-brand-gradient opacity-20 blur-lg scale-110" />
              <Avatar src={profile?.photoURL} name={profile?.name} size="2xl" className="relative border-2 border-primary/30" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="teal">Active</Badge>
                {profile?.major && <Badge variant="muted">{profile.major}</Badge>}
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                Hey, {profile?.name?.split(' ')[0] || 'there'} 👋
              </h1>
              <p className="text-muted-foreground mt-1 max-w-lg">
                Your campus network is growing. Discover peers, share skills, and build something great together.
              </p>
              <div className="flex flex-wrap gap-3 mt-5">
                <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-4 py-2">
                  <TrendingUp size={14} className="text-primary" />
                  <span className="text-sm"><span className="font-bold text-foreground">{stats.users}</span> <span className="text-muted-foreground">students</span></span>
                </div>
                <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-4 py-2">
                  <BookOpen size={14} className="text-secondary" />
                  <span className="text-sm"><span className="font-bold text-foreground">{stats.posts}</span> <span className="text-muted-foreground">help posts</span></span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile completion nudge */}
        {profile && !profile.major && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex items-center justify-between gap-4 flex-wrap"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/15 text-primary"><Zap size={18} /></div>
              <div>
                <p className="font-semibold text-foreground">Complete your profile</p>
                <p className="text-sm text-muted-foreground">Add your major, skills &amp; bio to get discovered</p>
              </div>
            </div>
            <Link to={`/profile/${user?.uid}`}>
              <Button size="sm">Set up profile <ArrowRight size={13} /></Button>
            </Link>
          </motion.div>
        )}

        {/* Sections grid */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-foreground">Explore</h2>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {SECTIONS.map(({ to, icon: Icon, label, desc, color }) => (
              <motion.div key={to} variants={staggerItem}>
                <Link to={to} className="block h-full">
                  <motion.div
                    whileHover={{ y: -3, transition: { duration: 0.15 } }}
                    className="rounded-xl border border-border/60 bg-card p-5 h-full flex flex-col gap-3 shadow-card cursor-pointer group"
                  >
                    <div className={cn('p-2.5 rounded-xl w-fit border', colorMap[color])}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{label}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      <span>Open</span><ArrowRight size={11} />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Seed data */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-muted text-muted-foreground"><Database size={18} /></div>
              <div>
                <p className="font-semibold text-foreground text-sm">Load demo data</p>
                <p className="text-xs text-muted-foreground">Populate with sample students, posts &amp; events</p>
              </div>
            </div>
            <Button variant="muted" size="sm" onClick={handleSeed} loading={seeding}>
              {seeding ? 'Seeding...' : 'Seed Database'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
}
