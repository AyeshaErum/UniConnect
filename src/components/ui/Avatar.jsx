import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '../../lib/utils'
import { getInitials } from '../../utils/helpers'

const AvatarRoot = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn('relative flex shrink-0 overflow-hidden rounded-full', className)}
    {...props}
  />
))
AvatarRoot.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-brand-gradient text-white font-semibold',
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// ── Composite Avatar component (drop-in replacement) ──────────────────────
const sizeClasses = {
  xs:   'h-6 w-6 text-[10px]',
  sm:   'h-8 w-8 text-xs',
  md:   'h-10 w-10 text-sm',
  lg:   'h-14 w-14 text-base',
  xl:   'h-20 w-20 text-xl',
  '2xl':'h-28 w-28 text-3xl',
}

function Avatar({ src, name = '', size = 'md', className = '', onClick }) {
  const sizeClass = sizeClasses[size] || sizeClasses.md
  const initials  = getInitials(name)

  return (
    <AvatarRoot
      className={cn(
        sizeClass,
        'border-2 border-border/50 ring-0 transition-all',
        onClick && 'cursor-pointer hover:ring-2 hover:ring-primary/40',
        className
      )}
      onClick={onClick}
    >
      <AvatarImage src={src} alt={name} />
      <AvatarFallback className="text-current font-semibold">{initials || '?'}</AvatarFallback>
    </AvatarRoot>
  )
}

export default Avatar
export { Avatar, AvatarRoot, AvatarImage, AvatarFallback }
