'use client'

import Image from 'next/image'
import { urlForImage } from '@/sanity/lib/image'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

ScrollTrigger.config({ ignoreMobileResize: true })

export interface SanityImageAsset {
  _ref?: string
  _type?: string
  url?: string
  metadata?: {
    lqip?: string
    dimensions?: {
      width: number
      height: number
    }
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
  asset?: SanityImageAsset | SanityImageSource | any
  image?: SanityImageSource | any
  width?: number
  height?: number
  hotspot?: { x: number; y: number; width: number; height: number }
  crop?: { top: number; bottom: number; left: number; right: number }
  alt?: string
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

export default function SanityImage({
  ref,
  asset: rawAsset,
  image,
  width: propWidth,
  height: propHeight,
  hotspot: rawHotspot,
  crop: rawCrop,
  alt: rawAlt,
  noBlur,
  quality,
  sizes,
  priority,
  className,
  style,
  loading,
  fill,
}: SanityImageProps) {
  // Support passing `{ image, alt }` wrapper objects (e.g. Sanity imageType), or direct image/asset
  const resolvedImage =
    image && typeof image === 'object' && 'image' in image && (image as any).image
      ? (image as any).image
      : image

  const resolvedAsset =
    rawAsset && typeof rawAsset === 'object' && 'image' in rawAsset && (rawAsset as any).image
      ? (rawAsset as any).image
      : rawAsset

  const isImageWrapper =
    resolvedAsset &&
    typeof resolvedAsset === 'object' &&
    'asset' in resolvedAsset &&
    Boolean((resolvedAsset as SanityImageSource).asset)

  const imageSource: SanityImageSource | undefined =
    resolvedImage || (isImageWrapper ? (resolvedAsset as SanityImageSource) : undefined)

  const asset: SanityImageAsset | undefined =
    imageSource?.asset || (resolvedAsset as SanityImageAsset)
  const hotspot = rawHotspot || imageSource?.hotspot
  const crop = rawCrop || imageSource?.crop
  const alt = rawAlt || (image as any)?.alt || (rawAsset as any)?.alt || imageSource?.alt

  let width = propWidth || asset?.metadata?.dimensions?.width || 1
  let height = propHeight || asset?.metadata?.dimensions?.height || 1

  if (crop && !propWidth && !propHeight) {
    width = Math.floor(width * (1 - ((crop?.right || 0) + (crop?.left || 0))))
    height = Math.floor(height * (1 - ((crop?.top || 0) + (crop?.bottom || 0))))
  }

  const src = urlForImage({ asset, hotspot, crop })?.url() || asset?.url
  if (!src) return null

  const sanityLoader = ({ src: loaderSrc, width: loaderWidth, quality: loaderQuality }: { src: string, width: number, quality?: number }) => {
    if (loaderSrc.includes('cdn.sanity.io')) {
      const url = new URL(loaderSrc)
      url.searchParams.set('w', loaderWidth.toString())
      if (loaderQuality) url.searchParams.set('q', loaderQuality.toString())
      return url.toString()
    }
    return loaderSrc
  }

  return (
    <Image
      loader={sanityLoader}
      ref={ref}
      alt={alt || ''}
      src={src}
      placeholder={noBlur || !asset.metadata?.lqip ? 'empty' : 'blur'}
      blurDataURL={noBlur ? undefined : asset.metadata?.lqip}
      sizes={sizes || '100vw'}
      quality={quality || 90}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      priority={priority}
      loading={loading}
      fetchPriority="high"
      className={className}
      style={{
        objectPosition: hotspot
          ? `${hotspot.x * 100}% ${hotspot.y * 100}%`
          : undefined,
        ...style,
      }}
    />
  )
}
