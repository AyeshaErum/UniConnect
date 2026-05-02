import { Link } from 'react-router-dom'
import { timeAgo } from '../../utils/helpers'
import { Bell, UserPlus, MessageSquare, Calendar, GraduationCap } from 'lucide-react'
import { cn } from '../../lib/utils'

const icons = {
  connection_request:  UserPlus,
  reply:               MessageSquare,
  event_rsvp:          Calendar,
  mentorship_request:  GraduationCap,
  default:             Bell,
}

export default function NotificationItem({ notif }) {
  const Icon   = icons[notif.type] || icons.default
  const linkTo = notif.relatedId
    ? notif.type === 'connection_request' ? `/profile/${notif.relatedId}` : '/'
    : '/'

  return (
    <Link
      to={linkTo}
      className={cn(
        'flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors border-b border-border/40 last:border-0',
        !notif.read && 'bg-primary/5'
      )}
    >
      <div className={cn(
        'mt-0.5 p-1.5 rounded-lg shrink-0',
        notif.read ? 'bg-muted text-muted-foreground' : 'bg-primary/15 text-primary'
      )}>
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">{notif.message}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(notif.createdAt)}</p>
      </div>
      {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />}
    </Link>
  )
}
