import { useState } from 'react'
import { unsplashSrcSet, unsplashUrl } from '@/lib/images'
import { cn } from '@/lib/cn'
import { RefreshCw, ImageOff } from 'lucide-react'

type OptimizedImageProps = {
  unsplashId?: string
  src?: string
  alt: string
  width: number
  height: number
  sizes: string
  className?: string
  priority?: boolean
}

export function OptimizedImage({
  unsplashId,
  src,
  alt,
  width,
  height,
  sizes,
  className,
  priority = false,
}: OptimizedImageProps) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const resolvedSrc = src || (unsplashId ? unsplashUrl(unsplashId, 1280) : '')
  const resolvedSrcSet = unsplashId ? unsplashSrcSet(unsplashId) : undefined

  if (failed) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 border border-line bg-panel/80 p-4 text-center text-muted',
          className,
        )}
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <ImageOff size={24} className="text-muted/60" />
        <span className="font-mono text-[0.7rem] tracking-wider uppercase text-muted">Frame unavailable</span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setFailed(false)
            setLoaded(false)
            setRetryCount((c) => c + 1)
          }}
          className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 font-mono text-[0.65rem] text-cyan hover:border-cyan"
        >
          <RefreshCw size={11} />
          <span>Retry load</span>
        </button>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ aspectRatio: `${width} / ${height}` }}>
      {/* Skeleton blur shimmer placeholder */}
      {!loaded ? (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-navy via-panel to-navy" />
      ) : null}

      <img
        key={`${resolvedSrc}-${retryCount}`}
        src={resolvedSrc}
        srcSet={resolvedSrcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
      />
    </div>
  )
}
