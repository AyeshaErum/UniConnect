import { Link } from 'react-router-dom'
import { Separator } from '../ui/Separator'
import { Zap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-xl mt-auto">
      <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-brand-gradient flex items-center justify-center">
            <Zap size={11} className="text-white" />
          </div>
          <span className="font-medium text-foreground">UniConnect</span>
          <span>— Connect, Learn &amp; Grow</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link to="/discover" className="hover:text-primary transition-colors">Discover</Link>
          <Link to="/help-board" className="hover:text-primary transition-colors">Help Board</Link>
          <Link to="/settings" className="hover:text-primary transition-colors">Settings</Link>
        </div>
        <p className="text-xs">&copy; {new Date().getFullYear()} UniConnect</p>
      </div>
    </footer>
  )
}
