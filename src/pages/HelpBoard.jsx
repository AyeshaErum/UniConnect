import { useState, useEffect } from 'react'
import { Plus, Search, ArrowUp, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import HelpPost from '../components/helpboard/HelpPost'
import Modal from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { PostSkeleton } from '../components/ui/SkeletonLoader'
import PageWrapper from '../components/layout/PageWrapper'
import { subscribeHelpPosts, createHelpPost } from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { HELP_TAGS } from '../utils/constants'
import { trackHelpPostCreated } from '../utils/analytics'
import { staggerContainer, staggerItem } from '../lib/motion'
import { cn } from '../lib/utils'
import toast from 'react-hot-toast'

export default function HelpBoard() {
  const { user } = useAuth()
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch]   = useState('')
  const [activeTag, setActiveTag] = useState('')
  const [sort, setSort]       = useState('newest')

  useEffect(() => {
    const unsub = subscribeHelpPosts(data => { setPosts(data); setLoading(false) })
    return unsub
  }, [])

  const filtered = posts
    .filter(p => {
      if (activeTag && !p.tags?.includes(activeTag)) return false
      if (search) {
        const q = search.toLowerCase()
        return p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => sort === 'upvotes'
      ? (b.upvotes || 0) - (a.upvotes || 0)
      : (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
    )

  return (
    <PageWrapper>
      <div className="container py-8 max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Help Board</h1>
            <p className="text-sm text-muted-foreground mt-1">Ask anything — your campus community has answers</p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} /> New Post
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full h-9 bg-card border border-border rounded-lg pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {[
              { key: 'newest', icon: Clock, label: 'Newest' },
              { key: 'upvotes', icon: ArrowUp, label: 'Top' },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key} onClick={() => setSort(key)}
                className={cn('flex items-center gap-1.5 px-3 py-2 text-xs transition-colors', sort === key ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent')}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tag filters */}
        <div className="flex flex-wrap gap-1.5">
          {['All', ...HELP_TAGS].map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === 'All' ? '' : t => t === tag ? '' : tag)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                (tag === 'All' ? !activeTag : activeTag === tag)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-border/80'
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="text-5xl">🤔</div>
            <h3 className="font-semibold text-foreground text-lg">No posts yet</h3>
            <p className="text-muted-foreground text-sm">Be the first to ask for help!</p>
            <Button size="sm" onClick={() => setCreateOpen(true)}><Plus size={14} /> New Post</Button>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
            {filtered.map(post => (
              <motion.div key={post.id} variants={staggerItem}>
                <HelpPost post={post} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Post a Help Request">
          <CreatePostForm onClose={() => setCreateOpen(false)} />
        </Modal>
      </div>
    </PageWrapper>
  )
}

function CreatePostForm({ onClose }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ title: '', description: '', tags: [] })
  const [loading, setLoading] = useState(false)

  function toggleTag(tag) {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setLoading(true)
    try {
      await createHelpPost({ ...form, authorId: user.uid })
      trackHelpPostCreated(form.tags)
      toast.success('Post created!')
      onClose()
    } catch { toast.error('Failed to post') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="What do you need help with?" required />
      <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} placeholder="Give more context..." />
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Tags</label>
        <div className="flex flex-wrap gap-1.5">
          {HELP_TAGS.map(tag => (
            <button key={tag} type="button" onClick={() => toggleTag(tag)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-all border', form.tags.includes(tag) ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:text-foreground')}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2 border-t border-border">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1" loading={loading}>Post</Button>
      </div>
    </form>
  )
}
