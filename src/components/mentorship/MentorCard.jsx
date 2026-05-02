import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Calendar, Trash2 } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import Card from '../ui/Card'
import { getUserProfile, requestMentorshipSlot, deleteMentorshipSlot } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function MentorCard({ slot, onDeleted }) {
  const { user } = useAuth()
  const [mentor, setMentor] = useState(null)
  const [loading, setLoading] = useState(false)
  const isOwner    = user?.uid === slot.mentorId
  const isRequester = user?.uid === slot.requestedBy
  const isOpen     = slot.status === 'Open'

  useEffect(() => {
    getUserProfile(slot.mentorId).then(setMentor)
  }, [slot.mentorId])

  async function handleRequest() {
    setLoading(true)
    try {
      await requestMentorshipSlot(slot.id, user.uid, slot.mentorId)
      toast.success('Mentorship slot requested!')
    } catch {
      toast.error('Failed to request slot')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this slot?')) return
    try {
      await deleteMentorshipSlot(slot.id)
      toast.success('Slot deleted')
      onDeleted?.()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${slot.mentorId}`}>
            <Avatar src={mentor?.photoURL} name={mentor?.name} size="md" />
          </Link>
          <div>
            <Link to={`/profile/${slot.mentorId}`} className="font-semibold text-white hover:text-teal-400 transition-colors text-sm">
              {mentor?.name || 'Loading...'}
            </Link>
            <p className="text-xs text-navy-400">{mentor?.major} · {mentor?.year}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={isOpen ? 'teal' : 'gray'}>{slot.status}</Badge>
          {isOwner && (
            <button onClick={handleDelete} className="p-1.5 text-navy-400 hover:text-accent-coral rounded-lg transition-colors" aria-label="Delete slot">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-display font-semibold text-white">{slot.topic}</h3>
      </div>

      <div className="flex items-center gap-4 text-xs text-navy-400">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{slot.duration} min</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{slot.availability}</span>
        </div>
      </div>

      {!isOwner && (
        <button
          onClick={handleRequest}
          disabled={loading || !isOpen || isRequester}
          className={`w-full py-2 rounded-xl text-sm font-medium transition-all ${
            isRequester
              ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30 cursor-default'
              : !isOpen
              ? 'bg-navy-800 text-navy-500 cursor-not-allowed'
              : 'bg-teal-500 text-navy-950 hover:bg-teal-400'
          }`}
        >
          {isRequester ? 'Requested' : isOpen ? 'Request Slot' : 'Slot Booked'}
        </button>
      )}
    </Card>
  )
}
