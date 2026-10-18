import { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Share2,
  Info,
  Check,
  MapPin,
  Camera,
  Layers,
  Sparkles,
  Plane,
  RotateCcw,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ErrorState } from '@/components/ui/ErrorState'
import { FavoriteButton } from '@/components/ui/FavoriteButton'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { BeforeAfterSlider } from '@/components/ui/BeforeAfterSlider'
import { getAllAvailablePhotos, getPhotoById } from '@/services/photoService'
import { photoCreator } from '@/data/photos'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { disciplineLabel, formatCaptureDate } from '@/lib/format'
import type { Photo } from '@/types/models'
import { cn } from '@/lib/cn'

export function PhotoDetailPage() {
  const { photoId } = useParams()
  const navigate = useNavigate()
  const [photo, setPhoto] = useState<Photo | undefined>()
  const [loading, setLoading] = useState(true)

  // Viewer display state
  const [zoomLevel, setZoomLevel] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const startPanRef = useRef({ x: 0, y: 0, initialX: 0, initialY: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [copiedShare, setCopiedShare] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'comparison' | 'specs'>('details')
  const stageRef = useRef<HTMLDivElement>(null)

  // Fetch photo and creator
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    if (photoId) {
      getPhotoById(photoId).then((found) => {
        if (!cancelled) {
          setPhoto(found)
          setLoading(false)
          // Reset zoom and pan on photo change
          setZoomLevel(1)
          setPan({ x: 0, y: 0 })
        }
      })
    }
    return () => {
      cancelled = true
    }
  }, [photoId])

  const creator = photo ? photoCreator(photo) : undefined

  useDocumentTitle(photo ? `${photo.title} — ORBITAL` : 'Observing Frame — ORBITAL')

  // Find next and previous photos for carousel navigation
  const allPhotos = getAllAvailablePhotos()
  const currentIndex = photo ? allPhotos.findIndex((p) => p.id === photo.id) : -1
  const prevPhoto = currentIndex > 0 ? allPhotos[currentIndex - 1] : allPhotos[allPhotos.length - 1]
  const nextPhoto = currentIndex >= 0 && currentIndex < allPhotos.length - 1 ? allPhotos[currentIndex + 1] : allPhotos[0]

  const goToPrev = useCallback(() => {
    if (prevPhoto) navigate(`/photos/${prevPhoto.id}`)
  }, [prevPhoto, navigate])

  const goToNext = useCallback(() => {
    if (nextPhoto) navigate(`/photos/${nextPhoto.id}`)
  }, [nextPhoto, navigate])

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
        setIsFullscreen(false)
      }
    }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if focus is inside an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return
      }

      if (event.key === 'Escape') {
        if (drawerOpen) {
          setDrawerOpen(false)
        } else {
          navigate(-1)
        }
      } else if (event.key === 'ArrowLeft') {
        goToPrev()
      } else if (event.key === 'ArrowRight') {
        goToNext()
      } else if (event.key === '+' || event.key === '=') {
        setZoomLevel((z) => Math.min(3, z + 0.25))
      } else if (event.key === '-' || event.key === '_') {
        setZoomLevel((z) => {
          const nextZ = Math.max(1, z - 0.25)
          if (nextZ === 1) setPan({ x: 0, y: 0 })
          return nextZ
        })
      } else if (event.key === '0') {
        setZoomLevel(1)
        setPan({ x: 0, y: 0 })
      } else if (event.key === 'f' || event.key === 'F') {
        toggleFullscreen()
      } else if (event.key === 'i' || event.key === 'I') {
        setDrawerOpen((v) => !v)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, goToPrev, goToNext, toggleFullscreen, drawerOpen])

  // Pan dragging logic when zoomed in
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return
    setIsPanning(true)
    startPanRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: pan.x,
      initialY: pan.y,
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || zoomLevel <= 1) return
    const dx = e.clientX - startPanRef.current.x
    const dy = e.clientY - startPanRef.current.y
    setPan({
      x: startPanRef.current.initialX + dx,
      y: startPanRef.current.initialY + dy,
    })
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  // Share action
  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: photo?.title,
          text: `Check out ${photo?.title} by ${creator?.displayName} on ORBITAL`,
          url,
        })
        return
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopiedShare(true)
      setTimeout(() => setCopiedShare(false), 2200)
    } catch {
      // Ignore
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-void">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-cyan" />
          <p className="font-mono text-xs tracking-widest text-cyan uppercase">Calibrating optical sensor...</p>
        </div>
      </div>
    )
  }

  if (!photo) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <ErrorState
          title="Frame identifier not registered"
          body="The requested catalog frame could not be resolved from local or remote repositories."
        />
        <div className="mt-6">
          <Link
            to="/archive"
            className="inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-cyan/15 px-5 py-2.5 font-mono text-xs text-cyan hover:border-cyan"
          >
            <span>Return to Discovery Archive</span>
          </Link>
        </div>
      </div>
    )
  }

  const hasComparison = Boolean(photo.astro?.comparisonRawUrl)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-void select-none overflow-hidden">
      {/* HUD Header Bar */}
      <header className="relative z-40 flex h-14 shrink-0 items-center justify-between border-b border-line/40 bg-void/85 px-4 md:px-6 backdrop-blur-md">
        {/* Left: Frame Title and Discipline */}
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 rounded-full border border-line p-2 text-ivory hover:border-cyan hover:text-cyan transition-colors"
            title="Close viewer (Esc)"
            aria-label="Close viewer"
          >
            <X size={16} />
          </button>

          <div className="truncate">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-display text-base font-medium text-ivory">{photo.title}</h1>
              <Badge tone={photo.discipline}>{disciplineLabel(photo.discipline)}</Badge>
            </div>
            {creator ? (
              <p className="truncate font-mono text-[0.68rem] text-muted">
                by {creator.displayName} · @{creator.handle}
              </p>
            ) : null}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Favorite button */}
          <FavoriteButton photoId={photo.id} />

          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-navy/60 px-3 py-1.5 font-mono text-xs text-ivory hover:border-cyan hover:text-cyan transition-colors"
            title="Share frame link"
          >
            {copiedShare ? <Check size={14} className="text-mint" /> : <Share2 size={14} />}
            <span className="hidden sm:inline">{copiedShare ? 'Copied' : 'Share'}</span>
          </button>

          {/* Metadata Drawer Toggle */}
          <button
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs transition-colors',
              drawerOpen
                ? 'border-cyan bg-cyan/20 text-cyan'
                : 'border-line bg-navy/60 text-ivory hover:border-cyan hover:text-cyan',
            )}
            title="Toggle telemetry specs (I)"
          >
            <Info size={14} />
            <span className="hidden sm:inline">Telemetry</span>
          </button>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="rounded-full border border-line bg-navy/60 p-2 text-ivory hover:border-cyan hover:text-cyan transition-colors"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* Main Stage: Cinematic Viewport */}
      <div
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={cn(
          'relative flex flex-1 items-center justify-center overflow-hidden p-4 md:p-8',
          zoomLevel > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default',
        )}
      >
        {/* Next / Previous Lateral Navigation Chevrons */}
        <button
          type="button"
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-line/60 bg-void/70 text-ivory/80 backdrop-blur-md transition-all hover:border-cyan hover:bg-void hover:text-cyan hover:scale-105"
          title="Previous frame (Left arrow)"
          aria-label="Previous photograph"
        >
          <ChevronLeft size={22} />
        </button>

        <button
          type="button"
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-line/60 bg-void/70 text-ivory/80 backdrop-blur-md transition-all hover:border-cyan hover:bg-void hover:text-cyan hover:scale-105"
          title="Next frame (Right arrow)"
          aria-label="Next photograph"
        >
          <ChevronRight size={22} />
        </button>

        {/* The Natural Aspect-Ratio Image Container */}
        <div
          className="relative max-h-full max-w-full transition-transform duration-100 ease-out flex items-center justify-center"
          style={{
            transform: `scale(${zoomLevel}) translate(${pan.x / zoomLevel}px, ${pan.y / zoomLevel}px)`,
          }}
        >
          <div
            className="overflow-hidden rounded-xl shadow-2xl border border-line/40 bg-navy-deep"
            style={{
              aspectRatio: `${photo.width} / ${photo.height}`,
              maxHeight: 'calc(100vh - 12rem)',
              maxWidth: 'calc(100vw - 6rem)',
            }}
          >
            <OptimizedImage
              unsplashId={photo.unsplashId}
              src={photo.customImageUrl}
              alt={photo.imageAlt || photo.title}
              width={photo.width}
              height={photo.height}
              sizes="100vw"
              priority
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Floating Zoom & Control Toolbar at Bottom Center */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 rounded-full border border-line/60 bg-void/80 px-3 py-1.5 backdrop-blur-md shadow-2xl font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setZoomLevel((z) => {
                const nextZ = Math.max(1, z - 0.25)
                if (nextZ === 1) setPan({ x: 0, y: 0 })
                return nextZ
              })
            }}
            disabled={zoomLevel <= 1}
            className="p-1.5 text-muted hover:text-cyan disabled:opacity-30 disabled:hover:text-muted"
            title="Zoom out (-)"
          >
            <ZoomOut size={16} />
          </button>

          <span className="w-12 text-center text-ivory text-[0.7rem]">
            {Math.round(zoomLevel * 100)}%
          </span>

          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
            disabled={zoomLevel >= 3}
            className="p-1.5 text-muted hover:text-cyan disabled:opacity-30 disabled:hover:text-muted"
            title="Zoom in (+)"
          >
            <ZoomIn size={16} />
          </button>

          <div className="h-4 w-[1px] bg-line/60 mx-1" />

          <button
            type="button"
            onClick={() => {
              setZoomLevel(1)
              setPan({ x: 0, y: 0 })
            }}
            className="p-1.5 text-muted hover:text-cyan"
            title="Reset Zoom (0)"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Expandable Technical Telemetry Drawer (Slide-in Sidebar) */}
      {drawerOpen ? (
        <aside
          className="fixed top-14 right-0 bottom-0 z-50 w-full max-w-md border-l border-line bg-navy/95 p-6 backdrop-blur-xl shadow-2xl overflow-y-auto flex flex-col justify-between"
          aria-label="Technical Photograph Telemetry"
        >
          <div>
            <div className="flex items-center justify-between border-b border-line/60 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan animate-pulse" />
                <h2 className="font-mono text-xs tracking-widest text-cyan uppercase">
                  Optical & Flight Telemetry
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-full border border-line p-1 text-muted hover:text-ivory"
                aria-label="Close telemetry drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Navigation Tabs if Comparison Exists */}
            {hasComparison ? (
              <div className="mt-4 flex gap-2 border-b border-line/50 pb-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={cn(
                    'px-3 py-1 rounded-full transition-colors',
                    activeTab === 'details' ? 'bg-cyan/20 text-cyan border border-cyan/40' : 'text-muted hover:text-ivory',
                  )}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('comparison')}
                  className={cn(
                    'px-3 py-1 rounded-full transition-colors flex items-center gap-1',
                    activeTab === 'comparison' ? 'bg-violet/20 text-violet border border-violet/40' : 'text-muted hover:text-ivory',
                  )}
                >
                  <Layers size={12} />
                  <span>Before / After</span>
                </button>
              </div>
            ) : null}

            {/* Tab: Before/After Slider */}
            {activeTab === 'comparison' && photo.astro?.comparisonRawUrl ? (
              <div className="mt-5 space-y-3">
                <p className="font-mono text-xs text-muted">
                  Drag the center slider to inspect raw unstacked sensor capture vs final photometric calibration:
                </p>
                <BeforeAfterSlider
                  beforeUrl={photo.astro.comparisonRawUrl}
                  afterUrl={photo.customImageUrl || `https://images.unsplash.com/${photo.unsplashId}?auto=format&fit=crop&w=1280&q=75`}
                  alt={photo.title}
                  aspectRatio={`${photo.width} / ${photo.height}`}
                />
                <p className="text-[0.68rem] text-muted italic">
                  Single sub-exposure demonstrates raw sensor noise and light pollution before dark/flat/bias calibration.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-6">
                {/* Description & Caption */}
                <div>
                  <h3 className="font-display text-2xl text-ivory">{photo.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{photo.caption}</p>
                </div>

                {/* Creator Attribution */}
                {creator ? (
                  <div className="rounded-2xl border border-line bg-panel/70 p-4">
                    <p className="font-mono text-[0.65rem] tracking-wider text-muted uppercase">Photographer</p>
                    <Link
                      to={`/creators/${creator.handle}`}
                      className="mt-1 flex items-center gap-3 group"
                    >
                      {creator.avatarUrl ? (
                        <img
                          src={creator.avatarUrl}
                          alt={creator.displayName}
                          className="h-9 w-9 rounded-full object-cover border border-line"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-cyan/20 border border-cyan/40 flex items-center justify-center font-mono text-xs text-cyan">
                          {creator.displayName[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-ivory group-hover:text-cyan transition-colors">
                          {creator.displayName}
                        </p>
                        <p className="font-mono text-[0.7rem] text-muted">@{creator.handle}</p>
                      </div>
                    </Link>
                  </div>
                ) : null}

                {/* EXIF Data */}
                <div>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-cyan uppercase tracking-wider mb-2">
                    <Camera size={13} />
                    <span>Optical Exposure Specs</span>
                  </div>
                  <dl className="grid grid-cols-2 gap-2 font-mono text-xs">
                    <div className="rounded-xl border border-line/60 bg-panel/50 p-2.5">
                      <dt className="text-[0.65rem] text-muted uppercase">Camera</dt>
                      <dd className="mt-0.5 text-ivory truncate">{photo.exif?.camera || photo.camera}</dd>
                    </div>
                    <div className="rounded-xl border border-line/60 bg-panel/50 p-2.5">
                      <dt className="text-[0.65rem] text-muted uppercase">Optics</dt>
                      <dd className="mt-0.5 text-ivory truncate">{photo.exif?.lens || photo.optics}</dd>
                    </div>
                    <div className="rounded-xl border border-line/60 bg-panel/50 p-2.5">
                      <dt className="text-[0.65rem] text-muted uppercase">Exposure</dt>
                      <dd className="mt-0.5 text-ivory">{photo.exif?.exposure || photo.exposure}</dd>
                    </div>
                    <div className="rounded-xl border border-line/60 bg-panel/50 p-2.5">
                      <dt className="text-[0.65rem] text-muted uppercase">Captured Date</dt>
                      <dd className="mt-0.5 text-ivory">{formatCaptureDate(photo.capturedAt)}</dd>
                    </div>
                  </dl>
                </div>

                {/* Astrophotography Specific Details */}
                {photo.discipline === 'astrophotography' && photo.astro ? (
                  <div>
                    <div className="flex items-center gap-1.5 font-mono text-xs text-violet uppercase tracking-wider mb-2">
                      <Sparkles size={13} />
                      <span>Celestial Observatory Specs</span>
                    </div>
                    <dl className="space-y-2 font-mono text-xs">
                      {photo.astro.target ? (
                        <div className="flex justify-between border-b border-line/40 py-1">
                          <dt className="text-muted">Target</dt>
                          <dd className="text-ivory font-medium">{photo.astro.target}</dd>
                        </div>
                      ) : null}
                      {photo.astro.mount ? (
                        <div className="flex justify-between border-b border-line/40 py-1">
                          <dt className="text-muted">Tracking Mount</dt>
                          <dd className="text-ivory">{photo.astro.mount}</dd>
                        </div>
                      ) : null}
                      {photo.astro.filters ? (
                        <div className="flex justify-between border-b border-line/40 py-1">
                          <dt className="text-muted">Optical Filters</dt>
                          <dd className="text-ivory">{photo.astro.filters}</dd>
                        </div>
                      ) : null}
                      {photo.astro.bortleClass ? (
                        <div className="flex justify-between border-b border-line/40 py-1">
                          <dt className="text-muted">Bortle Dark-Sky Class</dt>
                          <dd className="text-ivory">Class {photo.astro.bortleClass} Plateau</dd>
                        </div>
                      ) : null}
                      {photo.astro.processingNotes ? (
                        <div className="pt-1">
                          <dt className="text-muted text-[0.65rem] uppercase">Processing Notes</dt>
                          <dd className="text-ivory/80 text-[0.72rem] mt-0.5 leading-relaxed font-sans">
                            {photo.astro.processingNotes}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>
                ) : null}

                {/* Aviation Specific Details */}
                {photo.discipline === 'aviation' && photo.aviation ? (
                  <div>
                    <div className="flex items-center gap-1.5 font-mono text-xs text-mint uppercase tracking-wider mb-2">
                      <Plane size={13} />
                      <span>Flight Operations Telemetry</span>
                    </div>
                    <dl className="space-y-2 font-mono text-xs">
                      {photo.aviation.aircraftType ? (
                        <div className="flex justify-between border-b border-line/40 py-1">
                          <dt className="text-muted">Aircraft Classification</dt>
                          <dd className="text-ivory font-medium">{photo.aviation.aircraftType}</dd>
                        </div>
                      ) : null}
                      {photo.aviation.manufacturer ? (
                        <div className="flex justify-between border-b border-line/40 py-1">
                          <dt className="text-muted">Manufacturer</dt>
                          <dd className="text-ivory">{photo.aviation.manufacturer}</dd>
                        </div>
                      ) : null}
                      {photo.aviation.airline ? (
                        <div className="flex justify-between border-b border-line/40 py-1">
                          <dt className="text-muted">Operator / Airline</dt>
                          <dd className="text-ivory">{photo.aviation.airline}</dd>
                        </div>
                      ) : null}
                      {photo.aviation.airportName || photo.aviation.airportCode ? (
                        <div className="flex justify-between border-b border-line/40 py-1">
                          <dt className="text-muted">Terminal / Field</dt>
                          <dd className="text-ivory">
                            {photo.aviation.airportName} ({photo.aviation.airportCode})
                          </dd>
                        </div>
                      ) : null}
                      {photo.aviation.registration ? (
                        <div className="flex justify-between border-b border-line/40 py-1">
                          <dt className="text-muted">Verified Tail Registration</dt>
                          <dd className="text-ivory font-semibold">{photo.aviation.registration}</dd>
                        </div>
                      ) : null}
                      {photo.aviation.flightConditions ? (
                        <div className="pt-1">
                          <dt className="text-muted text-[0.65rem] uppercase">Operating Conditions</dt>
                          <dd className="text-ivory/80 text-[0.72rem] mt-0.5 leading-relaxed font-sans">
                            {photo.aviation.flightConditions}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>
                ) : null}

                {/* Verified Location & Coordinates (Privacy Protected) */}
                {photo.locationCoordinates && photo.locationCoordinates.allowLocationSharing ? (
                  <div className="rounded-2xl border border-line bg-panel/50 p-3 font-mono text-xs">
                    <div className="flex items-center gap-1.5 text-cyan mb-1">
                      <MapPin size={13} />
                      <span className="text-[0.68rem] tracking-wider uppercase">Verified Coordinates</span>
                    </div>
                    <p className="text-ivory">
                      {photo.locationCoordinates.latitude.toFixed(4)}° N,{' '}
                      {photo.locationCoordinates.longitude.toFixed(4)}° W
                    </p>
                    <p className="text-[0.62rem] text-muted mt-1">
                      Photographer explicitly verified GPS sharing for this frame.
                    </p>
                  </div>
                ) : null}

                {/* Licensing & Rights */}
                <div className="border-t border-line/60 pt-4 font-mono text-[0.68rem] text-muted space-y-1">
                  <p>Attribution: {photo.license || 'All Rights Reserved'}</p>
                  <p>Catalog Index: {photo.id}</p>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer Navigation Link */}
          <div className="pt-6 border-t border-line/60">
            <Link
              to="/archive"
              className="block w-full text-center rounded-full border border-line py-2 text-xs font-mono text-muted hover:border-cyan hover:text-cyan transition-colors"
            >
              Back to Full Archive Grid
            </Link>
          </div>
        </aside>
      ) : null}
    </div>
  )
}
