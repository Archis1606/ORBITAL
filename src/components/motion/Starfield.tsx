import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface Star {
  x: number
  y: number
  r: number
  baseAlpha: number
  twinkleSpeed: number
  layer: number // 0 = distant, 1 = mid, 2 = near
  color: string
}

interface ShootingStar {
  x: number
  y: number
  length: number
  speed: number
  angle: number
  alpha: number
  active: boolean
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const starCount = reduced ? 30 : Math.min(110, Math.floor((width * height) / 12000))
    const starColors = ['#e8eef8', '#3ee0ff', '#9b8cff', '#ffffff']

    const stars: Star[] = Array.from({ length: starCount }, () => {
      const layer = Math.random() < 0.6 ? 0 : Math.random() < 0.85 ? 1 : 2
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: layer === 0 ? Math.random() * 0.7 + 0.3 : layer === 1 ? Math.random() * 1.0 + 0.6 : Math.random() * 1.4 + 1.1,
        baseAlpha: layer === 0 ? 0.25 : layer === 1 ? 0.55 : 0.85,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        layer,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      }
    })

    const shootingStar: ShootingStar = {
      x: 0,
      y: 0,
      length: 0,
      speed: 0,
      angle: 0,
      alpha: 0,
      active: false,
    }

    let mouseX = width / 2
    let mouseY = height / 2
    let targetMouseX = width / 2
    let targetMouseY = height / 2

    const onMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX
      targetMouseY = e.clientY
    }

    if (!reduced) {
      window.addEventListener('mousemove', onMouseMove, { passive: true })
    }

    let frame = 0
    let raf = 0
    let lastMeteorTime = Date.now()

    const triggerMeteor = () => {
      shootingStar.x = Math.random() * width * 0.7 + width * 0.1
      shootingStar.y = Math.random() * height * 0.3
      shootingStar.length = Math.random() * 90 + 70
      shootingStar.speed = Math.random() * 12 + 10
      shootingStar.angle = (Math.PI / 4) + (Math.random() * 0.3 - 0.15)
      shootingStar.alpha = 1
      shootingStar.active = true
      lastMeteorTime = Date.now()
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // Smooth mouse parallax damping
      if (!reduced) {
        mouseX += (targetMouseX - mouseX) * 0.05
        mouseY += (targetMouseY - mouseY) * 0.05
      }

      const offsetX = (mouseX - width / 2) * 0.012
      const offsetY = (mouseY - height / 2) * 0.012

      // Draw stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]
        const parallaxMult = s.layer === 0 ? 0.3 : s.layer === 1 ? 0.8 : 1.5
        const px = s.x - offsetX * parallaxMult
        const py = s.y - offsetY * parallaxMult

        const twinkle = reduced ? s.baseAlpha : s.baseAlpha + Math.sin(frame * s.twinkleSpeed + i) * 0.2
        const alpha = Math.max(0.1, Math.min(1, twinkle))

        ctx.fillStyle = s.color
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(px, py, s.r, 0, Math.PI * 2)
        ctx.fill()

        // Subtle flare for brightest layer 2 stars
        if (s.layer === 2 && !reduced && alpha > 0.7) {
          ctx.strokeStyle = s.color
          ctx.lineWidth = 0.5
          ctx.globalAlpha = alpha * 0.3
          ctx.beginPath()
          ctx.moveTo(px - s.r * 2.5, py)
          ctx.lineTo(px + s.r * 2.5, py)
          ctx.moveTo(px, py - s.r * 2.5)
          ctx.lineTo(px, py + s.r * 2.5)
          ctx.stroke()
        }
      }

      // Draw shooting star
      if (!reduced && shootingStar.active) {
        ctx.globalAlpha = shootingStar.alpha
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(shootingStar.x, shootingStar.y)
        const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length
        const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length
        ctx.lineTo(tailX, tailY)
        ctx.stroke()

        shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed
        shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed
        shootingStar.alpha -= 0.02

        if (shootingStar.alpha <= 0) {
          shootingStar.active = false
        }
      }

      // Trigger meteor occasionally (every 8 to 14 seconds)
      if (!reduced && !shootingStar.active && Date.now() - lastMeteorTime > 9000 && Math.random() < 0.005) {
        triggerMeteor()
      }

      ctx.globalAlpha = 1
      frame++

      if (!reduced) {
        raf = requestAnimationFrame(draw)
      }
    }

    const resize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      draw()
    }

    resize()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      if (!reduced) {
        window.removeEventListener('mousemove', onMouseMove)
      }
    }
  }, [reduced])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-75"
    />
  )
}
