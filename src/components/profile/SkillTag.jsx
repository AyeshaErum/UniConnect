import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

const variants = {
  teach:   'bg-primary/10 text-primary border-primary/20 hover:border-primary/40',
  learn:   'bg-secondary/10 text-secondary border-secondary/20 hover:border-secondary/40',
  neutral: 'bg-muted text-muted-foreground border-border',
}

export default function SkillTag({ label, variant = 'neutral', onRemove }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
      variants[variant] || variants.neutral
    )}>
      {label}
      {onRemove && (
        <button
          onClick={() => onRemove(label)}
          className="opacity-60 hover:opacity-100 ml-0.5 transition-opacity rounded-full"
          aria-label={`Remove ${label}`}
        >
          <X size={10} />
        </button>
      )}
    </span>
  )
}
