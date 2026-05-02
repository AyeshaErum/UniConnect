import { ArrowUp } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/utils'

export default function UpvoteButton({ count, onUpvote, size = 'md' }) {
  const [voted, setVoted] = useState(false)
  const [localCount, setLocalCount] = useState(count || 0)

  async function handle() {
    if (voted) return
    setVoted(true)
    setLocalCount(c => c + 1)
    try {
      await onUpvote()
    } catch {
      setVoted(false)
      setLocalCount(c => c - 1)
    }
  }

  const s = size === 'sm' ? 'px-2 py-1 text-xs gap-1' : 'px-3 py-1.5 text-sm gap-1.5'

  return (
    <button
      onClick={handle}
      disabled={voted}
      className={cn(
        'flex items-center rounded-lg font-medium transition-all border',
        s,
        voted
          ? 'bg-primary/15 text-primary border-primary/30 cursor-default'
          : 'bg-muted text-muted-foreground border-border hover:border-primary/40 hover:text-primary'
      )}
      aria-label={`Upvote (${localCount})`}
    >
      <ArrowUp size={size === 'sm' ? 12 : 14} />
      {localCount}
    </button>
  )
}
