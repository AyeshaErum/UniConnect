import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, CheckCircle2, Trash2, ChevronDown, ChevronUp, ArrowUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Avatar from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import ReplyForm from './ReplyForm'
import { getUserProfile, upvoteHelpPost, upvoteReply, resolveHelpPost, deleteHelpPost, subscribeReplies } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import { timeAgo } from '../../utils/helpers'
import { cn } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function HelpPost({ post }) {
  const { user } = useAuth()
  const [author, setAuthor]   = useState(null)
  const [replies, setReplies] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [voted, setVoted]     = useState(false)
  const [localCount, setLocalCount] = useState(post.upvotes || 0)

  useEffect(() => { getUserProfile(post.authorId).then(setAuthor) }, [post.authorId])

  useEffect(() => {
    if (!expanded) return
    const unsub = subscribeReplies(post.id, setReplies)
    return unsub
  }, [expanded, post.id])

  async function handleUpvote() {
    if (voted) return
    setVoted(true); setLocalCount(c => c + 1)
    try { await upvoteHelpPost(post.id) }
    catch { setVoted(false); setLocalCount(c => c - 1) }
  }

  async function handleDelete() {
    if (!confirm('Delete this post?')) return
    try { await deleteHelpPost(post.id); toast.success('Deleted') }
    catch { toast.error('Failed to delete') }
  }

  async function handleResolve() {
    try { await resolveHelpPost(post.id); toast.success('Marked resolved!') }
    catch { toast.error('Failed to update') }
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3 shadow-card">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Link to={`/profile/${post.authorId}`}>
            <Avatar src={author?.photoURL} name={author?.name} size="sm" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link to={`/profile/${post.authorId}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                {author?.name || '…'}
              </Link>
              <span className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</span>
              {post.resolved && (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 size={10} /> Resolved
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-foreground mt-0.5">{post.title}</h3>
          </div>
        </div>
        {user?.uid === post.authorId && (
          <div className="flex items-center gap-1 shrink-0">
            {!post.resolved && (
              <Button variant="ghost" size="icon-sm" onClick={handleResolve} aria-label="Resolve">
                <CheckCircle2 size={14} className="text-emerald-500" />
              </Button>
            )}
            <Button variant="ghost" size="icon-sm" onClick={handleDelete} aria-label="Delete">
              <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground">{post.description}</p>

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map(tag => <Badge key={tag} variant="muted">{tag}</Badge>)}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleUpvote}
          disabled={voted}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
            voted
              ? 'bg-primary/10 text-primary border-primary/30 cursor-default'
              : 'bg-muted/40 text-muted-foreground border-border/60 hover:text-primary hover:border-primary/30'
          )}
        >
          <ArrowUp size={12} /> {localCount}
        </button>
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageSquare size={13} />
          {replies.length > 0 ? `${replies.length} replies` : 'Reply'}
          {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
      </div>

      {/* Replies */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border/60 pt-3 space-y-3 overflow-hidden"
          >
            {replies.map(r => <ReplyItem key={r.id} reply={r} postId={post.id} />)}
            {replies.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">No replies yet. Be the first!</p>
            )}
            <ReplyForm postId={post.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ReplyItem({ reply, postId }) {
  const [author, setAuthor] = useState(null)
  const [voted, setVoted]   = useState(false)
  const [count, setCount]   = useState(reply.upvotes || 0)

  useEffect(() => { if (reply.authorId) getUserProfile(reply.authorId).then(setAuthor) }, [reply.authorId])

  async function handleUpvote() {
    if (voted) return
    setVoted(true); setCount(c => c + 1)
    try { await upvoteReply(postId, reply.id) }
    catch { setVoted(false); setCount(c => c - 1) }
  }

  return (
    <div className="flex gap-2.5">
      <Link to={`/profile/${reply.authorId}`}>
        <Avatar src={author?.photoURL} name={author?.name} size="xs" />
      </Link>
      <div className="flex-1 bg-muted/40 rounded-xl px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">{author?.name}</span>
          <span className="text-xs text-muted-foreground">{timeAgo(reply.createdAt)}</span>
        </div>
        <p className="text-sm text-foreground/80 mt-0.5">{reply.content}</p>
        <button
          onClick={handleUpvote}
          disabled={voted}
          className={cn('flex items-center gap-1 mt-2 text-[11px] px-2 py-1 rounded-md transition-all border',
            voted ? 'bg-primary/10 text-primary border-primary/20' : 'text-muted-foreground border-border/40 hover:text-primary'
          )}
        >
          <ArrowUp size={10} /> {count}
        </button>
      </div>
    </div>
  )
}
