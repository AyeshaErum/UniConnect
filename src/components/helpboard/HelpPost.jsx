import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, CheckCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import UpvoteButton from './UpvoteButton'
import ReplyForm from './ReplyForm'
import { getUserProfile, upvoteHelpPost, upvoteReply, resolveHelpPost, deleteHelpPost, subscribeReplies } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import { timeAgo } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function HelpPost({ post, onDeleted }) {
  const { user } = useAuth()
  const [author, setAuthor] = useState(null)
  const [replies, setReplies] = useState([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    getUserProfile(post.authorId).then(setAuthor)
  }, [post.authorId])

  useEffect(() => {
    if (!expanded) return
    const unsub = subscribeReplies(post.id, setReplies)
    return unsub
  }, [expanded, post.id])

  async function handleDelete() {
    if (!confirm('Delete this post?')) return
    try {
      await deleteHelpPost(post.id)
      toast.success('Post deleted')
      onDeleted?.()
    } catch {
      toast.error('Failed to delete')
    }
  }

  async function handleResolve() {
    try {
      await resolveHelpPost(post.id)
      toast.success('Marked as resolved!')
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5 space-y-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Link to={`/profile/${post.authorId}`}>
            <Avatar src={author?.photoURL} name={author?.name} size="sm" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link to={`/profile/${post.authorId}`} className="text-sm font-medium text-white hover:text-teal-400">
                {author?.name || 'Loading...'}
              </Link>
              <span className="text-xs text-navy-400">{timeAgo(post.createdAt)}</span>
              {post.resolved && (
                <Badge color="green" size="xs"><CheckCircle size={10} className="mr-1" />Resolved</Badge>
              )}
            </div>
            <h3 className="font-semibold text-white mt-0.5">{post.title}</h3>
          </div>
        </div>
        {user?.uid === post.authorId && (
          <div className="flex items-center gap-1 shrink-0">
            {!post.resolved && (
              <button onClick={handleResolve} className="p-1.5 rounded-lg text-accent-green hover:bg-accent-green/10 transition-colors" aria-label="Mark resolved">
                <CheckCircle size={15} />
              </button>
            )}
            <button onClick={handleDelete} className="p-1.5 rounded-lg text-navy-400 hover:text-accent-coral hover:bg-accent-coral/10 transition-colors" aria-label="Delete post">
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      <p className="text-sm text-navy-300">{post.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {post.tags?.map(tag => (
          <Badge key={tag} color="navy" size="xs">{tag}</Badge>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <UpvoteButton count={post.upvotes} onUpvote={() => upvoteHelpPost(post.id)} />
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 text-sm text-navy-400 hover:text-teal-400 transition-colors"
        >
          <MessageSquare size={14} />
          {replies.length > 0 ? `${replies.length} replies` : 'Reply'}
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Replies */}
      {expanded && (
        <div className="border-t border-navy-700 pt-3 space-y-3 animate-fade-in">
          {replies.map(reply => (
            <ReplyItem key={reply.id} reply={reply} postId={post.id} />
          ))}
          {replies.length === 0 && (
            <p className="text-xs text-navy-400 text-center py-2">No replies yet. Be the first!</p>
          )}
          <ReplyForm postId={post.id} authorId={post.authorId} />
        </div>
      )}
    </div>
  )
}

function ReplyItem({ reply, postId }) {
  const [author, setAuthor] = useState(null)
  useEffect(() => {
    if (reply.authorId) getUserProfile(reply.authorId).then(setAuthor)
  }, [reply.authorId])

  return (
    <div className="flex gap-2.5">
      <Link to={`/profile/${reply.authorId}`}>
        <Avatar src={author?.photoURL} name={author?.name} size="xs" />
      </Link>
      <div className="flex-1 bg-navy-800 rounded-xl px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white">{author?.name}</span>
          <span className="text-xs text-navy-400">{timeAgo(reply.createdAt)}</span>
        </div>
        <p className="text-sm text-navy-200 mt-0.5">{reply.content}</p>
        <div className="mt-1.5">
          <UpvoteButton count={reply.upvotes} onUpvote={() => upvoteReply(postId, reply.id)} size="sm" />
        </div>
      </div>
    </div>
  )
}
