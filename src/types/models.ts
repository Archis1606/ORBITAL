export type Discipline = 'astrophotography' | 'aviation'

export type SampleFlag = 'SAMPLE'

export type Creator = {
  id: string
  displayName: string
  handle: string
  disciplineFocus: Discipline
  bio: string
  location: string
  sample: SampleFlag
}

export type Photo = {
  id: string
  title: string
  discipline: Discipline
  caption: string
  location: string
  capturedAt: string
  camera: string
  optics: string
  exposure: string
  creatorId: string
  unsplashId: string
  imageAlt: string
  width: number
  height: number
  featured: boolean
  sample: SampleFlag
}

export type Collection = {
  id: string
  title: string
  description: string
  discipline: Discipline
  photoIds: string[]
  sample: SampleFlag
}

export type AppNotice = {
  title: string
  body: string
}
