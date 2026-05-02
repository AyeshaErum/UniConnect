import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Calendar, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Avatar from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { getUserProfile, requestMentorshipSlot, deleteMentorshipSlot } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function MentorCard({ slot }) {
  const { user }  = useAuth()
  const [mentor, setMentor] = useState(null)
  const [loading, setLoading] = useState(false)
  const isOwner   = user?.uid === slot.mentorId
  const isRequester = user?.uid === slot.requestedBy
  const isOpen    = slot.status === 'Open'

  useEffect(() => { getUserProfile(slot.mentorId).then(setMentor) }, [slot.mentorId])

  async function handleRequest() {
    setLoading(true)
    try { await requestMentorshipSlot(slot.id, user.uid, slot.mentorId); toast.success('Slot requested!') }
    catch { toast.error('Failed to request') }
    finally { setLoading(false) }
  }

  async function handleDelete() {
    if (!confirm('Delete this slot?')) return
    try { await deleteMentorshipSlot(slot.id); toast.success('Deleted') }
    catch { toast.error('Failed to delete') }
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="rounded-xl border border-border/60 bg-card p-5 flex flex-col gap-3 shadow-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${slot.mentorId}`}>
            <Avatar src={mentor?.photoURL} name={mentor?.name} size="md" />
          </Link>
          <div>
            <Link to={`/profile/${slot.mentorId}`} className="font-semibold text-sm text-foreground hover:text-primary transition-colors">
              {mentor?.name || '…'}
            </Link>
            <p className="text-xs text-muted-foreground">{mentor?.major} · {mentor?.year}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isOpen ? 'teal' : 'muted'}>{slot.status}</Badge>
          {isOwner && (
            <Button variant="ghost" size="icon-sm" onClick={handleDelete} aria-label="Delete slot">
              <Trash2 size={13} className="text-muted-foreground hover:text-destructive" />
            </Button>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-foreground text-sm">{slot.topic}</h3>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><Clock size={11} />{slot.duration} min</div>
        <div className="flex items-center gap-1"><Calendar size={11} />{slot.availability}</div>
      </div>

      {!isOwner && (
        <Button
          variant={isRequester ? 'outline' : 'default'}
          size="sm"
          className="w-full mt-auto"
          onClick={handleRequest}
          loading={loading}
          disabled={!isOpen || isRequester}
        >
          {isRequester ? 'Requested' : isOpen ? 'Request Slot' : 'Slot Booked'}
        </Button>
      )}
    </motion.div>
  )
}
