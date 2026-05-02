import { useState } from 'react'
import { Send } from 'lucide-react'
import { addReply } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function ReplyForm({ postId }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    try {
      await addReply(postId, { authorId: user.uid, content: content.trim() })
      setContent('')
      toast.success('Reply posted!')
    } catch { toast.error('Failed to post reply') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Write a reply..."
        className="flex-1 h-9 bg-background border border-input rounded-lg px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="h-9 w-9 flex items-center justify-center bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-lg text-primary-foreground transition-colors shrink-0"
      >
        <Send size={14} />
      </button>
    </form>
  )
}
