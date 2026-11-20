import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

// Fade-up when the block scrolls into view
export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.5,
}: {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
