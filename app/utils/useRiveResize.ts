import { useEffect, useRef } from 'react'
import { useAppContext } from '@/app/AppContext'
import type { Rive } from '@rive-app/react-webgl2'

/**
 * Options to pass as the 2nd argument of `useRive`.
 *
 * `useRive`'s built-in resize handling calls `rive.startRendering()` on every resize, for every
 * instance, which overrides its IntersectionObserver: after a window resize every Rive on the
 * page keeps rendering while offscreen until it's scrolled in/out of view again. With several
 * Rives (large WebGL canvases) that tanks the framerate. We size the canvas ourselves instead
 * (see `useRiveResize`) and never touch the render loop.
 */
export const RIVE_MANUAL_RESIZE = { shouldResizeCanvasToContainer: false } as const

/**
 * For Rives inside a carousel/clone container: Rive's own IntersectionObserver counts
 * `visibility: hidden` elements as visible, so hidden clones keep rendering. Pass this as the
 * `useRive` options (it disables Rive's observer) and call `useRiveRenderGate` to render only
 * while the canvas is on screen AND its `itemSelector` ancestor isn't visibility:hidden.
 */
export const RIVE_GATED = { ...RIVE_MANUAL_RESIZE, shouldUseIntersectionObserver: false } as const

/**
 * Gated Rives that are off screen have never drawn, so their first frame would otherwise be
 * produced right as they scroll in (mid-animation). This draws one frame for each of them in
 * idle time after load, one instance at a time, so they come into view already painted.
 */
const primeQueue: (() => Promise<void>)[] = []
let priming = false
const idle = (cb: () => void) =>
  'requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 2000 }) : setTimeout(cb, 200)
const nextFrames = (n: number) =>
  new Promise<void>((r) => { const f = () => (--n <= 0 ? r() : requestAnimationFrame(f)); requestAnimationFrame(f) })
function enqueuePrime(job: () => Promise<void>) {
  primeQueue.push(job)
  if (priming) return
  priming = true
  const run = () => idle(async () => {
    const next = primeQueue.shift()
    if (!next) { priming = false; return }
    await next()
    run()
  })
  run()
}

/**
 * `stopRendering()` doesn't reset Rive's internal `lastRenderTime`, so the first frame after
 * `startRendering()` advances the animation by the whole time it was paused (it appears frozen
 * but then jumps ahead). Zeroing it makes the first resumed frame have elapsedTime === 0, so
 * animations continue from the frozen state.
 */
const resume = (rive: Rive, skipSeconds = 0) => {
  // Rive computes elapsed = now - lastRenderTime on the first frame, so back-dating it makes
  // that frame advance the animation by `skipSeconds` (0 = continue from the frozen state).
  ;(rive as unknown as { lastRenderTime: number }).lastRenderTime =
    skipSeconds > 0 ? performance.now() - skipSeconds * 1000 : 0
  rive.startRendering()
}

export function useRiveRenderGate(
  rive: Rive | null,
  canvas: HTMLCanvasElement | null,
  itemSelector?: string,
  rootMargin = '100px',
  skipSeconds = 0, // the first rendered frame starts this many seconds into the animation
) {
  const { isAppLoaded } = useAppContext()
  const appLoadedRef = useRef(isAppLoaded)
  appLoadedRef.current = isAppLoaded

  useEffect(() => {
    if (!rive || !canvas) return
    const item = itemSelector ? canvas.closest<HTMLElement>(itemSelector) : null
    // ElevatedSwiper sets data-intro on its root during the scroll-in spin: hold still then
    const host = canvas.closest<HTMLElement>('[data-intro-host], .numbered-cards-swiper')
    let intersecting = false
    let rendering: boolean | null = null
    let drawn = false // has produced at least one frame (so a held canvas isn't blank)
    let holdTimer: ReturnType<typeof setTimeout> | undefined
    // the skip applies to this instance's very first frame (primed, held or live), exactly once,
    // so the loaded initial state already sits `skipSeconds` into the animation
    let skipped = false
    const takeSkip = () => {
      if (skipped) return 0
      skipped = true
      return skipSeconds
    }

    const update = () => {
      const visible = intersecting && item?.style.visibility !== 'hidden'
      const held =  !!host?.hasAttribute('data-intro')
      const should = visible && !(held && drawn)
      if (should && held && !drawn && !holdTimer) {
        // held before its first frame: let it draw briefly, then freeze on that frame
        holdTimer = setTimeout(() => { holdTimer = undefined; drawn = true; update() }, 150)
      }
      if (should && !held) drawn = true
      if (should === rendering) return
      rendering = should
      if (should) {
        resume(rive, takeSkip())
      } else rive.stopRendering()
    }

    const io = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting
      update()
    }, { rootMargin })
    io.observe(canvas)

    const mo = item ? new MutationObserver(update) : null
    if (item && mo) mo.observe(item, { attributes: true, attributeFilter: ['style'] })
    const mo2 = host ? new MutationObserver(update) : null
    if (host && mo2) mo2.observe(host, { attributes: true, attributeFilter: ['data-intro'] })

    let cancelled = false
    enqueuePrime(async () => {
      // don't compete with the hero scene / loader: prime only once the app has loaded
      while (!cancelled && !appLoadedRef.current) await new Promise((r) => setTimeout(r, 250))
      if (cancelled || drawn || rendering) return
      resume(rive, takeSkip())
      await nextFrames(3)
      if (cancelled) return
      drawn = true
      if (!rendering) rive.stopRendering()
    })

    return () => {
      cancelled = true
      clearTimeout(holdTimer)
      io.disconnect()
      mo?.disconnect()
      mo2?.disconnect()
    }
  }, [rive, canvas, itemSelector, rootMargin, skipSeconds])
}

/**
 * Sizes the Rive canvas to its container (debounced) without starting rendering.
 * While the window is being dragged the canvas is stretched by CSS (100%), and the pixel buffer
 * is only reallocated once resizing settles.
 */
export function useRiveResize(
  rive: Rive | null,
  canvas: HTMLCanvasElement | null,
  container: HTMLElement | null,
  maxDpr = 1.5, // 2x costs ~1.8x the pixels per frame for barely visible sharpness
) {
  useEffect(() => {
    if (!rive || !canvas || !container) return
    canvas.style.width = '100%'
    canvas.style.height = '100%'

    const apply = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
      const w = Math.round(container.clientWidth * dpr)
      const h = Math.round(container.clientHeight * dpr)
      if (!w || !h || (canvas.width === w && canvas.height === h)) return
      canvas.width = w
      canvas.height = h
      rive.resizeToCanvas()
    }

    apply()
    let timeout: ReturnType<typeof setTimeout> | undefined
    const ro = new ResizeObserver(() => {
      clearTimeout(timeout)
      timeout = setTimeout(apply, 150)
    })
    ro.observe(container)
    return () => {
      clearTimeout(timeout)
      ro.disconnect()
    }
  }, [rive, canvas, container, maxDpr])
}
