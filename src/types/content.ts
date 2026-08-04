export type ContentTimestamps = {
  createdAt: Date | null
  updatedAt: Date | null
  published: boolean
  order?: number
}

export type Sermon = ContentTimestamps & {
  id: string
  title: string
  speaker: string
  date: string
  videoUrl: string
  audioUrl: string
  studyGuideUrl: string
  series: string
  tags: string[]
}

export type EventItem = ContentTimestamps & {
  id: string
  title: string
  summary: string
  description: string
  startAt: string
  endAt: string
  location: string
  imageUrl: string
  registrationUrl: string
}

export type Article = ContentTimestamps & {
  id: string
  title: string
  slug: string
  excerpt: string
  body: string
  coverImageUrl: string
  author: string
  categories: string[]
  publishedAt: string
}

export type Program = ContentTimestamps & {
  id: string
  name: string
  slug: string
  summary: string
  frequency: string
  imageUrl: string
  detailsUrl: string
}

export type Leader = ContentTimestamps & {
  id: string
  name: string
  role: string
  bio: string
  photoUrl: string
  order: number
}

//