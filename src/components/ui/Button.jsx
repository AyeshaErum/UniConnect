import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm active:scale-[0.97]',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/85 shadow-sm active:scale-[0.97]',
        outline:
          'border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.97]',
        ghost:
          'bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground',
        destructive:
          'bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground active:scale-[0.97]',
        gradient:
          'bg-brand-gradient text-white hover:opacity-90 shadow-md active:scale-[0.97]',
        muted:
          'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
        pink:
          'bg-accent-pink text-accent-pink-foreground hover:bg-accent-pink/90 shadow-sm active:scale-[0.97]',
      },
      size: {
        default:   'h-9 px-5 py-2',
        sm:        'h-8 px-4 text-xs',
        lg:        'h-11 px-7 text-base',
        xl:        'h-12 px-8 text-base',
        icon:      'h-9 w-9 shrink-0',
        'icon-sm': 'h-7 w-7 shrink-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {children}
          </>
        ) : children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export default Button
export { Button }
