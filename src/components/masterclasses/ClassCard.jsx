import { ExternalLink, Clock, Calendar, User } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'
import { trackMasterclassJoined } from '../../utils/analytics'

const TOPIC_COLORS = {
  Programming:    'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Cybersecurity:  'bg-red-500/15 text-red-400 border-red-500/30',
  Math:           'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Data Science': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Design:         'bg-pink-500/15 text-pink-400 border-pink-500/30',
  Career:         'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Other:          'bg-muted text-muted-foreground border-border',
}

function formatDate(ts) {
  if (!ts) return ''
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function isPast(ts) {
  if (!ts) return false
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d < new Date()
}

export default function ClassCard({ cls }) {
  const ended = isPast(cls.scheduledAt)

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden flex flex-col h-full">
      <div className="h-1 bg-brand-gradient" />
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Topic badge */}
        <div className="flex items-start justify-between gap-2">
          <span className={cn(
            'text-[11px] font-semibold px-2.5 py-1 rounded-full border self-start',
            TOPIC_COLORS[cls.topic] || TOPIC_COLORS.Other
          )}>
            {cls.topic}
          </span>
          {ended && (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border bg-muted text-muted-foreground border-border">
              Ended
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-foreground text-base leading-snug">{cls.title}</h3>

        {/* Instructor */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[11px] font-bold flex-shrink-0">
            {cls.instructor?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-sm text-muted-foreground">{cls.instructor}</span>
        </div>

        {/* Date & duration */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            {formatDate(cls.scheduledAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} />
            {cls.duration}
          </span>
        </div>

        {/* Description */}
        {cls.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{cls.description}</p>
        )}

        <div className="flex-1" />

        {/* Action */}
        {ended ? (
          <Button variant="outline" size="sm" className="w-full opacity-50 cursor-not-allowed" disabled>
            Session Ended
          </Button>
        ) : (
          <Button
            size="sm"
            className="w-full"
            onClick={() => {
              trackMasterclassJoined(cls.id, cls.title, cls.topic)
              window.open(cls.googleMeetLink, '_blank')
            }}
          >
            <ExternalLink size={13} /> Join Class
          </Button>
        )}
      </div>
    </div>
  )
}
