import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { MessageSquare, PenSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import ConversationList from '../components/messages/ConversationList'
import ChatWindow from '../components/messages/ChatWindow'
import { Button } from '../components/ui/Button'
import { subscribeConversations, getOrCreateConversation } from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'

export default function Messages() {
  const { user }              = useAuth()
  const location              = useLocation()
  const [convos, setConvos]   = useState([])
  const [active, setActive]   = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [loading, setLoading] = useState(true)
  const [prefill, setPrefill] = useState(null)

  /* Real-time conversation list */
  useEffect(() => {
    if (!user) return
    const unsub = subscribeConversations(user.uid, data => {
      setConvos(data)
      setLoading(false)
    })
    return unsub
  }, [user])

  /* Handle direct-message navigation (openUserId from Discover / Profile) */
  useEffect(() => {
    const openId = location.state?.openUserId
    if (!openId || !user) return

    const msg = location.state?.prefillMessage || null
    getOrCreateConversation(user.uid, openId).then(convId => {
      const existing = convos.find(c => c.id === convId)
      const conv = existing || { id: convId, participants: [user.uid, openId] }
      setActive(conv)
      setPrefill(msg)
      setShowChat(true)
    })
  // convos intentionally excluded so this only fires when the state arrives
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.openUserId, user])

  /* Legacy: navigate with conversationId */
  useEffect(() => {
    const convId = location.state?.conversationId
    if (!convId || convos.length === 0) return
    const found = convos.find(c => c.id === convId)
    if (found) { setActive(found); setShowChat(true) }
  }, [convos, location.state?.conversationId])

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* ── Left panel: conversation list ─────────────────────── */}
      <div className={`
        flex flex-col border-r border-border/60 bg-card shrink-0
        w-full md:w-80 lg:w-96
        ${showChat ? 'hidden md:flex' : 'flex'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <h1 className="text-lg font-bold text-foreground">Messages</h1>
          <Button variant="ghost" size="icon-sm" aria-label="New message">
            <PenSquare size={18} className="text-muted-foreground" />
          </Button>
        </div>

        <ConversationList
          conversations={convos}
          activeId={active?.id}
          onSelect={c => { setActive(c); setShowChat(true) }}
          currentUserId={user?.uid}
          loading={loading}
        />
      </div>

      {/* ── Right panel: chat area ─────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 bg-background ${!showChat ? 'hidden md:flex' : 'flex'}`}>
        {active ? (
          <ChatWindow
            conversation={active}
            onBack={() => { setShowChat(false); setActive(null); setPrefill(null) }}
            prefillMessage={prefill}
          />
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <MessageSquare size={36} className="text-primary" />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Your Messages</h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-xs">
                Send a message to start a conversation with any student
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
