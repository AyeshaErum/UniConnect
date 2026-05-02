import { classNames } from '../../utils/helpers'

export default function Input({
  label, error, icon: Icon, className = '',
  containerClass = '', ...props
}) {
  return (
    <div className={classNames('flex flex-col gap-1.5', containerClass)}>
      {label && (
        <label className="text-sm font-medium text-navy-200">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon size={16} className="text-navy-400" />
          </div>
        )}
        <input
          className={classNames(
            'w-full bg-navy-800 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-navy-400',
            'focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors',
            error ? 'border-accent-coral' : 'border-navy-600 hover:border-navy-500',
            Icon && 'pl-9',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-accent-coral">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', containerClass = '', ...props }) {
  return (
    <div className={classNames('flex flex-col gap-1.5', containerClass)}>
      {label && <label className="text-sm font-medium text-navy-200">{label}</label>}
      <textarea
        className={classNames(
          'w-full bg-navy-800 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-navy-400 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors',
          error ? 'border-accent-coral' : 'border-navy-600 hover:border-navy-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-accent-coral">{error}</p>}
    </div>
  )
}

export function Select({ label, error, className = '', containerClass = '', children, ...props }) {
  return (
    <div className={classNames('flex flex-col gap-1.5', containerClass)}>
      {label && <label className="text-sm font-medium text-navy-200">{label}</label>}
      <select
        className={classNames(
          'w-full bg-navy-800 border rounded-xl px-4 py-2.5 text-sm text-white',
          'focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors',
          error ? 'border-accent-coral' : 'border-navy-600 hover:border-navy-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-accent-coral">{error}</p>}
    </div>
  )
}
