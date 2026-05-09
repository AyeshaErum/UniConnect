import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Edit2, MessageSquare, UserPlus, Check, MapPin, BookOpen, Calendar, Users, Star, Upload, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import Avatar from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Separator } from '../components/ui/Separator'
import SkillTag from '../components/profile/SkillTag'
import Modal from '../components/ui/Modal'
import EditProfileForm from '../components/profile/EditProfileForm'
import { CardSkeleton } from '../components/ui/SkeletonLoader'
import PageWrapper from '../components/layout/PageWrapper'
import { getUserProfile, sendConnectionRequest, removeConnection, getOrCreateConversation, updateUserProfile } from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { staggerContainer, staggerItem } from '../lib/motion'
import { parseTranscript } from '../utils/transcriptParser'
import { trackTranscriptUploaded } from '../utils/analytics'
import { cn } from '../lib/utils'
import toast from 'react-hot-toast'

const availabilityVariant = s => ({
  'Open to connect':          'default',
  'Open to mentoring':        'secondary',
  'Busy this week':           'pink',
  'On a deadline':            'pink',
  'Free this evening':        'success',
  'Available weekends':       'default',
  'Available for quick help': 'success',
}[s] || 'muted')

function gpaColor(gpa) {
  if (!gpa) return 'text-muted-foreground'
  if (gpa >= 3.7) return 'text-amber-400'
  if (gpa >= 3.0) return 'text-primary'
  return 'text-muted-foreground'
}

function tutorableCourses(transcriptData) {
  return (transcriptData?.courses || [])
    .filter(c => c.gradePoints >= 3.0 && c.earned > 0)
    .sort((a, b) => b.gradePoints - a.gradePoints || a.courseCode.localeCompare(b.courseCode))
}

export default function Profile() {
  const { userId } = useParams()
  const { user, profile: myProfile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [profile, setProfile]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [editOpen, setEditOpen]     = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [parsing, setParsing]       = useState(false)
  const [parseResult, setParseResult] = useState(null) // { courses, cumulativeGPA, totalCredits }
  const [parseError, setParseError] = useState(null)

  const isOwn     = user?.uid === userId
  const connected = myProfile?.connections?.includes(userId) || false

  useEffect(() => {
    setLoading(true)
    getUserProfile(userId).then(setProfile).finally(() => setLoading(false))
  }, [userId])

  async function handleConnect() {
    setConnecting(true)
    try {
      if (connected) { await removeConnection(user.uid, userId); toast.success('Connection removed') }
      else           { await sendConnectionRequest(user.uid, userId); toast.success('Request sent!') }
    } catch { toast.error('Something went wrong') }
    finally { setConnecting(false) }
  }

  async function handleMessage() {
    try {
      await getOrCreateConversation(user.uid, userId)
      navigate('/messages', { state: { openUserId: userId } })
    } catch { toast.error('Could not open chat') }
  }

  async function handleTranscriptUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return }

    setParsing(true)
    setParseError(null)
    setParseResult(null)

    try {
      const result = await parseTranscript(file)
      if (result.courses.length === 0) {
        setParseError('No courses detected. Please check the file format.')
        return
      }
      setParseResult(result)

      // Save to Firestore
      await updateUserProfile(user.uid, {
        isTutor: true,
        transcriptData: {
          courses:       result.courses,
          cumulativeGPA: result.cumulativeGPA,
          totalCredits:  result.totalCredits,
          lastUpdated:   new Date().toISOString(),
        },
      })
      await refreshProfile()

      // Re-fetch profile so the tutor section updates
      const updated = await getUserProfile(userId)
      setProfile(updated)

      trackTranscriptUploaded(result.courses.length, result.cumulativeGPA)
      toast.success(`Transcript processed! ${result.courses.length} courses found.`)
    } catch (err) {
      console.error('Transcript parse error:', err)
      setParseError('Could not parse transcript automatically. Please check the file format.')
    } finally {
      setParsing(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  if (loading) return <div className="container py-8 max-w-3xl"><CardSkeleton /></div>

  if (!profile) return (
    <div className="container py-16 text-center max-w-3xl">
      <p className="text-muted-foreground text-lg">User not found</p>
      <Link to="/discover" className="text-primary text-sm mt-2 inline-block hover:underline">Browse students</Link>
    </div>
  )

  const tutorCourses = tutorableCourses(profile.transcriptData)

  return (
    <PageWrapper>
      <div className="container py-8 max-w-3xl space-y-5">
        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-card"
        >
          <div className="h-28 relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, hsl(var(--secondary) / 0.20) 0%, hsl(var(--primary) / 0.10) 100%)'
          }}>
            <div className="absolute inset-0 bg-noise opacity-30" />
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-12 mb-4 gap-4">
              <Avatar src={profile.photoURL} name={profile.name} size="2xl" className="border-4 border-card shadow-md" />

              <div className="flex items-center gap-2 pb-1">
                {isOwn ? (
                  <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                    <Edit2 size={13} /> Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button variant="default" size="sm" onClick={handleMessage}>
                      <MessageSquare size={13} /> Message
                    </Button>
                    <Button variant={connected ? 'outline' : 'secondary'} size="sm" onClick={handleConnect} loading={connecting}>
                      {connected ? <><Check size={13} /> Connected</> : <><UserPlus size={13} /> Connect</>}
                    </Button>
                  </>
                )}
              </div>
            </div>

            <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              {profile.major && <span className="flex items-center gap-1"><BookOpen size={13} />{profile.major}</span>}
              {profile.year  && <span className="flex items-center gap-1"><Calendar size={13} />{profile.year}</span>}
              {profile.university && <span className="flex items-center gap-1"><MapPin size={13} />{profile.university}</span>}
              <span className="flex items-center gap-1"><Users size={13} />{profile.connections?.length || 0} connections</span>
              {profile.transcriptData?.cumulativeGPA && (
                <span className={cn('flex items-center gap-1 font-semibold', gpaColor(profile.transcriptData.cumulativeGPA))}>
                  <Star size={13} fill="currentColor" />
                  cGPA: {profile.transcriptData.cumulativeGPA.toFixed(2)}
                </span>
              )}
            </div>

            {profile.availability && (
              <div className="mt-3">
                <Badge variant={availabilityVariant(profile.availability)}>{profile.availability}</Badge>
              </div>
            )}

            {profile.bio && (
              <p className="mt-4 text-muted-foreground text-sm leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid sm:grid-cols-2 gap-4">
          {profile.teachSkills?.length > 0 && (
            <motion.div variants={staggerItem} className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h3 className="font-semibold text-sm text-foreground">I Can Teach</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.teachSkills.map(s => <SkillTag key={s} label={s} variant="teach" />)}
              </div>
            </motion.div>
          )}
          {profile.learnSkills?.length > 0 && (
            <motion.div variants={staggerItem} className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <h3 className="font-semibold text-sm text-foreground">I Want to Learn</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.learnSkills.map(s => <SkillTag key={s} label={s} variant="learn" />)}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Tutor Courses Section (visible to everyone if isTutor) */}
        {profile.isTutor && tutorCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">📚 Available to Tutor</h3>
              <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-semibold">
                {tutorCourses.length} courses
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-muted-foreground border-b border-border/60">
                    <th className="pb-2 pr-4">Code</th>
                    <th className="pb-2 pr-4">Course Name</th>
                    <th className="pb-2">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {tutorCourses.map((c, i) => (
                    <tr key={i} className="text-foreground">
                      <td className="py-2 pr-4 font-mono text-xs text-muted-foreground whitespace-nowrap">{c.courseCode}</td>
                      <td className="py-2 pr-4 text-sm">{c.courseTitle}</td>
                      <td className="py-2">
                        <span className={cn(
                          'text-xs font-bold px-1.5 py-0.5 rounded',
                          c.gradePoints >= 4.0 ? 'bg-emerald-500/15 text-emerald-400' :
                          c.gradePoints >= 3.5 ? 'bg-primary/15 text-primary' :
                          'bg-secondary/15 text-secondary'
                        )}>
                          {c.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!isOwn && (
              <Button size="sm" variant="outline" className="w-full" onClick={handleMessage}>
                <MessageSquare size={13} /> Message to Request Tutoring
              </Button>
            )}
          </motion.div>
        )}

        {/* Transcript Upload (own profile only) */}
        {isOwn && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4"
          >
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">📄 Academic Info</h3>
              <p className="text-xs text-muted-foreground mt-1">Upload your transcript to become discoverable as a tutor</p>
            </div>

            <Separator />

            {/* Upload card */}
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 flex flex-col items-center gap-3 text-center">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Upload size={20} />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Upload Your Transcript</p>
                <p className="text-xs text-muted-foreground mt-0.5">PDF only · max 5MB</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleTranscriptUpload}
              />
              <Button
                size="sm"
                variant={profile.transcriptUploaded ? 'outline' : 'default'}
                onClick={() => fileRef.current?.click()}
                loading={parsing}
                className="gap-2"
              >
                {parsing ? 'Parsing...' : profile.transcriptUploaded ? <><RefreshCw size={13} /> Re-upload Transcript</> : 'Upload PDF'}
              </Button>
            </div>

            {/* Error state */}
            {parseError && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {parseError}
                <button className="underline ml-2 text-xs" onClick={() => fileRef.current?.click()}>Try again</button>
              </div>
            )}

            {/* Success state from just-uploaded */}
            {parseResult && !parseError && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
                <p className="text-sm font-semibold text-emerald-400">
                  ✅ Transcript processed! {parseResult.courses.length} courses found. You're now discoverable as a tutor.
                </p>
                {parseResult.cumulativeGPA && (
                  <p className="text-xs text-muted-foreground">Cumulative GPA: <strong>{parseResult.cumulativeGPA.toFixed(2)}</strong></p>
                )}
                <div className="overflow-x-auto max-h-48 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border/60">
                        <th className="pb-1 pr-3">Code</th>
                        <th className="pb-1 pr-3">Course Name</th>
                        <th className="pb-1 pr-3">Grade</th>
                        <th className="pb-1">Term</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {parseResult.courses.map((c, i) => (
                        <tr key={i}>
                          <td className="py-1 pr-3 font-mono text-muted-foreground">{c.courseCode}</td>
                          <td className="py-1 pr-3">{c.courseTitle}</td>
                          <td className="py-1 pr-3 font-bold">{c.grade}</td>
                          <td className="py-1 text-muted-foreground">{c.term || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Existing transcript summary (no new parse) */}
            {!parseResult && profile.transcriptUploaded && profile.transcriptData && (
              <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                <span>✅ Transcript on file</span>
                {profile.transcriptData.cumulativeGPA && (
                  <span>cGPA: <strong className="text-foreground">{profile.transcriptData.cumulativeGPA.toFixed(2)}</strong></span>
                )}
                <span>{profile.transcriptData.courses?.length || 0} courses extracted</span>
              </div>
            )}
          </motion.div>
        )}

        <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile" size="lg">
          <EditProfileForm onClose={() => setEditOpen(false)} />
        </Modal>
      </div>
    </PageWrapper>
  )
}
