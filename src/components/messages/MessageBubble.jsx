import { timeAgo } from '../../utils/helpers'
import { Check, CheckCheck } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function MessageBubble({ message, isOwn, isLast }) {
  return (
    <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[280px] sm:max-w-xs px-4 py-2.5 text-sm leading-relaxed',
          isOwn
            ? 'bg-primary text-primary-foreground rounded-3xl rounded-tr-md'
            : 'bg-card text-foreground rounded-3xl rounded-tl-md shadow-sm border border-border/40'
        )}
      >
        {message.content}
      </div>

      {/* Time + read receipt — only on the last bubble of a group */}
      {isLast && (
        <div className={cn('flex items-center gap-1 mt-1 px-1', isOwn ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-[10px] text-muted-foreground">
            {timeAgo(message.createdAt)}
          </span>
          {isOwn && (
            message.read
              ? <CheckCheck size={11} className="text-primary" />
              : <Check size={11} className="text-muted-foreground" />
          )}
        </div>
      )}
    </div>
  )
}
