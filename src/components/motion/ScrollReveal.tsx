/**
 * ScrollReveal — lightweight Intersection Observer-based fade+slide-up component.
 * Uses Framer Motion's whileInView so it integrates with the existing MotionConfig
 * (which already respects prefers-reduced-motion via reducedMotion="user").
 */

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type ScrollRevealProps = {
  children: ReactNode
  /** Vertical offset to slide up from (px). Default: 20 */
  y?: number
  /** Animation delay in seconds. Default: 0 */
  delay?: number
  /** Duration in seconds. Default: 0.55 */
  duration?: number
  /** Additional class names for the wrapper element */
  className?: string
  /** How much of the element must be visible before triggering (0–1). Default: 0.1 */
  amount?: number
}

export function ScrollReveal({
  children,
  y = 20,
  delay = 0,
  duration = 0.55,
  className,
  amount = 0.1,
}: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
