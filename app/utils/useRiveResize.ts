import { useEffect } from 'react'
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

export function useRiveRenderGate(
  rive: Rive | null,
  canvas: HTMLCanvasElement | null,
  itemSelector: string,
  rootMargin = '100px',
) {
  useEffect(() => {
    if (!rive || !canvas) return
    const item = canvas.closest<HTMLElement>(itemSelector)
    let intersecting = false
    let rendering: boolean | null = null

    const update = () => {
      const should = intersecting && item?.style.visibility !== 'hidden'
      if (should === rendering) return
      rendering = should
      if (should) rive.startRendering()
      else rive.stopRendering()
    }

    const io = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting
      update()
    }, { rootMargin })
    io.observe(canvas)

    const mo = item ? new MutationObserver(update) : null
    if (item && mo) mo.observe(item, { attributes: true, attributeFilter: ['style'] })

    return () => {
      io.disconnect()
      mo?.disconnect()
    }
  }, [rive, canvas, itemSelector, rootMargin])
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
  maxDpr = 2,
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
