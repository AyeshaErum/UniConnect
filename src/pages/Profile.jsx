import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Edit2, MessageSquare, UserPlus, Check, MapPin, BookOpen, Calendar } from 'lucide-react'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import SkillTag from '../components/profile/SkillTag'
import Modal from '../components/ui/Modal'
import EditProfileForm from '../components/profile/EditProfileForm'
import { CardSkeleton } from '../components/ui/SkeletonLoader'
import { getUserProfile, sendConnectionRequest, removeConnection, getOrCreateConversation } from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { availabilityColor } from '../utils/helpers'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Profile() {
  const { userId }          = useParams()
  const { user, profile: myProfile } = useAuth()
  const navigate            = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [connecting, setConnecting] = useState(false)

  const isOwn      = user?.uid === userId
  const connected  = myProfile?.connections?.includes(userId) || false

  useEffect(() => {
    setLoading(true)
    getUserProfile(userId)
      .then(setProfile)
      .finally(() => setLoading(false))
  }, [userId])

  async function handleConnect() {
    setConnecting(true)
    try {
      if (connected) {
        await removeConnection(user.uid, userId)
        toast.success('Connection removed')
      } else {
        await sendConnectionRequest(user.uid, userId)
        toast.success('Connection request sent!')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setConnecting(false)
    }
  }

  async function handleMessage() {
    try {
      const convId = await getOrCreateConversation(user.uid, userId)
      navigate('/messages', { state: { conversationId: convId } })
    } catch {
      toast.error('Could not open chat')
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <CardSkeleton />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-navy-400 text-lg">User not found</p>
        <Link to="/discover" className="text-teal-400 text-sm mt-2 inline-block hover:underline">Browse students</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="bg-navy-900 border border-navy-700 rounded-2xl overflow-hidden shadow-card">
        <div className="h-24 bg-gradient-to-r from-navy-800 via-teal-900/30 to-navy-800" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4 gap-4">
            <Avatar src={profile.photoURL} name={profile.name} size="2xl" className="border-4 border-navy-900" />
            <div className="flex items-center gap-2 mb-1">
              {isOwn ? (
                <button
                  onClick={() => setEditOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <Edit2 size={14} /> Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleMessage}
                    className="flex items-center gap-2 px-3 py-2 bg-navy-700 hover:bg-navy-600 text-white rounded-xl text-sm transition-colors"
                    aria-label="Send message"
                  >
                    <MessageSquare size={15} />
                  </button>
                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      connected
                        ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                        : 'bg-teal-500 text-navy-950 hover:bg-teal-400'
                    }`}
                  >
                    {connected ? <><Check size={14} /> Connected</> : <><UserPlus size={14} /> Connect</>}
                  </button>
                </>
              )}
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-white">{profile.name}</h1>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-navy-400">
            {profile.major && (
              <span className="flex items-center gap-1"><BookOpen size={13} />{profile.major}</span>
            )}
            {profile.year && (
              <span className="flex items-center gap-1"><Calendar size={13} />{profile.year}</span>
            )}
            {profile.university && (
              <span className="flex items-center gap-1"><MapPin size={13} />{profile.university}</span>
            )}
          </div>

          {profile.availability && (
            <div className="mt-3">
              <Badge color={availabilityColor(profile.availability)}>{profile.availability}</Badge>
            </div>
          )}

          {profile.bio && (
            <p className="mt-4 text-navy-300 text-sm leading-relaxed">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="grid sm:grid-cols-2 gap-4">
        {profile.teachSkills?.length > 0 && (
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5">
            <h3 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />
              I Can Teach
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.teachSkills.map(s => <SkillTag key={s} label={s} variant="teach" />)}
            </div>
          </div>
        )}
        {profile.learnSkills?.length > 0 && (
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5">
            <h3 className="font-display font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-yellow inline-block" />
              I Want to Learn
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.learnSkills.map(s => <SkillTag key={s} label={s} variant="learn" />)}
            </div>
          </div>
        )}
      </div>

      {/* Connections count */}
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-5">
        <p className="text-navy-400 text-sm">
          <span className="text-white font-bold text-lg">{profile.connections?.length || 0}</span> connections
        </p>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile" size="lg">
        <EditProfileForm onClose={() => setEditOpen(false)} />
      </Modal>
    </div>
  )
}
