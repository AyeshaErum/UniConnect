import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import MentorCard from '../components/mentorship/MentorCard'
import SlotForm from '../components/mentorship/SlotForm'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { CardSkeleton } from '../components/ui/SkeletonLoader'
import { subscribeMentorshipSlots } from '../firebase/firestore'
import { MAJORS } from '../utils/constants'
import { Select } from '../components/ui/Input'

export default function Mentorship() {
  const [slots, setSlots]     = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [filter, setFilter]   = useState({ status: '', major: '' })

  useEffect(() => {
    const unsub = subscribeMentorshipSlots(data => { setSlots(data); setLoading(false) })
    return unsub
  }, [])

  const filtered = slots.filter(s => {
    if (filter.status && s.status !== filter.status) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Mentorship Corner</h1>
          <p className="text-navy-400 text-sm mt-1">Learn from seniors who've been where you're going</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus size={15} /> Offer Mentorship
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-2">
          {['', 'Open', 'Booked'].map(s => (
            <button
              key={s} onClick={() => setFilter(f => ({ ...f, status: s }))}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter.status === s ? 'bg-teal-500 text-navy-950' : 'bg-navy-800 text-navy-300 hover:text-white'}`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-white font-semibold">No mentorship slots available</h3>
          <p className="text-navy-400 text-sm mt-1">Be the first to offer mentorship!</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}><Plus size={15} /> Offer Mentorship</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => <MentorCard key={s.id} slot={s} />)}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Mentorship Slot">
        <SlotForm onClose={() => setCreateOpen(false)} />
      </Modal>
    </div>
  )
}
