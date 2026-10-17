import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const stars = Array.from({ length: reduced ? 40 : 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * 0.6 + 0.2,
    }))

    let frame = 0
    let raf = 0

    const draw = () => {
      const { width, height } = canvas
      context.clearRect(0, 0, width, height)
      stars.forEach((star, index) => {
        const twinkle = reduced ? star.a : star.a + Math.sin(frame / 80 + index) * 0.12
        context.fillStyle = `rgba(232, 238, 248, ${Math.max(0.08, twinkle)})`
        context.beginPath()
        context.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2)
        context.fill()
      })
      frame += 1
      if (!reduced) raf = requestAnimationFrame(draw)
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      draw()
    }

    resize()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [reduced])

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 opacity-70" />
}
