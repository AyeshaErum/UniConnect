import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-navy-800 bg-navy-950 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-navy-400">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-teal-500 to-navy-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">U</span>
          </div>
          <span>UniConnect — Connect, Learn & Grow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/discover" className="hover:text-teal-400 transition-colors">Discover</Link>
          <Link to="/help-board" className="hover:text-teal-400 transition-colors">Help Board</Link>
          <Link to="/settings" className="hover:text-teal-400 transition-colors">Settings</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} UniConnect</p>
      </div>
    </footer>
  )
}
