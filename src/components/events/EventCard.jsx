import { useState } from 'react'
import { Calendar, MapPin, Users, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { rsvpEvent, unrsvpEvent, deleteEvent } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const typeVariant = {
  'Study Group': 'teal',
  'Workshop':    'warning',
  'Hackathon':   'destructive',
  'Career Talk': 'purple',
  'Social':      'success',
  'Other':       'muted',
}

export default function EventCard({ event }) {
  const { user }    = useAuth()
  const attending   = event.attendees?.includes(user?.uid)
  const isFull      = event.maxParticipants && event.attendees?.length >= event.maxParticipants
  const isOwner     = user?.uid === event.creatorId
  const [loading, setLoading] = useState(false)

  async function handleRSVP() {
    if (!user) return
    setLoading(true)
    try {
      if (attending) { await unrsvpEvent(event.id, user.uid); toast.success('Left event') }
      else           { await rsvpEvent(event.id, user.uid);   toast.success('RSVP confirmed!') }
    } catch { toast.error('Something went wrong') }
    finally { setLoading(false) }
  }

  async function handleDelete() {
    if (!confirm('Delete this event?')) return
    try { await deleteEvent(event.id); toast.success('Event deleted') }
    catch { toast.error('Failed to delete') }
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="rounded-xl border border-border/60 bg-card p-5 flex flex-col gap-3 shadow-card"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant={typeVariant[event.type] || 'muted'}>{event.type}</Badge>
            {isFull && <Badge variant="destructive">Full</Badge>}
          </div>
          <h3 className="font-semibold text-foreground">{event.title}</h3>
        </div>
        {isOwner && (
          <Button variant="ghost" size="icon-sm" onClick={handleDelete} aria-label="Delete event">
            <Trash2 size={13} className="text-muted-foreground hover:text-destructive" />
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

      <div className="space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5"><Calendar size={11} /><span>{formatDate(event.date ? { toDate: () => new Date(event.date) } : null)}</span></div>
        {event.location && <div className="flex items-center gap-1.5"><MapPin size={11} /><span>{event.location}</span></div>}
        <div className="flex items-center gap-1.5">
          <Users size={11} />
          <span>{event.attendees?.length || 0}{event.maxParticipants ? ` / ${event.maxParticipants}` : ''} attending</span>
        </div>
      </div>

      <div className="mt-auto">
        <Button
          variant={attending ? 'outline' : 'default'}
          size="sm"
          className="w-full"
          onClick={handleRSVP}
          loading={loading}
          disabled={isFull && !attending}
        >
          {attending ? 'Leave Event' : isFull ? 'Event Full' : 'RSVP'}
        </Button>
      </div>
    </motion.div>
  )
}
