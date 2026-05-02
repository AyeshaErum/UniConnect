import { ArrowUp } from 'lucide-react'
import { useState } from 'react'

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
      className={`flex items-center rounded-lg font-medium transition-all ${s} ${
        voted
          ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40 cursor-default'
          : 'bg-navy-800 text-navy-300 border border-navy-700 hover:border-teal-500/40 hover:text-teal-400'
      }`}
      aria-label={`Upvote (${localCount})`}
    >
      <ArrowUp size={size === 'sm' ? 12 : 14} />
      {localCount}
    </button>
  )
}
