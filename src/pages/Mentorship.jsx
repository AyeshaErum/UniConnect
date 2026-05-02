import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import MentorCard from '../components/mentorship/MentorCard'
import SlotForm from '../components/mentorship/SlotForm'
import Modal from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { CardSkeleton } from '../components/ui/SkeletonLoader'
import PageWrapper from '../components/layout/PageWrapper'
import { subscribeMentorshipSlots } from '../firebase/firestore'
import { staggerContainer, staggerItem } from '../lib/motion'
import { cn } from '../lib/utils'

export default function Mentorship() {
  const [slots, setSlots]     = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [filter, setFilter]   = useState('')

  useEffect(() => {
    const unsub = subscribeMentorshipSlots(data => { setSlots(data); setLoading(false) })
    return unsub
  }, [])

  const filtered = filter ? slots.filter(s => s.status === filter) : slots

  return (
    <PageWrapper>
      <div className="container py-8 max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mentorship Corner</h1>
            <p className="text-sm text-muted-foreground mt-1">Learn from seniors who've been where you're going</p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} /> Offer Mentorship
          </Button>
        </div>

        <div className="flex gap-1.5">
          {['All', 'Open', 'Booked'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s === 'All' ? '' : f => f === s ? '' : s)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                (s === 'All' ? !filter : filter === s)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">🎓</div>
            <h3 className="font-semibold text-foreground text-lg">No slots available</h3>
            <p className="text-muted-foreground text-sm">Be the first to offer mentorship!</p>
            <Button size="sm" onClick={() => setCreateOpen(true)}><Plus size={14} /> Offer Mentorship</Button>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(s => (
              <motion.div key={s.id} variants={staggerItem}>
                <MentorCard slot={s} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Mentorship Slot">
          <SlotForm onClose={() => setCreateOpen(false)} />
        </Modal>
      </div>
    </PageWrapper>
  )
}
