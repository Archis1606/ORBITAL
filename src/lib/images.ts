export function unsplashUrl(unsplashId: string, width: number) {
  return `https://images.unsplash.com/${unsplashId}?auto=format&fit=crop&w=${width}&q=72`
}

export function unsplashSrcSet(unsplashId: string) {
  return [640, 960, 1280, 1600, 2000]
    .map((width) => `${unsplashUrl(unsplashId, width)} ${width}w`)
    .join(', ')
}
