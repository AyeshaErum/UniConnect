import { useState, useEffect } from 'react'
import { Plus, Search, X, ArrowUp, Clock } from 'lucide-react'
import HelpPost from '../components/helpboard/HelpPost'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { Textarea } from '../components/ui/Input'
import Input from '../components/ui/Input'
import { PostSkeleton } from '../components/ui/SkeletonLoader'
import { subscribeHelpPosts, createHelpPost } from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { HELP_TAGS } from '../utils/constants'
import toast from 'react-hot-toast'

export default function HelpBoard() {
  const { user } = useAuth()
  const [posts, setPosts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState('')
  const [sort, setSort]     = useState('newest')

  useEffect(() => {
    const unsub = subscribeHelpPosts(data => {
      setPosts(data)
      setLoading(false)
    })
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
    .sort((a, b) => {
      if (sort === 'upvotes') return (b.upvotes || 0) - (a.upvotes || 0)
      const ta = a.createdAt?.seconds || 0
      const tb = b.createdAt?.seconds || 0
      return tb - ta
    })

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Help Board</h1>
          <p className="text-navy-400 text-sm mt-1">Ask anything — your campus community has answers</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus size={15} /> New Post
        </Button>
      </div>

      {/* Search + sort */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full bg-navy-800 border border-navy-600 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSort('newest')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors ${sort === 'newest' ? 'bg-teal-500/15 text-teal-400' : 'bg-navy-800 text-navy-400 hover:text-white'}`}
          >
            <Clock size={13} /> Newest
          </button>
          <button
            onClick={() => setSort('upvotes')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors ${sort === 'upvotes' ? 'bg-teal-500/15 text-teal-400' : 'bg-navy-800 text-navy-400 hover:text-white'}`}
          >
            <ArrowUp size={13} /> Top
          </button>
        </div>
      </div>

      {/* Tag filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTag('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!activeTag ? 'bg-teal-500 text-navy-950' : 'bg-navy-800 text-navy-300 hover:text-white'}`}
        >
          All
        </button>
        {HELP_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(t => t === tag ? '' : tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTag === tag ? 'bg-teal-500 text-navy-950' : 'bg-navy-800 text-navy-300 hover:text-white'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🤔</div>
          <h3 className="text-white font-semibold">No posts yet</h3>
          <p className="text-navy-400 text-sm mt-1">Be the first to ask for help!</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}><Plus size={15} /> New Post</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(post => <HelpPost key={post.id} post={post} />)}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Post a Help Request">
        <CreatePostForm onClose={() => setCreateOpen(false)} />
      </Modal>
    </div>
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
      toast.success('Post created!')
      onClose()
    } catch {
      toast.error('Failed to post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="What do you need help with?" required />
      <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} placeholder="Give more context..." />
      <div className="space-y-2">
        <label className="text-sm font-medium text-navy-200">Tags</label>
        <div className="flex flex-wrap gap-2">
          {HELP_TAGS.map(tag => (
            <button
              key={tag} type="button" onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                form.tags.includes(tag) ? 'bg-teal-500 text-navy-950' : 'bg-navy-800 text-navy-300 hover:text-white border border-navy-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2 border-t border-navy-700">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1" loading={loading}>Post</Button>
      </div>
    </form>
  )
}
