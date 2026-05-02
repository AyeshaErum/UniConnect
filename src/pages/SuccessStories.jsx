import { useState, useEffect } from 'react'
import { Plus, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { Textarea } from '../components/ui/Input'
import { PostSkeleton } from '../components/ui/SkeletonLoader'
import {
  subscribeSuccessStories, createSuccessStory,
  toggleLikeStory, deleteSuccessStory, getUserProfile,
} from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { timeAgo } from '../utils/helpers'
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
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Success Stories</h1>
          <p className="text-navy-400 text-sm mt-1">Celebrating wins from your campus community</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus size={15} /> Share Story
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)}</div>
      ) : stories.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🌟</div>
          <h3 className="text-white font-semibold">No stories yet</h3>
          <p className="text-navy-400 text-sm mt-1">Share your first success story!</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}><Plus size={15} /> Share Story</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {stories.map(story => (
            <StoryCard key={story.id} story={story} currentUser={user} />
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Share a Success Story">
        <CreateStoryForm onClose={() => setCreateOpen(false)} />
      </Modal>
    </div>
  )
}

function StoryCard({ story, currentUser }) {
  const [author, setAuthor] = useState(null)
  const liked = story.likes?.includes(currentUser?.uid)

  useEffect(() => {
    if (story.authorId) getUserProfile(story.authorId).then(setAuthor)
  }, [story.authorId])

  async function handleLike() {
    if (!currentUser) return
    try {
      await toggleLikeStory(story.id, currentUser.uid, liked)
    } catch {
      toast.error('Failed to update like')
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this story?')) return
    try {
      await deleteSuccessStory(story.id)
      toast.success('Story deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5 space-y-3 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${story.authorId}`}>
            <Avatar src={author?.photoURL} name={author?.name} size="md" />
          </Link>
          <div>
            <Link to={`/profile/${story.authorId}`} className="font-semibold text-sm text-white hover:text-teal-400">
              {author?.name}
            </Link>
            <p className="text-xs text-navy-400">{timeAgo(story.createdAt)}</p>
          </div>
        </div>
        {currentUser?.uid === story.authorId && (
          <button onClick={handleDelete} className="text-xs text-navy-400 hover:text-accent-coral transition-colors">Delete</button>
        )}
      </div>

      <p className="text-navy-200 text-sm leading-relaxed">{story.content}</p>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
            liked
              ? 'bg-accent-coral/20 text-accent-coral border border-accent-coral/30'
              : 'bg-navy-800 text-navy-400 border border-navy-700 hover:text-accent-coral'
          }`}
        >
          <Heart size={14} className={liked ? 'fill-current' : ''} />
          {story.likes?.length || 0}
        </button>
      </div>
    </div>
  )
}

function CreateStoryForm({ onClose }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) { toast.error('Story content is required'); return }
    setLoading(true)
    try {
      await createSuccessStory({ authorId: user.uid, content: content.trim() })
      toast.success('Story shared!')
      onClose()
    } catch {
      toast.error('Failed to share story')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        label="Your story"
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={5}
        placeholder="Share a win! Found a study partner? Landed an internship? Got help with a tough bug? Tell your campus community..."
        required
      />
      <div className="flex gap-3 pt-2 border-t border-navy-700">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1" loading={loading}>Share</Button>
      </div>
    </form>
  )
}
