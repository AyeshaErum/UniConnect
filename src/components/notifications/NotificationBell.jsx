import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { subscribeNotifications, markAllNotificationsRead } from '../../firebase/firestore'
import NotificationItem from './NotificationItem'

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

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const unread = notifs.filter(n => !n.read).length

  async function handleOpen() {
    setOpen(o => !o)
    if (!open && unread > 0) {
      await markAllNotificationsRead(user.uid)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-navy-400 hover:text-white hover:bg-navy-800 transition-colors"
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-accent-coral rounded-full text-white text-[9px] flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl animate-fade-in overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-navy-700 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-white">Notifications</h3>
            {notifs.length > 0 && (
              <span className="text-xs text-navy-400">{notifs.length} total</span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="px-4 py-8 text-center text-navy-400 text-sm">
                All caught up! No notifications yet.
              </div>
            ) : (
              notifs.map(n => <NotificationItem key={n.id} notif={n} />)
            )}
          </div>
        </div>
      )}
    </div>
  )
}
