import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import EventCard from '../components/events/EventCard'
import CreateEventForm from '../components/events/CreateEventForm'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { CardSkeleton } from '../components/ui/SkeletonLoader'
import { subscribeEvents } from '../firebase/firestore'
import { EVENT_TYPES } from '../utils/constants'

export default function Events() {
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [filter, setFilter]   = useState('')

  useEffect(() => {
    const unsub = subscribeEvents(data => { setEvents(data); setLoading(false) })
    return unsub
  }, [])

  const filtered = filter ? events.filter(e => e.type === filter) : events

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Events & Groups</h1>
          <p className="text-navy-400 text-sm mt-1">Study groups, workshops, hackathons & more</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus size={15} /> Create Event
        </Button>
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!filter ? 'bg-teal-500 text-navy-950' : 'bg-navy-800 text-navy-300 hover:text-white'}`}
        >
          All
        </button>
        {EVENT_TYPES.map(t => (
          <button
            key={t} onClick={() => setFilter(f => f === t ? '' : t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === t ? 'bg-teal-500 text-navy-950' : 'bg-navy-800 text-navy-300 hover:text-white'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-white font-semibold">No events yet</h3>
          <p className="text-navy-400 text-sm mt-1">Create the first event on your campus!</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}><Plus size={15} /> Create Event</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(e => <EventCard key={e.id} event={e} />)}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Event">
        <CreateEventForm onClose={() => setCreateOpen(false)} />
      </Modal>
    </div>
  )
}
