import { Calendar, MapPin, Users, Trash2 } from 'lucide-react'
import Badge from '../ui/Badge'
import Card from '../ui/Card'
import { rsvpEvent, unrsvpEvent, deleteEvent } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { useState } from 'react'

const typeColors = {
  'Study Group': 'teal',
  'Workshop':    'yellow',
  'Hackathon':   'coral',
  'Career Talk': 'navy',
  'Social':      'green',
  'Other':       'gray',
}

export default function EventCard({ event, onDeleted }) {
  const { user } = useAuth()
  const attending = event.attendees?.includes(user?.uid)
  const isFull    = event.maxParticipants && event.attendees?.length >= event.maxParticipants
  const isOwner   = user?.uid === event.creatorId
  const [loading, setLoading] = useState(false)

  async function handleRSVP() {
    if (!user) return
    setLoading(true)
    try {
      if (attending) {
        await unrsvpEvent(event.id, user.uid)
        toast.success('You left the event')
      } else {
        await rsvpEvent(event.id, user.uid)
        toast.success('RSVP confirmed!')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this event?')) return
    try {
      await deleteEvent(event.id)
      toast.success('Event deleted')
      onDeleted?.()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge color={typeColors[event.type] || 'gray'}>{event.type}</Badge>
            {isFull && <Badge color="red">Full</Badge>}
          </div>
          <h3 className="font-display font-semibold text-white">{event.title}</h3>
        </div>
        {isOwner && (
          <button onClick={handleDelete} className="p-1.5 text-navy-400 hover:text-accent-coral rounded-lg transition-colors shrink-0" aria-label="Delete event">
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <p className="text-sm text-navy-300 line-clamp-2">{event.description}</p>

      <div className="space-y-1.5 text-xs text-navy-400">
        <div className="flex items-center gap-1.5">
          <Calendar size={12} />
          <span>{formatDate(event.date ? { toDate: () => new Date(event.date) } : null)}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-1.5">
            <MapPin size={12} />
            <span>{event.location}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Users size={12} />
          <span>
            {event.attendees?.length || 0}
            {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} attending
          </span>
        </div>
      </div>

      <button
        onClick={handleRSVP}
        disabled={loading || (isFull && !attending)}
        className={`w-full py-2 rounded-xl text-sm font-medium transition-all ${
          attending
            ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30 hover:bg-accent-coral/15 hover:text-accent-coral hover:border-accent-coral/30'
            : isFull
            ? 'bg-navy-800 text-navy-500 cursor-not-allowed'
            : 'bg-teal-500 text-navy-950 hover:bg-teal-400'
        }`}
      >
        {attending ? 'Leave Event' : isFull ? 'Event Full' : 'RSVP'}
      </button>
    </Card>
  )
}
