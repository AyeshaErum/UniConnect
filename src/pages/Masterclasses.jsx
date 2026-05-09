import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import ClassCard from '../components/masterclasses/ClassCard'
import CreateClassModal from '../components/masterclasses/CreateClassModal'
import Modal from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { CardSkeleton } from '../components/ui/SkeletonLoader'
import PageWrapper from '../components/layout/PageWrapper'
import { subscribeMasterclasses } from '../firebase/firestore'
import { staggerContainer, staggerItem } from '../lib/motion'
import { cn } from '../lib/utils'

const TOPICS = ['All', 'Programming', 'Cybersecurity', 'Math', 'Data Science', 'Design', 'Career']

export default function Masterclasses() {
  const [classes, setClasses]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [topic, setTopic]       = useState('All')
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    const unsub = subscribeMasterclasses(data => { setClasses(data); setLoading(false) })
    return unsub
  }, [])

  const filtered = topic === 'All' ? classes : classes.filter(c => c.topic === topic)

  return (
    <PageWrapper>
      <div className="container py-8 max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Masterclasses 🎓</h1>
          <p className="text-sm text-muted-foreground mt-1">Live sessions from your peers and mentors</p>
        </div>

        {/* Filter bar */}
        <div className="flex gap-1.5 flex-wrap">
          {TOPICS.map(t => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                topic === t
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">🎓</div>
            <h3 className="font-semibold text-foreground text-lg">No classes yet</h3>
            <p className="text-muted-foreground text-sm">Be the first to schedule a live session!</p>
            <Button size="sm" onClick={() => setCreateOpen(true)}><Plus size={14} /> Add Class</Button>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map(cls => (
              <motion.div key={cls.id} variants={staggerItem}>
                <ClassCard cls={cls} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Floating Add button */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-5 py-3 text-sm font-semibold shadow-lg hover:bg-primary/90 transition-colors"
      >
        <Plus size={16} /> Add Class
      </button>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Schedule a Masterclass" size="lg">
        <CreateClassModal onClose={() => setCreateOpen(false)} />
      </Modal>
    </PageWrapper>
  )
}
