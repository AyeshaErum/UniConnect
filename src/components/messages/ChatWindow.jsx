import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Send, Image, Smile, X, FileText, Paperclip } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Avatar from '../ui/Avatar'
import MessageBubble from './MessageBubble'
import EmojiPicker from './EmojiPicker'
import { getUserProfile, sendMessage, subscribeMessages, markMessagesRead } from '../../firebase/firestore'
import { uploadMessageFile } from '../../firebase/storage'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/utils'
import toast from 'react-hot-toast'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ChatWindow({ conversation, onBack, prefillMessage }) {
  const { user }                    = useAuth()
  const [messages, setMessages]     = useState([])
  const [other, setOther]           = useState(null)
  const [input, setInput]           = useState(prefillMessage || '')
  const [sending, setSending]       = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null) // 0-100 or null
  const [pendingFile, setPendingFile] = useState(null) // { file, preview, name, type, size }
  const [showEmoji, setShowEmoji]   = useState(false)

  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const fileRef    = useRef(null)
  const emojiRef   = useRef(null)

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

  /* Close emoji picker on outside click */
  useEffect(() => {
    if (!showEmoji) return
    const handler = e => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showEmoji])

  /* Clean up object URL on unmount / file change */
  useEffect(() => {
    return () => { if (pendingFile?.preview) URL.revokeObjectURL(pendingFile.preview) }
  }, [pendingFile])

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File must be under 10 MB')
      e.target.value = ''
      return
    }

    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    setPendingFile({ file, preview, name: file.name, type: file.type, size: file.size })
    e.target.value = ''
    inputRef.current?.focus()
  }

  function removePendingFile() {
    if (pendingFile?.preview) URL.revokeObjectURL(pendingFile.preview)
    setPendingFile(null)
  }

  function insertEmoji(emoji) {
    const el = inputRef.current
    if (!el) { setInput(v => v + emoji); return }
    const start = el.selectionStart ?? input.length
    const end   = el.selectionEnd   ?? input.length
    const next  = input.slice(0, start) + emoji + input.slice(end)
    setInput(next)
    // restore cursor after the emoji
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + emoji.length, start + emoji.length)
    })
    setShowEmoji(false)
  }

  async function handleSend(e) {
    e.preventDefault()
    if ((!input.trim() && !pendingFile) || sending) return

    const text = input.trim()
    setInput('')
    setSending(true)

    try {
      if (pendingFile) {
        setUploadProgress(0)
        const fileData = await uploadMessageFile(
          conversation.id,
          pendingFile.file,
          pct => setUploadProgress(pct)
        )
        setPendingFile(null)
        await sendMessage(conversation.id, user.uid, text, fileData)
      } else {
        await sendMessage(conversation.id, user.uid, text)
      }
    } catch (err) {
      toast.error('Failed to send')
      if (!pendingFile) setInput(text) // restore text on failure
    } finally {
      setSending(false)
      setUploadProgress(null)
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
    if (!prev || prev.senderId !== msg.senderId) acc.push([])
    acc[acc.length - 1].push(msg)
    return acc
  }, [])

  const canSend = (input.trim().length > 0 || !!pendingFile) && !sending

  return (
    <div className="flex flex-col h-full">

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-card/80 backdrop-blur-sm shrink-0">
        <button onClick={onBack} className="md:hidden -ml-1 shrink-0 p-1.5 rounded-full hover:bg-muted/60 transition-colors" aria-label="Back">
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <Avatar src={other?.photoURL} name={other?.name} size="md" className="shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground leading-tight truncate">{other?.name || '…'}</p>
          <p className="text-xs text-muted-foreground">{other?.major || 'Student'}</p>
        </div>
      </div>

      {/* ── Messages area ───────────────────────────────────────── */}
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
              <p className="text-sm text-muted-foreground mt-2">Say hi! Start a conversation 👋</p>
            </motion.div>
          )}

          {grouped.map((group, gi) => {
            const isOwn = group[0].senderId === user?.uid
            return (
              <div key={gi} className={cn('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
                {isOwn ? (
                  <div className="flex flex-col gap-1 items-end">
                    {group.map((msg, mi) => (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                        <MessageBubble message={msg} isOwn isLast={mi === group.length - 1} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-end gap-2">
                    <Avatar src={other?.photoURL} name={other?.name} size="xs" className="mb-0.5 shrink-0" />
                    <div className="flex flex-col gap-1">
                      {group.map((msg, mi) => (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                          <MessageBubble message={msg} isOwn={false} isLast={mi === group.length - 1} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* ── File preview strip ──────────────────────────────────── */}
      <AnimatePresence>
        {pendingFile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/60 bg-card/80 px-4 py-2 shrink-0 overflow-hidden"
          >
            <div className="flex items-center gap-3">
              {pendingFile.preview ? (
                <img src={pendingFile.preview} alt="preview" className="w-12 h-12 rounded-xl object-cover border border-border/60 shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{pendingFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(pendingFile.size)}</p>
              </div>
              <button onClick={removePendingFile} className="p-1.5 rounded-full hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors shrink-0">
                <X size={14} />
              </button>
            </div>

            {/* Upload progress */}
            {uploadProgress !== null && (
              <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input bar ───────────────────────────────────────────── */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 px-4 py-3 border-t border-border/60 bg-card/80 backdrop-blur-sm shrink-0"
      >
        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.ppt,.pptx,.xls,.xlsx"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Attach / image */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-muted-foreground hover:text-primary transition-colors shrink-0 p-1.5 rounded-full hover:bg-muted/60"
          aria-label="Attach file"
        >
          <Paperclip size={20} />
        </button>

        {/* Text input */}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={pendingFile ? 'Add a caption…' : 'Message…'}
          className="flex-1 h-10 bg-muted/60 rounded-full px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 border-0"
        />

        {/* Emoji picker trigger */}
        <div className="relative shrink-0" ref={emojiRef}>
          <button
            type="button"
            onClick={() => setShowEmoji(v => !v)}
            className={cn(
              'p-1.5 rounded-full transition-colors',
              showEmoji ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-muted/60'
            )}
            aria-label="Emoji"
          >
            <Smile size={20} />
          </button>

          <AnimatePresence>
            {showEmoji && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 4 }}
                transition={{ duration: 0.12 }}
                className="absolute bottom-full right-0 mb-2 z-50"
              >
                <EmojiPicker onSelect={insertEmoji} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send"
          className={cn(
            'shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
            canSend
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
