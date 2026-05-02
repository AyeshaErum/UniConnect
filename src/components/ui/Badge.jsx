import { classNames } from '../../utils/helpers'

const colors = {
  teal:   'bg-teal-500/15 text-teal-300 border border-teal-500/30',
  navy:   'bg-navy-700 text-navy-200 border border-navy-600',
  yellow: 'bg-accent-yellow/15 text-accent-yellow border border-accent-yellow/30',
  coral:  'bg-accent-coral/15 text-accent-coral border border-accent-coral/30',
  green:  'bg-accent-green/15 text-accent-green border border-accent-green/30',
  red:    'bg-red-500/15 text-red-400 border border-red-500/30',
  gray:   'bg-navy-800 text-navy-300 border border-navy-600',
}

export default function Badge({ children, color = 'navy', size = 'sm', className = '' }) {
  const sizeClass = size === 'xs' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
  return (
    <span className={classNames(
      'inline-flex items-center rounded-full font-medium',
      sizeClass,
      colors[color] || colors.gray,
      className
    )}>
      {children}
    </span>
  )
}
