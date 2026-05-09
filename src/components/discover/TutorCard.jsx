import { Link, useNavigate } from 'react-router-dom'
import { Star, MessageSquare, BookOpen } from 'lucide-react'
import Avatar from '../ui/Avatar'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { getOrCreateConversation } from '../../firebase/firestore'
import { cn } from '../../lib/utils'
import { trackTutorMessaged } from '../../utils/analytics'
import toast from 'react-hot-toast'

function gpaColor(gpa) {
  if (!gpa) return 'text-muted-foreground'
  if (gpa >= 3.7) return 'text-amber-400'
  if (gpa >= 3.0) return 'text-primary'
  return 'text-muted-foreground'
}

function tutorCourses(profile) {
  return (profile.transcriptData?.courses || [])
    .filter(c => c.gradePoints >= 3.0 && c.earned > 0)
    .sort((a, b) => b.gradePoints - a.gradePoints)
}

export default function TutorCard({ profile, matchedCourse }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const courses = tutorCourses(profile)
  const visible = courses.slice(0, 4)
  const extra = courses.length - 4

  async function handleMessage() {
    if (!user) return
    try {
      await getOrCreateConversation(user.uid, profile.id)
      trackTutorMessaged(profile.id, matchedCourse)
      const prefill = matchedCourse
        ? `Hi! I'm looking for help with ${matchedCourse}. Are you available to tutor?`
        : undefined
      navigate('/messages', { state: { openUserId: profile.id, prefillMessage: prefill } })
    } catch {
      toast.error('Could not open chat')
    }
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-card overflow-hidden flex flex-col h-full">
      <div className="h-1 bg-brand-gradient" />
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Link to={`/profile/${profile.id}`}>
            <Avatar src={profile.photoURL} name={profile.name} size="lg" />
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/profile/${profile.id}`}>
              <h3 className="font-bold text-foreground hover:text-primary transition-colors truncate">
                {profile.name}
              </h3>
            </Link>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <BookOpen size={11} />
              <span className="truncate">{profile.major || 'Student'}{profile.year ? ` · ${profile.year}` : ''}</span>
            </div>
            {profile.transcriptData?.cumulativeGPA && (
              <div className={cn('flex items-center gap-1 text-xs font-semibold mt-1', gpaColor(profile.transcriptData.cumulativeGPA))}>
                <Star size={11} fill="currentColor" />
                cGPA: {profile.transcriptData.cumulativeGPA.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {/* Course chips */}
        {visible.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Can tutor</p>
            <div className="flex flex-wrap gap-1.5">
              {visible.map(c => (
                <span
                  key={c.courseCode}
                  className={cn(
                    'text-[11px] px-2 py-0.5 rounded-full border font-medium',
                    matchedCourse && (c.courseCode.includes(matchedCourse) || c.courseTitle.toLowerCase().includes(matchedCourse.toLowerCase()))
                      ? 'bg-primary/15 text-primary border-primary/40'
                      : 'bg-secondary/10 text-secondary border-secondary/20'
                  )}
                >
                  {c.courseCode} · {c.grade}
                </span>
              ))}
              {extra > 0 && (
                <span className="text-[11px] text-muted-foreground self-center">+{extra} more</span>
              )}
            </div>
          </div>
        )}

        {profile.bio && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{profile.bio}</p>
        )}

        <div className="flex-1" />

        <Button size="sm" className="w-full" onClick={handleMessage}>
          <MessageSquare size={13} /> Message to Request Help
        </Button>
      </div>
    </div>
  )
}
