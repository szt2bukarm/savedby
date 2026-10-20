'use client'

import Image, { type ImageLoaderProps } from 'next/image'
import { urlForImage } from '@/sanity/lib/image'

export interface SanityImageAsset {
  _ref?: string
  _type?: string
  url?: string
  metadata?: {
    lqip?: string
    dimensions?: { width: number; height: number }
  }
}

export interface SanityImageSource {
  _type?: string
  asset?: SanityImageAsset
  hotspot?: { x: number; y: number; width: number; height: number }
  crop?: { top: number; bottom: number; left: number; right: number }
  alt?: string
}

type SanityImageProps = {
  /** Sanity image object, or an `{ image, alt }` wrapper */
  image?: any
  /** Alternative to `image` (legacy) */
  asset?: any
  alt?: string
  /** Responsive `sizes` attribute. Always set this for anything not full-bleed. */
  sizes?: string
  priority?: boolean
  quality?: number
  className?: string
  style?: React.CSSProperties
  fill?: boolean
  noBlur?: boolean
  loading?: 'lazy' | 'eager'
  ref?: React.Ref<HTMLImageElement>
}

const DEFAULT_QUALITY = 75

export default function SanityImage({
  image,
  asset: rawAsset,
  alt,
  sizes = '100vw',
  quality = DEFAULT_QUALITY,
  noBlur,
  fill,
  ...rest
}: SanityImageProps) {
  // Unwrap `{ image, alt }` wrappers
  const input = image ?? rawAsset
  const source: SanityImageSource | undefined = input?.image ?? input
  const asset = source?.asset ?? (input as SanityImageAsset | undefined)
  const { hotspot, crop } = source ?? {}

  const src = urlForImage({ asset, hotspot, crop })?.url() || asset?.url
  if (!src) return null

  // Intrinsic dimensions (after crop) – used for aspect ratio and as an upper bound
  const dims = asset?.metadata?.dimensions
  const width = Math.floor((dims?.width ?? 1) * (1 - ((crop?.left ?? 0) + (crop?.right ?? 0))))
  const height = Math.floor((dims?.height ?? 1) * (1 - ((crop?.top ?? 0) + (crop?.bottom ?? 0))))
  const maxWidth = dims ? width : undefined

  // Let Sanity's CDN do resizing; never upscale beyond the original
  const loader = ({ src, width: w, quality: q }: ImageLoaderProps) => {
    if (!src.includes('cdn.sanity.io')) return src
    const url = new URL(src)
    url.searchParams.set('w', String(maxWidth ? Math.min(w, maxWidth) : w))
    url.searchParams.set('q', String(q ?? DEFAULT_QUALITY))
    url.searchParams.set('fit', 'max')
    url.searchParams.set('auto', 'format')
    return url.toString()
  }

  const lqip = noBlur ? undefined : asset?.metadata?.lqip

  return (
    <Image
      {...rest}
      loader={loader}
      src={src}
      alt={alt ?? input?.alt ?? source?.alt ?? ''}
      sizes={sizes}
      quality={quality}
      {...(fill ? { fill: true } : { width, height })}
      placeholder={lqip ? 'blur' : 'empty'}
      blurDataURL={lqip}
      style={{
        objectPosition: hotspot ? `${hotspot.x * 100}% ${hotspot.y * 100}%` : undefined,
        ...rest.style,
      }}
    />
  )
}
