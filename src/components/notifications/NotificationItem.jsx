import { Link } from 'react-router-dom'
import { timeAgo } from '../../utils/helpers'
import { Bell, UserPlus, MessageSquare, Calendar, GraduationCap } from 'lucide-react'

const icons = {
  connection_request:  UserPlus,
  reply:               MessageSquare,
  event_rsvp:          Calendar,
  mentorship_request:  GraduationCap,
  default:             Bell,
}

export default function NotificationItem({ notif }) {
  const Icon = icons[notif.type] || icons.default
  const linkTo = notif.relatedId
    ? notif.type === 'connection_request' ? `/profile/${notif.relatedId}` : '/'
    : '/'

  return (
    <Link
      to={linkTo}
      className={`flex items-start gap-3 px-4 py-3 hover:bg-navy-800 transition-colors border-b border-navy-800 last:border-0 ${
        !notif.read ? 'bg-teal-500/5' : ''
      }`}
    >
      <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
        notif.read ? 'bg-navy-700 text-navy-400' : 'bg-teal-500/20 text-teal-400'
      }`}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-navy-100 leading-snug">{notif.message}</p>
        <p className="text-xs text-navy-400 mt-0.5">{timeAgo(notif.createdAt)}</p>
      </div>
      {!notif.read && (
        <div className="w-2 h-2 rounded-full bg-teal-400 shrink-0 mt-1.5" />
      )}
    </Link>
  )
}
