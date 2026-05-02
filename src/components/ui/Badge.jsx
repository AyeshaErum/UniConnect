import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary/15 text-primary',
        secondary:
          'border-transparent bg-secondary/20 text-secondary',
        outline:
          'border-border text-foreground bg-transparent',
        muted:
          'border-transparent bg-muted text-muted-foreground',
        destructive:
          'border-transparent bg-accent-pink/15 text-accent-pink',
        success:
          'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
        warning:
          'border-transparent bg-accent-gold/20 text-amber-600 dark:text-accent-gold',
        pink:
          'border-transparent bg-accent-pink/15 text-accent-pink',
        gold:
          'border-transparent bg-accent-gold/20 text-amber-600 dark:text-accent-gold',
        /* legacy aliases kept for backwards compat */
        teal:
          'border-primary/30 bg-primary/10 text-primary',
        purple:
          'border-secondary/30 bg-secondary/10 text-secondary',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

const Badge = React.forwardRef(({ className, variant, ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
))
Badge.displayName = 'Badge'

export default Badge
export { Badge, badgeVariants }
