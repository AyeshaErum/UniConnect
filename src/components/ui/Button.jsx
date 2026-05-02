import { classNames } from '../../utils/helpers'

const variants = {
  primary:   'bg-teal-500 hover:bg-teal-400 text-navy-950 font-semibold shadow-glow hover:shadow-glow-lg',
  secondary: 'bg-navy-800 hover:bg-navy-700 text-white border border-navy-600',
  outline:   'bg-transparent border border-teal-500 text-teal-400 hover:bg-teal-500/10',
  ghost:     'bg-transparent text-navy-200 hover:bg-navy-800 hover:text-white',
  danger:    'bg-accent-coral/20 border border-accent-coral text-accent-coral hover:bg-accent-coral hover:text-white',
}

const sizes = {
  sm:  'px-3 py-1.5 text-sm rounded-lg',
  md:  'px-4 py-2 text-sm rounded-xl',
  lg:  'px-6 py-3 text-base rounded-xl',
}

export default function Button({
  children, variant = 'primary', size = 'md',
  className = '', loading = false, disabled = false, ...props
}) {
  return (
    <button
      className={classNames(
        'inline-flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      )}
      {children}
    </button>
  )
}
