import { timeAgo } from '../../utils/helpers'
import { Check, CheckCheck, FileText, Download } from 'lucide-react'
import { cn } from '../../lib/utils'

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MessageBubble({ message, isOwn, isLast }) {
  const isImage = message.msgType === 'image'
  const isFile  = message.msgType === 'file'
  const hasText = message.content?.trim().length > 0

  return (
    <div className={cn('flex flex-col max-w-[280px] sm:max-w-xs', isOwn ? 'items-end' : 'items-start')}>

      {/* Image bubble */}
      {isImage && (
        <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={message.fileUrl}
            alt={message.fileName || 'image'}
            className={cn(
              'max-w-full rounded-2xl object-cover border cursor-pointer hover:opacity-90 transition-opacity',
              isOwn ? 'border-primary/20' : 'border-border/40',
              hasText ? 'mb-1 rounded-b-sm' : ''
            )}
            style={{ maxHeight: 240 }}
          />
        </a>
      )}

      {/* File attachment bubble */}
      {isFile && (
        <a
          href={message.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download={message.fileName}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-2xl border transition-opacity hover:opacity-90',
            isOwn
              ? 'bg-primary text-primary-foreground border-primary/20 rounded-tr-md'
              : 'bg-card text-foreground border-border/40 rounded-tl-md shadow-sm',
            hasText ? 'mb-1 rounded-b-sm' : ''
          )}
        >
          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
            isOwn ? 'bg-primary-foreground/20' : 'bg-muted'
          )}>
            <FileText size={18} className={isOwn ? 'text-primary-foreground' : 'text-muted-foreground'} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate">{message.fileName}</p>
            <p className={cn('text-[11px]', isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
              {formatSize(message.fileSize)}
            </p>
          </div>
          <Download size={15} className={cn('shrink-0', isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground')} />
        </a>
      )}

      {/* Text bubble (also used as caption under image/file) */}
      {hasText && (
        <div className={cn(
          'px-4 py-2.5 text-sm leading-relaxed',
          isOwn
            ? 'bg-primary text-primary-foreground rounded-3xl rounded-tr-md'
            : 'bg-card text-foreground rounded-3xl rounded-tl-md shadow-sm border border-border/40',
          /* tighten top radius when there's media above */
          (isImage || isFile) && 'rounded-t-md'
        )}>
          {message.content}
        </div>
      )}

      {/* Timestamp + read receipt on last bubble of a group */}
      {isLast && (
        <div className={cn('flex items-center gap-1 mt-1 px-1', isOwn ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-[10px] text-muted-foreground">{timeAgo(message.createdAt)}</span>
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
