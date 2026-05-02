import { motion } from 'framer-motion'
import { pageTransition } from '../../lib/motion'

export default function PageWrapper({ children, className = '' }) {
  return (
    <motion.div
      {...pageTransition}
      className={`min-h-[calc(100vh-4rem)] ${className}`}
    >
      {children}
    </motion.div>
  )
}
