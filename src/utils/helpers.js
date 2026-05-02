import { Timestamp } from 'firebase/firestore'

export function timeAgo(ts) {
  if (!ts) return ''
  const date = ts instanceof Timestamp ? ts.toDate() : new Date(ts)
  const diff = (Date.now() - date.getTime()) / 1000

  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatDate(ts) {
  if (!ts) return ''
  const date = ts instanceof Timestamp ? ts.toDate() : new Date(ts)
  return date.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function formatTime(ts) {
  if (!ts) return ''
  const date = ts instanceof Timestamp ? ts.toDate() : new Date(ts)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function truncate(str, len = 120) {
  if (!str || str.length <= len) return str
  return str.slice(0, len).trimEnd() + '…'
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function getBadges(score, connectionsCount = 0) {
  const badges = []
  if (score >= 100)             badges.push({ label: 'Mentor',       color: 'teal' })
  if (score >= 50)              badges.push({ label: 'Top Helper',   color: 'yellow' })
  if (score >= 10)              badges.push({ label: 'Rising Star',  color: 'coral' })
  if (connectionsCount >= 20)   badges.push({ label: 'Connector',    color: 'navy' })
  return badges
}

export function availabilityColor(status) {
  const map = {
    'Open to connect':         'teal',
    'Free this evening':       'green',
    'Available weekends':      'teal',
    'Open to mentoring':       'yellow',
    'Busy this week':          'red',
    'Available for quick help':'green',
    'On a deadline':           'red',
  }
  return map[status] || 'gray'
}
