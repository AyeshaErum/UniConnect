import { useState } from 'react'
import { Send } from 'lucide-react'
import { addReply } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function ReplyForm({ postId, authorId }) {
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
    } catch {
      toast.error('Failed to post reply')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
      <input
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Write a reply..."
        className="flex-1 bg-navy-800 border border-navy-700 rounded-xl px-3 py-2 text-sm text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
      />
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="p-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 rounded-xl text-navy-950 transition-colors"
        aria-label="Send reply"
      >
        <Send size={16} />
      </button>
    </form>
  )
}
