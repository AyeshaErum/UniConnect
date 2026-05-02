import { classNames } from '../../utils/helpers'

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={classNames(
        'bg-navy-900 border border-navy-700 rounded-2xl shadow-card',
        hover && 'transition-all duration-200 hover:-translate-y-1 hover:shadow-glow hover:border-teal-700/50 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
