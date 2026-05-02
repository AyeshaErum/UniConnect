import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Edit2, MessageSquare, UserPlus, Check, MapPin, BookOpen, Calendar, Users } from 'lucide-react'
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
import { getUserProfile, sendConnectionRequest, removeConnection, getOrCreateConversation } from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { staggerContainer, staggerItem } from '../lib/motion'
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

export default function Profile() {
  const { userId } = useParams()
  const { user, profile: myProfile } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [editOpen, setEditOpen]   = useState(false)
  const [connecting, setConnecting] = useState(false)

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

  if (loading) return <div className="container py-8 max-w-3xl"><CardSkeleton /></div>

  if (!profile) return (
    <div className="container py-16 text-center max-w-3xl">
      <p className="text-muted-foreground text-lg">User not found</p>
      <Link to="/discover" className="text-primary text-sm mt-2 inline-block hover:underline">Browse students</Link>
    </div>
  )

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
          {/* Banner with subtle gradient */}
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
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid sm:grid-cols-2 gap-4"
        >
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

        <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile" size="lg">
          <EditProfileForm onClose={() => setEditOpen(false)} />
        </Modal>
      </div>
    </PageWrapper>
  )
}
