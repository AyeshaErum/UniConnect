import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Medal, Award } from 'lucide-react'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import { CardSkeleton } from '../components/ui/SkeletonLoader'
import { getLeaderboard } from '../firebase/firestore'
import { getBadges } from '../utils/helpers'

const rankIcons = [
  <Trophy size={18} className="text-accent-yellow" />,
  <Medal  size={18} className="text-navy-300" />,
  <Award  size={18} className="text-amber-600" />,
]

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView]       = useState('all')

  useEffect(() => {
    getLeaderboard()
      .then(data => { setLeaders(data.slice(0, 50)); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <div className="inline-flex p-3 rounded-2xl bg-accent-yellow/15 mb-3">
          <Trophy size={32} className="text-accent-yellow" />
        </div>
        <h1 className="font-display text-3xl font-bold text-white">Leaderboard</h1>
        <p className="text-navy-400 text-sm mt-1">Top helpers ranked by upvotes received</p>
      </div>

      {/* Top 3 podium */}
      {!loading && leaders.length >= 3 && (
        <div className="flex items-end justify-center gap-4 py-6">
          {[leaders[1], leaders[0], leaders[2]].map((leader, i) => {
            const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3
            const heights    = ['h-20', 'h-28', 'h-16']
            return (
              <Link key={leader.id} to={`/profile/${leader.id}`} className="flex flex-col items-center gap-2 group">
                <Avatar src={leader.photoURL} name={leader.name} size={actualRank === 1 ? 'xl' : 'lg'} />
                <span className="text-xs font-medium text-white group-hover:text-teal-400 transition-colors">{leader.name}</span>
                <div className={`${heights[i]} w-20 rounded-t-xl flex items-center justify-center text-sm font-bold ${
                  actualRank === 1 ? 'bg-accent-yellow/30 text-accent-yellow' :
                  actualRank === 2 ? 'bg-navy-700 text-navy-300' : 'bg-amber-900/40 text-amber-500'
                }`}>
                  #{actualRank}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Full list */}
      <div className="bg-navy-900 border border-navy-700 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-navy-700 flex items-center justify-between">
          <h2 className="font-semibold text-sm text-white">Rankings</h2>
          <span className="text-xs text-navy-400">{leaders.length} students</span>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-12 text-navy-400">
            <p>No data yet. Start helping your peers!</p>
          </div>
        ) : (
          <div className="divide-y divide-navy-800">
            {leaders.map((leader, i) => {
              const badges = getBadges(leader.score, leader.connections?.length)
              return (
                <Link
                  key={leader.id}
                  to={`/profile/${leader.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-navy-800 transition-colors"
                >
                  <div className="w-8 flex items-center justify-center shrink-0">
                    {i < 3 ? rankIcons[i] : <span className="text-sm text-navy-400 font-medium">#{i + 1}</span>}
                  </div>
                  <Avatar src={leader.photoURL} name={leader.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white truncate">{leader.name}</p>
                    <p className="text-xs text-navy-400">{leader.major} · {leader.year}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {badges.map(b => <Badge key={b.label} color={b.color} size="xs">{b.label}</Badge>)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-teal-400">{leader.score}</p>
                    <p className="text-xs text-navy-400">points</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
