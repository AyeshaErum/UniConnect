import { X } from 'lucide-react'
import { classNames } from '../../utils/helpers'

export default function SkillTag({ label, variant = 'teach', onRemove }) {
  const styles = {
    teach:  'bg-teal-500/15 text-teal-300 border border-teal-500/30',
    learn:  'bg-accent-yellow/15 text-accent-yellow border border-accent-yellow/30',
    neutral:'bg-navy-700 text-navy-200 border border-navy-600',
  }
  return (
    <span className={classNames(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
      styles[variant] || styles.neutral
    )}>
      {label}
      {onRemove && (
        <button
          onClick={() => onRemove(label)}
          className="opacity-60 hover:opacity-100 transition-opacity"
          aria-label={`Remove ${label}`}
        >
          <X size={10} />
        </button>
      )}
    </span>
  )
}
