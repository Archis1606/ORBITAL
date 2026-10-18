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
    }, 1250)
    return () => window.clearTimeout(timeout)
  }, [reduced])

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, '1')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          onClick={dismiss}
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-void select-none"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: 'blur(8px)',
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
          }}
          role="status"
          aria-live="polite"
        >
          {/* Subtle aperture ring animation */}
          <motion.div
            className="pointer-events-none absolute h-64 w-64 rounded-full border border-cyan/20"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.15, 1.3], opacity: [0, 0.6, 0] }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          />

          <div className="relative text-center">
            <motion.p
              className="font-mono text-[0.65rem] tracking-[0.45em] text-cyan uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              Focal calibration · System online
            </motion.p>

            <motion.h1
              className="mt-3 font-display text-5xl tracking-[0.38em] font-light text-ivory md:text-7xl"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              ORBITAL
            </motion.h1>

            <motion.div
              className="mx-auto mt-4 h-[1px] bg-linear-to-r from-transparent via-cyan to-transparent"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 180, opacity: 0.8 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            />

            <motion.p
              className="mt-4 font-mono text-[0.6rem] tracking-[0.25em] text-muted uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.4 }}
            >
              Click anywhere to enter immediately
            </motion.p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
