export const durations = {
  fast: 0.18,
  medium: 0.45,
  slow: 0.8,
} as const

export const easings = {
  cinematic: [0.22, 1, 0.36, 1] as const,
}

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}
