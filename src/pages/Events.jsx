import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import EventCard from '../components/events/EventCard'
import CreateEventForm from '../components/events/CreateEventForm'
import Modal from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { CardSkeleton } from '../components/ui/SkeletonLoader'
import PageWrapper from '../components/layout/PageWrapper'
import { subscribeEvents } from '../firebase/firestore'
import { EVENT_TYPES } from '../utils/constants'
import { staggerContainer, staggerItem } from '../lib/motion'
import { cn } from '../lib/utils'

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
    <PageWrapper>
      <div className="container py-8 max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Events &amp; Groups</h1>
            <p className="text-sm text-muted-foreground mt-1">Study groups, workshops, hackathons &amp; more</p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} /> Create Event
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {['All', ...EVENT_TYPES].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t === 'All' ? '' : f => f === t ? '' : t)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                (t === 'All' ? !filter : filter === t)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              )}
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
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">📅</div>
            <h3 className="font-semibold text-foreground text-lg">No events yet</h3>
            <p className="text-muted-foreground text-sm">Create the first event on your campus!</p>
            <Button size="sm" onClick={() => setCreateOpen(true)}><Plus size={14} /> Create Event</Button>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(e => (
              <motion.div key={e.id} variants={staggerItem}>
                <EventCard event={e} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Event">
          <CreateEventForm onClose={() => setCreateOpen(false)} />
        </Modal>
      </div>
    </PageWrapper>
  )
}
