import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Send, Image, Smile } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Avatar from '../ui/Avatar'
import MessageBubble from './MessageBubble'
import { Button } from '../ui/Button'
import { getUserProfile, sendMessage, subscribeMessages, markMessagesRead } from '../../firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/utils'

export default function ChatWindow({ conversation, onBack }) {
  const { user }                    = useAuth()
  const [messages, setMessages]     = useState([])
  const [other, setOther]           = useState(null)
  const [input, setInput]           = useState('')
  const [sending, setSending]       = useState(false)
  const bottomRef                   = useRef(null)
  const inputRef                    = useRef(null)
  const otherId = conversation?.participants?.find(p => p !== user?.uid)

  useEffect(() => { if (otherId) getUserProfile(otherId).then(setOther) }, [otherId])

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
    const text = input.trim()
    setInput('')
    setSending(true)
    try {
      await sendMessage(conversation.id, user.uid, text)
    } catch {
      setInput(text)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  /* Group consecutive messages by sender */
  const grouped = messages.reduce((acc, msg, i) => {
    const prev = messages[i - 1]
    const isNewGroup = !prev || prev.senderId !== msg.senderId
    if (isNewGroup) acc.push([])
    acc[acc.length - 1].push(msg)
    return acc
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-card/80 backdrop-blur-sm shrink-0">
        <Button variant="ghost" size="icon-sm" onClick={onBack} className="md:hidden -ml-1 shrink-0" aria-label="Back">
          <ArrowLeft size={18} />
        </Button>

        <Avatar src={other?.photoURL} name={other?.name} size="md" className="shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground leading-tight truncate">
            {other?.name || '…'}
          </p>
          <p className="text-xs text-muted-foreground">{other?.major || 'Student'}</p>
        </div>
      </div>

      {/* ── Messages area ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-12"
            >
              <Avatar src={other?.photoURL} name={other?.name} size="2xl" />
              <div className="text-center">
                <p className="font-semibold text-foreground">{other?.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{other?.major}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Say hi! Start a conversation 👋
              </p>
            </motion.div>
          )}

          {grouped.map((group, gi) => {
            const isOwn = group[0].senderId === user?.uid
            return (
              <div key={gi} className={cn('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
                {!isOwn && (
                  <div className="flex items-end gap-2">
                    <Avatar src={other?.photoURL} name={other?.name} size="xs" className="mb-0.5 shrink-0" />
                    <div className="flex flex-col gap-1">
                      {group.map((msg, mi) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.18 }}
                        >
                          <MessageBubble
                            message={msg}
                            isOwn={false}
                            isLast={mi === group.length - 1}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                {isOwn && (
                  <div className="flex flex-col gap-1 items-end">
                    {group.map((msg, mi) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.18 }}
                      >
                        <MessageBubble
                          message={msg}
                          isOwn={true}
                          isLast={mi === group.length - 1}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ────────────────────────────────────────────── */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-4 py-3 border-t border-border/60 bg-card/80 backdrop-blur-sm shrink-0"
      >
        <button
          type="button"
          className="text-muted-foreground hover:text-primary transition-colors shrink-0 p-1.5"
          aria-label="Attach image"
        >
          <Image size={20} />
        </button>

        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          className="flex-1 h-10 bg-muted/60 rounded-full px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 border-0"
        />

        <button
          type="button"
          className="text-muted-foreground hover:text-primary transition-colors shrink-0 p-1.5"
          aria-label="Emoji"
        >
          <Smile size={20} />
        </button>

        <button
          type="submit"
          disabled={!input.trim() || sending}
          aria-label="Send"
          className={cn(
            'shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
            input.trim()
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          {sending ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <Send size={15} />
          )}
        </button>
      </form>
    </div>
  )
}
