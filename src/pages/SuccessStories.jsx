import { useState, useEffect } from 'react'
import { Plus, Heart, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Input'
import { PostSkeleton } from '../components/ui/SkeletonLoader'
import PageWrapper from '../components/layout/PageWrapper'
import {
  subscribeSuccessStories, createSuccessStory,
  toggleLikeStory, deleteSuccessStory, getUserProfile,
} from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { timeAgo } from '../utils/helpers'
import { staggerContainer, staggerItem } from '../lib/motion'
import toast from 'react-hot-toast'

export default function SuccessStories() {
  const { user } = useAuth()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    const unsub = subscribeSuccessStories(data => { setStories(data); setLoading(false) })
    return unsub
  }, [])

  return (
    <PageWrapper>
      <div className="container py-8 max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Success Stories</h1>
            <p className="text-sm text-muted-foreground mt-1">Celebrating wins from your campus community</p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} /> Share Story
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)}</div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">🌟</div>
            <h3 className="font-semibold text-foreground text-lg">No stories yet</h3>
            <p className="text-muted-foreground text-sm">Share your first success story!</p>
            <Button size="sm" onClick={() => setCreateOpen(true)}><Plus size={14} /> Share Story</Button>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
            {stories.map(story => (
              <motion.div key={story.id} variants={staggerItem}>
                <StoryCard story={story} currentUser={user} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Share a Success Story">
          <CreateStoryForm onClose={() => setCreateOpen(false)} />
        </Modal>
      </div>
    </PageWrapper>
  )
}

function StoryCard({ story, currentUser }) {
  const [author, setAuthor] = useState(null)
  const liked = story.likes?.includes(currentUser?.uid)

  useEffect(() => { if (story.authorId) getUserProfile(story.authorId).then(setAuthor) }, [story.authorId])

  async function handleLike() {
    if (!currentUser) return
    try { await toggleLikeStory(story.id, currentUser.uid, liked) }
    catch { toast.error('Failed to update') }
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="rounded-xl border border-border/60 bg-card p-5 space-y-3 shadow-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${story.authorId}`}>
            <Avatar src={author?.photoURL} name={author?.name} size="md" />
          </Link>
          <div>
            <Link to={`/profile/${story.authorId}`} className="font-semibold text-sm text-foreground hover:text-primary transition-colors">
              {author?.name}
            </Link>
            <p className="text-xs text-muted-foreground">{timeAgo(story.createdAt)}</p>
          </div>
        </div>
        {currentUser?.uid === story.authorId && (
          <Button variant="ghost" size="icon-sm" onClick={async () => { if (confirm('Delete?')) { try { await deleteSuccessStory(story.id); toast.success('Deleted') } catch { toast.error('Failed') } } }}>
            <Trash2 size={13} className="text-muted-foreground hover:text-destructive" />
          </Button>
        )}
      </div>

      <p className="text-sm text-foreground/80 leading-relaxed">{story.content}</p>

      <button
        onClick={handleLike}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all border ${
          liked
            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            : 'bg-muted/40 text-muted-foreground border-border/60 hover:text-rose-400 hover:border-rose-500/30'
        }`}
      >
        <Heart size={13} className={liked ? 'fill-current' : ''} />
        {story.likes?.length || 0}
      </button>
    </motion.div>
  )
}

function CreateStoryForm({ onClose }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) { toast.error('Write your story first'); return }
    setLoading(true)
    try {
      await createSuccessStory({ authorId: user.uid, content: content.trim() })
      toast.success('Story shared!')
      onClose()
    } catch { toast.error('Failed') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        label="Your story"
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={5}
        placeholder="Share a win! Found a study partner? Landed an internship? Tell your campus community..."
        required
      />
      <div className="flex gap-3 pt-2 border-t border-border">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1" loading={loading}>Share</Button>
      </div>
    </form>
  )
}
