import { Link } from 'react-router-dom'
import { MapPin, BookOpen, UserPlus, Check } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import SkillTag from './SkillTag'
import { availabilityColor } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import { sendConnectionRequest, removeConnection } from '../../firebase/firestore'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function ProfileCard({ profile }) {
  const { user, profile: myProfile } = useAuth()
  const isOwn = user?.uid === profile.id
  const [connected, setConnected] = useState(
    myProfile?.connections?.includes(profile.id) || false
  )
  const [loading, setLoading] = useState(false)

  async function handleConnect() {
    if (!user) return
    setLoading(true)
    try {
      if (connected) {
        await removeConnection(user.uid, profile.id)
        setConnected(false)
        toast.success('Connection removed')
      } else {
        await sendConnectionRequest(user.uid, profile.id)
        setConnected(true)
        toast.success(`Connection request sent to ${profile.name}`)
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card hover className="p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <Link to={`/profile/${profile.id}`}>
          <Avatar src={profile.photoURL} name={profile.name} size="lg" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${profile.id}`}>
            <h3 className="font-display font-semibold text-white hover:text-teal-400 transition-colors truncate">
              {profile.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 text-xs text-navy-400 mt-0.5">
            <BookOpen size={11} />
            <span className="truncate">{profile.major} · {profile.year}</span>
          </div>
          {profile.university && (
            <div className="flex items-center gap-1 text-xs text-navy-400 mt-0.5">
              <MapPin size={11} />
              <span className="truncate">{profile.university}</span>
            </div>
          )}
        </div>
      </div>

      {profile.availability && (
        <Badge color={availabilityColor(profile.availability)} size="xs">
          {profile.availability}
        </Badge>
      )}

      {profile.bio && (
        <p className="text-xs text-navy-300 line-clamp-2">{profile.bio}</p>
      )}

      {profile.teachSkills?.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-navy-400">Teaches</p>
          <div className="flex flex-wrap gap-1">
            {profile.teachSkills.slice(0, 3).map(s => (
              <SkillTag key={s} label={s} variant="teach" />
            ))}
            {profile.teachSkills.length > 3 && (
              <span className="text-xs text-navy-400">+{profile.teachSkills.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {!isOwn && (
        <button
          onClick={handleConnect}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all ${
            connected
              ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30 hover:bg-accent-coral/15 hover:text-accent-coral hover:border-accent-coral/30'
              : 'bg-teal-500 text-navy-950 hover:bg-teal-400'
          }`}
        >
          {connected ? <><Check size={14} /> Connected</> : <><UserPlus size={14} /> Connect</>}
        </button>
      )}
    </Card>
  )
}
