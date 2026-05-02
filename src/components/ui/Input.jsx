import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '../../lib/utils'

// ── Label ──────────────────────────────────────────────────────────────────
const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn('text-sm font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
    {...props}
  />
))
Label.displayName = 'Label'

// ── Input ──────────────────────────────────────────────────────────────────
const Input = React.forwardRef(({ className, label, error, icon: Icon, containerClass, type, ...props }, ref) => (
  <div className={cn('space-y-1.5', containerClass)}>
    {label && <Label>{label}</Label>}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Icon size={15} className="text-muted-foreground" />
        </div>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          Icon && 'pl-9',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
))
Input.displayName = 'Input'

// ── Textarea ───────────────────────────────────────────────────────────────
const Textarea = React.forwardRef(({ className, label, error, containerClass, ...props }, ref) => (
  <div className={cn('space-y-1.5', containerClass)}>
    {label && <Label>{label}</Label>}
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors resize-none',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-destructive',
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
))
Textarea.displayName = 'Textarea'

// ── Select ─────────────────────────────────────────────────────────────────
const Select = React.forwardRef(({ className, label, error, containerClass, children, ...props }, ref) => (
  <div className={cn('space-y-1.5', containerClass)}>
    {label && <Label>{label}</Label>}
    <select
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-destructive',
        className
      )}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
))
Select.displayName = 'Select'

export default Input
export { Input, Textarea, Select, Label }
