import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { getUserProfile } from '../../firebase/firestore'
import Avatar from '../ui/Avatar'
import { timeAgo } from '../../utils/helpers'
import { cn } from '../../lib/utils'
import { Skeleton } from '../ui/SkeletonLoader'

export default function ConversationList({ conversations, activeId, onSelect, currentUserId, loading }) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? conversations.filter(c => c._otherName?.toLowerCase().includes(search.toLowerCase()))
    : conversations

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Search */}
      <div className="px-4 py-3 border-b border-border/40">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full h-9 bg-muted/60 border-0 rounded-full pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2">
        {loading ? (
          <div className="px-3 space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            {search ? 'No conversations match your search' : 'No conversations yet.\nMessage someone to get started!'}
          </div>
        ) : (
          filtered.map(conv => (
            <ConvItem
              key={conv.id}
              conv={conv}
              isActive={conv.id === activeId}
              onSelect={onSelect}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  )
}

function ConvItem({ conv, isActive, onSelect, currentUserId }) {
  const otherId = conv.participants?.find(p => p !== currentUserId)
  const [other, setOther] = useState(null)

  useEffect(() => { if (otherId) getUserProfile(otherId).then(setOther) }, [otherId])

  const isUnread = conv.lastSenderId && conv.lastSenderId !== currentUserId

  return (
    <button
      onClick={() => onSelect(conv)}
      className={cn(
        'flex items-center gap-3 w-full px-4 py-3 transition-colors text-left',
        isActive
          ? 'bg-secondary/15'
          : 'hover:bg-muted/50'
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar src={other?.photoURL} name={other?.name} size="md" />
        {isUnread && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent-pink border-2 border-card" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn('text-sm truncate', isUnread ? 'font-bold text-foreground' : 'font-medium text-foreground')}>
            {other?.name || '…'}
          </span>
          {conv.lastMessageAt && (
            <span className="text-[11px] text-muted-foreground shrink-0">
              {timeAgo(conv.lastMessageAt)}
            </span>
          )}
        </div>
        {conv.lastMessage && (
          <p className={cn('text-xs truncate mt-0.5', isUnread ? 'text-foreground font-medium' : 'text-muted-foreground')}>
            {conv.lastSenderId === currentUserId ? 'You: ' : ''}{conv.lastMessage}
          </p>
        )}
      </div>
    </button>
  )
}
