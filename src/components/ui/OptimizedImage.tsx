import { useState } from 'react'
import { unsplashSrcSet, unsplashUrl } from '@/lib/images'
import { cn } from '@/lib/cn'

type OptimizedImageProps = {
  unsplashId: string
  alt: string
  width: number
  height: number
  sizes: string
  className?: string
  priority?: boolean
}

export function OptimizedImage({
  unsplashId,
  alt,
  width,
  height,
  sizes,
  className,
  priority = false,
}: OptimizedImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={cn('flex items-center justify-center bg-panel text-muted', className)}
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <span className="font-mono text-xs tracking-widest uppercase">Image unavailable</span>
      </div>
    )
  }

  return (
    <img
      src={unsplashUrl(unsplashId, 1280)}
      srcSet={unsplashSrcSet(unsplashId)}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      fetchPriority={priority ? 'high' : 'auto'}
      onError={() => setFailed(true)}
      className={cn('h-full w-full object-cover', className)}
    />
  )
}
