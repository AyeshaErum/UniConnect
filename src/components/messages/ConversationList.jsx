import { useEffect, useState } from 'react'
import { getUserProfile } from '../../firebase/firestore'
import Avatar from '../ui/Avatar'
import { timeAgo, truncate } from '../../utils/helpers'
import { classNames } from '../../utils/helpers'

export default function ConversationList({ conversations, activeId, onSelect, currentUserId }) {
  return (
    <div className="flex flex-col gap-1 p-2">
      {conversations.length === 0 && (
        <p className="text-center text-sm text-navy-400 py-8">No conversations yet.<br/>Connect with students to start chatting.</p>
      )}
      {conversations.map(conv => (
        <ConvItem key={conv.id} conv={conv} isActive={conv.id === activeId} onSelect={onSelect} currentUserId={currentUserId} />
      ))}
    </div>
  )
}

function ConvItem({ conv, isActive, onSelect, currentUserId }) {
  const otherId = conv.participants?.find(p => p !== currentUserId)
  const [other, setOther] = useState(null)

  useEffect(() => {
    if (otherId) getUserProfile(otherId).then(setOther)
  }, [otherId])

  return (
    <button
      onClick={() => onSelect(conv)}
      className={classNames(
        'flex items-center gap-3 p-3 rounded-xl transition-colors text-left w-full',
        isActive ? 'bg-teal-500/15 border border-teal-500/20' : 'hover:bg-navy-800'
      )}
    >
      <Avatar src={other?.photoURL} name={other?.name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-sm font-medium text-white truncate">{other?.name || '...'}</span>
          {conv.lastMessageAt && (
            <span className="text-xs text-navy-400 shrink-0">{timeAgo(conv.lastMessageAt)}</span>
          )}
        </div>
        {conv.lastMessage && (
          <p className="text-xs text-navy-400 truncate mt-0.5">
            {conv.lastSenderId === currentUserId ? 'You: ' : ''}{conv.lastMessage}
          </p>
        )}
      </div>
    </button>
  )
}
