'use client'

import { ReactLenis, useLenis } from 'lenis/react'
import { useEffect } from 'react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAppContext } from './AppContext'
import { usePathname } from 'next/navigation'

gsap.registerPlugin(CustomEase, ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })



const MOMENTUM_TAU = 0.2 // seconds; a flick travels velocity * tau
const MAX_VELOCITY = 70000 // px/s
const SAMPLE_WINDOW = 100 // ms of finger history used for the release velocity
const STALE_MS = 40 // finger rested this long before lifting: no momentum
const DRAG_LERP = 3

type LenisInstance = NonNullable<ReturnType<typeof useLenis>>
let lenisInstance: LenisInstance | undefined

let samples: { t: number; y: number }[] = []
let fingerY = 0
let pendingDelta = 0
let axis: 'pending' | 'x' | 'y' = 'pending'

function flushPending(lenis: LenisInstance) {
  if (pendingDelta === 0) return
  const d = pendingDelta
  pendingDelta = 0
  lenis.scrollTo(lenis.targetScroll + d, { programmatic: false, lerp: DRAG_LERP })
}

function virtualScroll({ deltaX, deltaY, event }: { deltaX: number; deltaY: number; event: Event }) {
  const lenis = lenisInstance
  const type = event.type
  if (!lenis || !type.startsWith('touch')) return true // wheel etc: plain Lenis

  if (type === 'touchstart') {
    samples = []
    fingerY = 0
    pendingDelta = 0
    axis = 'pending'
    return true 
  }

  if (type === 'touchmove') {
    const blocked = !!(event.target as Element | null)?.closest?.('[data-lenis-prevent]')
    if (!blocked && event.cancelable) event.preventDefault()

    if (blocked || deltaY === 0 || lenis.isStopped || lenis.isLocked) return true

    if (axis === 'pending') axis = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y'
    if (axis === 'x') return false 

    fingerY += deltaY
    samples.push({ t: event.timeStamp, y: fingerY })
    const cutoff = event.timeStamp - SAMPLE_WINDOW
    while (samples.length > 2 && samples[0].t < cutoff) samples.shift()

    pendingDelta += deltaY
    if (event.cancelable) event.preventDefault()
    return false 
  }

  // touchend / touchcancel
  if (axis === 'x') return false
  flushPending(lenis)
  const all = samples
  const first = all[0]
  const last = all[all.length - 1]
  samples = []
  if (!first || first === last || event.timeStamp - last.t > STALE_MS) return false

  const dt = (last.t - first.t) / 1000
  if (dt < 0.008) return false
  const v = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, (last.y - first.y) / dt)) // px/s
  if (Math.abs(v) < 40) return false

  const tail = all.filter((s) => last.t - s.t <= 50)
  if (tail.length > 1 && (tail[tail.length - 1].y - tail[0].y) * v < 0) return false

  // exponential glide: starts at velocity v and travels v * tau in total
  lenis.scrollTo(lenis.targetScroll + v * MOMENTUM_TAU, {
    programmatic: false,
    lerp: 1 / (MOMENTUM_TAU * 120),
  })
  return false 
}

function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { isDraftMode } = useAppContext()
  const pathname = usePathname()

  const isFindUsPage = pathname === '/find-us'

  if (isDraftMode || isFindUsPage) {
    return <>{children}</>
  }

  return (
    <ReactLenis
      root
      options={{
        duration: 1.5,
        autoRaf: false, 
        syncTouch: true,
        virtualScroll,
      }}>
      <LenisGsapSync />
      {children}
    </ReactLenis>
  )
}

/**
 * Runs Lenis on the GSAP ticker and updates ScrollTrigger on every Lenis scroll, so scrubs and
 * scroll-driven state update in the same frame as the scroll position.
 */
function LenisGsapSync() {
  const lenis = useLenis(() => ScrollTrigger.update())

  useEffect(() => {
    gsap.ticker.lagSmoothing(0)
  }, [])

  useEffect(() => {
    lenisInstance = lenis
    if (!lenis) return
    const tick = (time: number) => {
      flushPending(lenis)
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      lenisInstance = undefined
    }
  }, [lenis])

  return null
}

export default SmoothScroll
