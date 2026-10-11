"use client"
import React, { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import SanityImage from './SanityImage'

export interface LogoMarqueeProps {
  logos?: any[];
  className?: string;
  logoClassName?: string;
  logoSize?: string;
  gap?: string;
  direction?: 'left' | 'right';
}

const defaultGap = 'gap-[60px] md:gap-[80px] md:max-h-sm:gap-[60px] pr-[60px] md:pr-[80px] md:max-h-sm:pr-[60px]'
const defaultLogoSize = 'h-[30px] md:h-[40px] md:max-h-sm:h-[30px]'

function getGapClasses(gap?: string) {
  if (!gap) return defaultGap
  if (gap.includes('pr-')) return gap
  if (gap.startsWith('gap-') || gap.includes('gap-')) {
    const pr = gap.replace(/\bgap-/g, 'pr-')
    return `${gap} ${pr}`
  }
  const cleanVal = gap.startsWith('[') ? gap : `[${gap}]`
  return `gap-${cleanVal} pr-${cleanVal}`
}

export default function LogoMarquee({
  logos,
  className = '',
  logoClassName,
  logoSize,
  gap,
  direction = 'right',
}: LogoMarqueeProps) {
  const marqueeRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const logoList = logos ?? []

  useGSAP(() => {
    if (!marqueeRef.current || !trackRef.current || logoList.length === 0) return

    let tween: gsap.core.Tween

    const createMarquee = () => {
      if (tween) tween.kill()
      const trackWidth = trackRef.current!.offsetWidth
      const goingLeft = direction === 'left'
      gsap.set(marqueeRef.current!, { x: goingLeft ? 0 : -trackWidth })
      tween = gsap.to(marqueeRef.current!, {
        x: goingLeft ? -trackWidth : 0,
        duration: logoList.length * 2,
        repeat: -1,
        ease: 'none',
      })
    }

    createMarquee()

    let resizeTimeout: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(createMarquee, 200)
    }

    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(resizeTimeout)
    }
  }, [logoList.length, direction])

  if (!logoList.length) return null

  const resolvedLogoSize = logoClassName || logoSize || defaultLogoSize
  const trackGapClasses = getGapClasses(gap)

  const renderLogos = (duplicate = false) =>
    logoList.map((logo, i) => {
      const imageSource = logo.image || logo
      const altText = duplicate ? '' : logo.alt || imageSource?.alt || ''

      return (
        <div
          className={`flex items-center justify-center shrink-0 ${resolvedLogoSize}`}
          key={`${duplicate ? 'dup' : 'original'}-${logo._key || i}`}
        >
          <SanityImage
            image={imageSource}
            alt={altText}
            sizes="150px"
            className="w-auto h-full object-contain"
          />
        </div>
      )
    })

  const trackClasses = `flex items-center shrink-0 ${trackGapClasses}`

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div
        ref={marqueeRef}
        className="flex w-fit will-change-transform"
      >
        {/* Track 1 */}
        <div
          ref={trackRef}
          className={trackClasses}
        >
          {renderLogos()}
        </div>

        {/* Track 2 */}
        <div
          className={trackClasses}
          aria-hidden="true"
        >
          {renderLogos(true)}
        </div>

        {/* Track 3 */}
        <div
          className={trackClasses}
          aria-hidden="true"
        >
          {renderLogos(true)}
        </div>

        {/* Track 4 */}
        <div
          className={trackClasses}
          aria-hidden="true"
        >
          {renderLogos(true)}
        </div>
      </div>
    </div>
  )
}
