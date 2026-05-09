import { useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/utils'

const GROUPS = [
  {
    label: '😀',
    emojis: ['😀','😂','🥰','😍','😎','🤔','😅','😭','🥺','😊','😏','🤣','😢','🤗','🤩','😴','🙃','😬','😤','🤯','😇','🥳','😑','😮','🤑'],
  },
  {
    label: '👋',
    emojis: ['👋','🤝','💪','🙌','👏','🤞','✌️','👍','👎','🤦','🤷','🙏','💅','🤙','✋','👀','❤️','💙','💜','🖤','💛','🤍','💔','🫶','🫂'],
  },
  {
    label: '🎓',
    emojis: ['📚','💻','🎓','🎯','📝','✏️','📱','🎵','🎮','⚽','🏆','💡','🔑','📌','💰','🔥','✨','🎉','💯','🚀','🌈','🌙','⭐','🎁','🍕'],
  },
]

export default function EmojiPicker({ onSelect, className }) {
  const [tab, setTab] = useState(0)
  const ref = useRef(null)

  return (
    <div
      ref={ref}
      className={cn(
        'w-72 rounded-2xl border border-border/60 bg-card shadow-card-lg overflow-hidden',
        className
      )}
    >
      {/* Tab bar */}
      <div className="flex border-b border-border/60">
        {GROUPS.map((g, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            className={cn(
              'flex-1 py-2.5 text-lg transition-colors',
              tab === i ? 'bg-primary/10 border-b-2 border-primary' : 'hover:bg-muted/60'
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="grid grid-cols-8 gap-0.5 p-2 h-48 overflow-y-auto">
        {GROUPS[tab].emojis.map(emoji => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="flex items-center justify-center w-full aspect-square text-xl rounded-lg hover:bg-muted/60 transition-colors"
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
