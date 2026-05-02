import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { subscribeNotifications, markAllNotificationsRead } from '../../firebase/firestore'
import NotificationItem from './NotificationItem'
import { Button } from '../ui/Button'

export default function NotificationBell() {
  const { user }            = useAuth()
  const [open, setOpen]     = useState(false)
  const [notifs, setNotifs] = useState([])
  const ref                 = useRef(null)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeNotifications(user.uid, setNotifs)
    return unsub
  }, [user])

  useEffect(() => {
    const handle = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const unread = notifs.filter(n => !n.read).length

  async function handleOpen() {
    setOpen(o => !o)
    if (!open && unread > 0) await markAllNotificationsRead(user.uid)
  }

  return (
    <div ref={ref} className="relative">
      <Button variant="ghost" size="icon" onClick={handleOpen} aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`} className="relative">
        <Bell size={16} />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-1 right-1 min-w-[14px] h-3.5 bg-destructive rounded-full text-destructive-foreground text-[9px] flex items-center justify-center font-bold px-0.5"
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 w-80 bg-card border border-border/60 rounded-2xl shadow-card-lg overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
              {notifs.length > 0 && <span className="text-xs text-muted-foreground">{notifs.length} total</span>}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifs.length === 0 ? (
                <div className="px-4 py-10 text-center text-muted-foreground text-sm">
                  All caught up! 🎉
                </div>
              ) : (
                notifs.map(n => <NotificationItem key={n.id} notif={n} />)
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
