import '@testing-library/jest-dom'

// Mock HTMLCanvasElement.getContext
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = (() => {
    return {
      clearRect: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      moveTo: () => {},
      lineTo: () => {},
      setLineDash: () => {},
      measureText: () => ({ width: 0 }),
      fillText: () => {},
    }
  }) as unknown as typeof HTMLCanvasElement.prototype.getContext
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Mock scrollTo
window.scrollTo = (() => {}) as unknown as typeof window.scrollTo
