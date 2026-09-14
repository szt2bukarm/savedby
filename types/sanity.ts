export interface PageBlock {
  _type: string
  _key: string
  [key: string]: unknown
}

export interface PageData {
  _id: string
  title: string
  slug: string
  blocks: PageBlock[]
}

export interface SanityImageData {
  _type?: string
  asset?: {
    _ref?: string
    url?: string
    metadata?: {
      lqip?: string
      dimensions?: {
        width: number
        height: number
      }
    }
  }
  hotspot?: { x: number; y: number; width: number; height: number }
  crop?: { top: number; bottom: number; left: number; right: number }
  alt?: string
}