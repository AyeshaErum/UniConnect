import { useState, useEffect, useRef } from 'react'
import { Send, ArrowLeft } from 'lucide-react'
import Avatar from '../ui/Avatar'
import MessageBubble from './MessageBubble'
import { getUserProfile, sendMessage, subscribeMessages, markMessagesRead } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'

export default function ChatWindow({ conversation, onBack }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [other, setOther]       = useState(null)
  const [input, setInput]       = useState('')
  const [sending, setSending]   = useState(false)
  const bottomRef               = useRef(null)

  const otherId = conversation?.participants?.find(p => p !== user?.uid)

  useEffect(() => {
    if (otherId) getUserProfile(otherId).then(setOther)
  }, [otherId])

  useEffect(() => {
    if (!conversation?.id) return
    const unsub = subscribeMessages(conversation.id, msgs => {
      setMessages(msgs)
      markMessagesRead(conversation.id, user.uid).catch(() => {})
    })
    return unsub
  }, [conversation?.id, user?.uid])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim() || sending) return
    setSending(true)
    try {
      await sendMessage(conversation.id, user.uid, input.trim())
      setInput('')
    } finally {
      setSending(false)
    }
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-navy-400 text-sm">
        Select a conversation to start chatting
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-navy-700 bg-navy-900">
        <button onClick={onBack} className="md:hidden p-1.5 text-navy-400 hover:text-white rounded-lg" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <Avatar src={other?.photoURL} name={other?.name} size="md" />
        <div>
          <p className="font-semibold text-sm text-white">{other?.name}</p>
          <p className="text-xs text-navy-400">{other?.major}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-sm text-navy-400 py-8">
            No messages yet. Say hi!
          </div>
        )}
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === user?.uid} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-navy-700 bg-navy-900">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-navy-800 border border-navy-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          aria-label="Message input"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="p-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 rounded-xl text-navy-950 transition-colors shrink-0"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
