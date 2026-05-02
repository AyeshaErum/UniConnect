import { useEffect } from 'react'
import { X } from 'lucide-react'
import { classNames } from '../../utils/helpers'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else      document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog" aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={classNames(
        'relative w-full bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl animate-slide-up',
        widths[size]
      )}>
        <div className="flex items-center justify-between p-5 border-b border-navy-700">
          <h2 className="text-lg font-semibold font-display text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-navy-400 hover:text-white hover:bg-navy-700 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
