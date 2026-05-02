import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const Card = React.forwardRef(({ className, hover = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border border-border/60 bg-card text-card-foreground shadow-card',
      hover && 'transition-all duration-200 hover:-translate-y-1 hover:shadow-card-lg hover:border-primary/20 cursor-pointer',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-5', className)} {...props} />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('font-semibold leading-none tracking-tight', className)} {...props} />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center p-5 pt-0', className)} {...props} />
))
CardFooter.displayName = 'CardFooter'

// Animated card variant with framer-motion
const MotionCard = React.forwardRef(({ className, children, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4, boxShadow: '0 12px 40px -8px rgba(0,0,0,0.45)' }}
    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    className={cn(
      'rounded-xl border border-border/60 bg-card text-card-foreground shadow-card cursor-pointer',
      className
    )}
    {...props}
  >
    {children}
  </motion.div>
))
MotionCard.displayName = 'MotionCard'

export default Card
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, MotionCard }
