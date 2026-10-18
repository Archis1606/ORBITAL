import { useState, useRef, useCallback, useEffect } from 'react'
import { Sliders } from 'lucide-react'

interface BeforeAfterSliderProps {
  beforeUrl: string
  afterUrl: string
  alt: string
  beforeLabel?: string
  afterLabel?: string
  aspectRatio?: string
}

export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  alt,
  beforeLabel = 'Single Raw Frame',
  afterLabel = 'Stacked & Processed Master',
  aspectRatio = '16/10',
}: BeforeAfterSliderProps) {
  const [sliderPos, setSliderPos] = useState(50) // percentage 0 - 100
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.min(100, Math.max(0, (x / rect.width) * 100))
    setSliderPos(percent)
  }, [])

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging.current) return
      handleMove(e.touches[0].clientX)
    },
    [handleMove],
  )

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) return
      handleMove(e.clientX)
    },
    [handleMove],
  )

  const onStop = useCallback(() => {
    isDragging.current = false
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onStop)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('touchend', onStop)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onStop)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onStop)
    }
  }, [onMouseMove, onStop, onTouchMove])

  return (
    <div
      ref={containerRef}
      onMouseDown={() => {
        isDragging.current = true
      }}
      onTouchStart={() => {
        isDragging.current = true
      }}
      className="relative w-full overflow-hidden rounded-2xl border border-line bg-navy-deep select-none cursor-ew-resize group"
      style={{ aspectRatio }}
    >
      {/* "After" Image (Processed Master) - Full Background */}
      <img
        src={afterUrl}
        alt={`${alt} - ${afterLabel}`}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {/* "Before" Image (Raw) - Inset Clip */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
      >
        <img
          src={beforeUrl}
          alt={`${alt} - ${beforeLabel}`}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      </div>

      {/* Vertical divider line */}
      <div
        className="absolute top-0 bottom-0 z-20 w-[2px] bg-cyan shadow-[0_0_12px_rgba(62,224,255,0.8)]"
        style={{ left: `${sliderPos}%` }}
      >
        {/* Center Drag Handle */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-cyan bg-void/90 text-cyan shadow-lg">
          <Sliders size={13} className="rotate-90" />
        </div>
      </div>

      {/* Labels */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-30 rounded-full border border-white/10 bg-void/70 px-2.5 py-1 font-mono text-[0.62rem] text-ivory/80 backdrop-blur-md">
        {beforeLabel}
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3 z-30 rounded-full border border-white/10 bg-void/70 px-2.5 py-1 font-mono text-[0.62rem] text-cyan backdrop-blur-md">
        {afterLabel}
      </div>
    </div>
  )
}
