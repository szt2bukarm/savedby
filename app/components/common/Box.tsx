"use client"
import { useRef, useEffect } from 'react'

const EYEBALL_OFFSET_X = -2.5
const EYEBALL_OFFSET_Y = -1.5 
const EYE_MAX_MOVE_X = 2
const EYE_MAX_MOVE_Y = 3
const EYE_FULL_TRAVEL_DISTANCE = 250

interface BoxProps {
  className: string
  maxMoveX?: number
  maxMoveY?: number
  fullTravelDistance?: number
}

export default function Box({
  className,
  maxMoveX = EYE_MAX_MOVE_X,
  maxMoveY = EYE_MAX_MOVE_Y,
  fullTravelDistance = EYE_FULL_TRAVEL_DISTANCE,
}: BoxProps) {
  const leftPupil = useRef<SVGPathElement>(null)
  const rightPupil = useRef<SVGPathElement>(null)

  useEffect(() => {
    for (const pupil of [leftPupil.current, rightPupil.current]) {
      if (!pupil) continue
      pupil.dataset.offset = `${EYEBALL_OFFSET_X},${EYEBALL_OFFSET_Y}`
      pupil.setAttribute('transform', `translate(${EYEBALL_OFFSET_X} ${EYEBALL_OFFSET_Y})`)
    }

    const handleMouseMove = (e: MouseEvent) => {
      const pupils = [leftPupil.current, rightPupil.current].filter(
        (p): p is SVGPathElement => !!p && !!p.ownerSVGElement
      )
      if (!pupils.length) return

      const scale = pupils[0].ownerSVGElement!.getBoundingClientRect().width / 108
      let cx = 0
      let cy = 0
      for (const pupil of pupils) {
        const prev = pupil.dataset.offset?.split(',').map(Number) ?? [EYEBALL_OFFSET_X, EYEBALL_OFFSET_Y]
        const rect = pupil.getBoundingClientRect()
        cx += rect.left + rect.width / 2 - prev[0] * scale
        cy += rect.top + rect.height / 2 - prev[1] * scale
      }
      cx /= pupils.length
      cy /= pupils.length

      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.hypot(dx, dy)
      const strength = Math.min(1, dist / fullTravelDistance)
      const nx = EYEBALL_OFFSET_X + (dist ? (dx / dist) * strength * maxMoveX : 0)
      const ny = EYEBALL_OFFSET_Y + (dist ? (dy / dist) * strength * maxMoveY : 0)

      for (const pupil of pupils) {
        pupil.dataset.offset = `${nx},${ny}`
        pupil.setAttribute('transform', `translate(${nx} ${ny})`)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [maxMoveX, maxMoveY, fullTravelDistance])

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 108 108" fill="none">
      <path d="M30.8431 51.8037L22.293 65.455L29.465 68.6832" stroke="#008DDF" strokeWidth="2.99978" strokeLinejoin="bevel"/>
      <path d="M42.0404 74.3375C46.0604 76.1419 49.319 73.6903 49.319 68.8632C49.319 64.0362 46.0604 58.6533 42.0404 56.8413C38.0204 55.0292 34.7617 57.4884 34.7617 62.3155C34.7617 67.1426 38.0204 72.5254 42.0404 74.3375Z" stroke="#008DDF" strokeWidth="2.99978" strokeLinejoin="round"/>
      
      <path ref={rightPupil} d="M43.9174 72.9285C46.902 74.2685 49.3231 72.4488 49.3231 68.8628C49.3231 65.2767 46.902 61.2796 43.9174 59.9396C40.9329 58.5996 38.5117 60.4192 38.5117 64.0053C38.5117 67.5913 40.9329 71.5885 43.9174 72.9285Z" fill="#008DDF"/>
      <path ref={leftPupil} d="M15.0307 59.9324C18.0153 61.2724 20.4364 59.4527 20.4364 55.8667C20.4364 52.2806 18.0153 48.2835 15.0307 46.9435C12.0461 45.6035 9.625 47.4231 9.625 51.0092C9.625 54.5952 12.0461 58.5924 15.0307 59.9324Z" fill="#008DDF"/>
      
      <path d="M13.1576 61.3422C17.1776 63.1466 20.4362 60.695 20.4362 55.868C20.4362 51.0333 17.1776 45.6581 13.1576 43.846C9.13755 42.0416 5.87891 44.4932 5.87891 49.3202C5.87891 54.1473 9.13755 59.5302 13.1576 61.3422Z" stroke="#008DDF" strokeWidth="2.99978" strokeLinejoin="round"/>
      <path d="M43.9134 82.2329C39.6954 84.0754 33.7492 83.55 27.5973 80.7863C21.4455 78.0225 15.4992 73.1954 11.2812 67.5537" stroke="#008DDF" strokeWidth="2.99978" strokeLinejoin="round"/>
      <path d="M53.828 48.6406L3.39514 25.9748L1.32422 25.0459" stroke="#008DDF" strokeWidth="2.64955"/>
      <path d="M53.8281 105.445V48.6396" stroke="#008DDF" strokeWidth="2.64955"/>
      <path d="M105.449 25.4443L53.8281 48.6432" stroke="#008DDF" strokeWidth="2.64955"/>
      <path d="M106.324 25.0469L53.828 1.45215L1.32422 25.0469V82.8117L53.828 106.406L106.324 82.8117V25.0469Z" stroke="#008DDF" strokeWidth="2.64955"/>
      <path d="M27.582 36.3906L80.0858 12.7959" stroke="#008DDF" strokeWidth="2.64955"/>
    </svg>
  )
}
