import { getInitials, classNames } from '../../utils/helpers'

const sizes = {
  xs:  'w-6 h-6 text-xs',
  sm:  'w-8 h-8 text-xs',
  md:  'w-10 h-10 text-sm',
  lg:  'w-14 h-14 text-base',
  xl:  'w-20 h-20 text-xl',
  '2xl': 'w-28 h-28 text-3xl',
}

export default function Avatar({ src, name = '', size = 'md', className = '', onClick }) {
  const sizeClass = sizes[size] || sizes.md
  const initials  = getInitials(name)

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        onClick={onClick}
        className={classNames(
          'rounded-full object-cover shrink-0 border-2 border-navy-700',
          sizeClass,
          onClick && 'cursor-pointer hover:border-teal-500 transition-colors',
          className
        )}
      />
    )
  }

  return (
    <div
      onClick={onClick}
      className={classNames(
        'rounded-full shrink-0 flex items-center justify-center font-semibold',
        'bg-gradient-to-br from-teal-600 to-navy-600 text-white border-2 border-navy-700',
        sizeClass,
        onClick && 'cursor-pointer hover:border-teal-500 transition-colors',
        className
      )}
      aria-label={name || 'User avatar'}
    >
      {initials || '?'}
    </div>
  )
}
