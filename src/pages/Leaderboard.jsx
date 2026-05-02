import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import Avatar from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/SkeletonLoader'
import PageWrapper from '../components/layout/PageWrapper'
import { getLeaderboard } from '../firebase/firestore'
import { getBadges } from '../utils/helpers'
import { staggerContainer, staggerItem } from '../lib/motion'

const podiumConfig = [
  { rank: 2, height: 'h-20', color: 'bg-muted/80 border-border',          icon: <Medal size={16} className="text-muted-foreground" /> },
  { rank: 1, height: 'h-28', color: 'bg-amber-500/15 border-amber-500/30', icon: <Trophy size={18} className="text-amber-400" /> },
  { rank: 3, height: 'h-16', color: 'bg-orange-900/20 border-orange-800/30',icon: <Award size={14} className="text-orange-500" /> },
]

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLeaderboard().then(d => { setLeaders(d.slice(0, 50)); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  // Top 3 re-ordered for podium: [2nd, 1st, 3rd]
  const podium = [leaders[1], leaders[0], leaders[2]].filter(Boolean)

  return (
    <PageWrapper>
      <div className="container py-8 max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/15 mb-1">
            <Trophy size={28} className="text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground text-sm">Top helpers ranked by upvotes received</p>
        </div>

        {/* Podium */}
        {!loading && leaders.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-end justify-center gap-4 py-4"
          >
            {podiumConfig.map(({ rank, height, color, icon }, i) => {
              const leader = rank === 1 ? leaders[0] : rank === 2 ? leaders[1] : leaders[2]
              if (!leader) return null
              return (
                <Link key={rank} to={`/profile/${leader.id}`} className="flex flex-col items-center gap-2 group">
                  <Avatar src={leader.photoURL} name={leader.name} size={rank === 1 ? 'xl' : 'lg'} className="group-hover:ring-2 group-hover:ring-primary/40 transition-all" />
                  <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors text-center truncate max-w-[80px]">{leader.name?.split(' ')[0]}</span>
                  <div className={`${height} w-20 rounded-t-xl flex flex-col items-center justify-center gap-1 border ${color}`}>
                    {icon}
                    <span className="text-xs font-bold text-foreground">#{rank}</span>
                    <span className="text-[10px] text-muted-foreground">{leader.score}pts</span>
                  </div>
                </Link>
              )
            })}
          </motion.div>
        )}

        {/* Full list */}
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-card">
          <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-primary" />
              <h2 className="font-semibold text-sm text-foreground">Rankings</h2>
            </div>
            <span className="text-xs text-muted-foreground">{leaders.length} students</span>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-2">
                  <Skeleton className="w-8 h-5 rounded" />
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div>
                  <Skeleton className="w-12 h-8 rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="divide-y divide-border/40">
              {leaders.map((leader, i) => {
                const badges = getBadges(leader.score, leader.connections?.length)
                const icons  = [
                  <Trophy size={16} className="text-amber-400" />,
                  <Medal  size={16} className="text-muted-foreground" />,
                  <Award  size={16} className="text-orange-500" />,
                ]
                return (
                  <motion.div key={leader.id} variants={staggerItem}>
                    <Link to={`/profile/${leader.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors group">
                      <div className="w-8 flex items-center justify-center shrink-0">
                        {i < 3 ? icons[i] : <span className="text-sm text-muted-foreground font-medium">#{i + 1}</span>}
                      </div>
                      <Avatar src={leader.photoURL} name={leader.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{leader.name}</p>
                        <p className="text-xs text-muted-foreground">{leader.major} · {leader.year}</p>
                        {badges.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {badges.map(b => <Badge key={b.label} variant={b.color === 'teal' ? 'teal' : b.color === 'yellow' ? 'warning' : 'secondary'} className="text-[10px]">{b.label}</Badge>)}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-primary">{leader.score}</p>
                        <p className="text-[10px] text-muted-foreground">points</p>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
