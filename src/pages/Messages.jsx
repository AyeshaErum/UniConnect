import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import ConversationList from '../components/messages/ConversationList'
import ChatWindow from '../components/messages/ChatWindow'
import { getUserConversations, getOrCreateConversation } from '../firebase/firestore'
import { useAuth } from '../context/AuthContext'

export default function Messages() {
  const { user }              = useAuth()
  const location              = useLocation()
  const [convos, setConvos]   = useState([])
  const [active, setActive]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    if (!user) return
    getUserConversations(user.uid)
      .then(data => {
        // sort by last message time
        const sorted = data.sort((a, b) => {
          const ta = a.lastMessageAt?.seconds || 0
          const tb = b.lastMessageAt?.seconds || 0
          return tb - ta
        })
        setConvos(sorted)
        // If navigated from profile with a conversationId
        if (location.state?.conversationId) {
          const found = sorted.find(c => c.id === location.state.conversationId)
          if (found) { setActive(found); setShowChat(true) }
        }
        setLoading(false)
      })
  }, [user, location.state])

  function handleSelect(conv) {
    setActive(conv)
    setShowChat(true)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-white mb-6">Messages</h1>
      <div className="bg-navy-900 border border-navy-700 rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className={`w-full md:w-72 border-r border-navy-700 flex flex-col shrink-0 ${showChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="px-4 py-3 border-b border-navy-700">
              <h2 className="font-semibold text-sm text-white">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-skeleton">
                      <div className="w-10 h-10 rounded-full bg-navy-800" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-navy-800 rounded w-24" />
                        <div className="h-2 bg-navy-800 rounded w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ConversationList
                  conversations={convos}
                  activeId={active?.id}
                  onSelect={handleSelect}
                  currentUserId={user?.uid}
                />
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col min-w-0 ${!showChat ? 'hidden md:flex' : 'flex'}`}>
            {active ? (
              <ChatWindow
                conversation={active}
                onBack={() => setShowChat(false)}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="p-4 rounded-full bg-navy-800 mb-4">
                  <MessageSquare size={32} className="text-navy-400" />
                </div>
                <h3 className="font-semibold text-white">Your messages</h3>
                <p className="text-navy-400 text-sm mt-1">Connect with students to start a conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
