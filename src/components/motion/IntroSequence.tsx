import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const SESSION_KEY = 'orbital.intro.seen'

export function IntroSequence() {
  const reduced = usePrefersReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem(SESSION_KEY) === '1'
    if (seen || reduced) {
      sessionStorage.setItem(SESSION_KEY, '1')
      return
    }
    setVisible(true)
    const timeout = window.setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, '1')
      setVisible(false)
    }, 2200)
    return () => window.clearTimeout(timeout)
  }, [reduced])

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center bg-void"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          role="status"
          aria-live="polite"
        >
          <div className="text-center">
            <p className="font-mono text-xs tracking-[0.4em] text-cyan uppercase">Observatory online</p>
            <motion.h1
              className="mt-4 font-display text-5xl tracking-[0.35em] md:text-7xl"
              initial={{ opacity: 0, letterSpacing: '0.6em' }}
              animate={{ opacity: 1, letterSpacing: '0.35em' }}
              transition={{ duration: 0.8 }}
            >
              ORBITAL
            </motion.h1>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
