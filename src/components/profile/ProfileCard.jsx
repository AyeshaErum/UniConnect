import { Link, useNavigate } from 'react-router-dom'
import { MapPin, BookOpen, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import Avatar from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import SkillTag from './SkillTag'
import { useAuth } from '../../context/AuthContext'
import { getOrCreateConversation } from '../../firebase/firestore'
import { cn } from '../../lib/utils'
import toast from 'react-hot-toast'

const availabilityVariant = status => {
  const map = {
    'Open to connect':          'default',
    'Free this evening':        'success',
    'Available weekends':       'default',
    'Open to mentoring':        'secondary',
    'Busy this week':           'pink',
    'Available for quick help': 'success',
    'On a deadline':            'pink',
  }
  return map[status] || 'muted'
}

export default function ProfileCard({ profile }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isOwn = user?.uid === profile.id

  async function handleMessage() {
    if (!user) return
    try {
      await getOrCreateConversation(user.uid, profile.id)
      navigate('/messages', { state: { openUserId: profile.id } })
    } catch {
      toast.error('Could not open chat')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden flex flex-col"
    >
      {/* Gradient top accent */}
      <div className="h-1 bg-brand-gradient" />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Header: avatar + info */}
        <div className="flex items-start gap-3">
          <Link to={`/profile/${profile.id}`}>
            <Avatar src={profile.photoURL} name={profile.name} size="lg" />
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/profile/${profile.id}`}>
              <h3 className="font-semibold text-foreground hover:text-primary transition-colors truncate leading-tight">
                {profile.name}
              </h3>
            </Link>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <BookOpen size={11} />
              <span className="truncate">{profile.major || 'Student'}{profile.year ? ` · ${profile.year}` : ''}</span>
            </div>
            {profile.university && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin size={11} />
                <span className="truncate">{profile.university}</span>
              </div>
            )}
          </div>
        </div>

        {profile.availability && (
          <Badge variant={availabilityVariant(profile.availability)} className="self-start text-[11px]">
            {profile.availability}
          </Badge>
        )}

        {profile.bio && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{profile.bio}</p>
        )}

        {profile.teachSkills?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Teaches</p>
            <div className="flex flex-wrap gap-1">
              {profile.teachSkills.slice(0, 3).map(s => <SkillTag key={s} label={s} variant="teach" />)}
              {profile.teachSkills.length > 3 && (
                <span className="text-xs text-muted-foreground self-center">+{profile.teachSkills.length - 3}</span>
              )}
            </div>
          </div>
        )}

        <div className="flex-1" />

        {/* Action buttons */}
        {!isOwn && (
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={handleMessage}
            >
              <MessageSquare size={13} /> Message
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              asChild
            >
              <Link to={`/profile/${profile.id}`}>View Profile</Link>
            </Button>
          </div>
        )}
        {isOwn && (
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to={`/profile/${profile.id}`}>View Profile</Link>
          </Button>
        )}
      </div>
    </motion.div>
  )
}
