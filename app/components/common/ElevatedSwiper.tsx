"use client"
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React, { createContext, useContext, useRef, useState, useEffect, useLayoutEffect, useMemo, memo } from 'react'

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/* ------------------------------------------------------------------ */
/* Config (override any of these with the `config` prop)               */
/* ------------------------------------------------------------------ */
export const eases = {
  linear: (t: number) => t,
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  outQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  outExpo: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inOutQuart: (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
}

export interface CarouselConfig {
  /** Seconds a flick keeps coasting. Bigger = longer throws. */
  flickGlide: number
  /** How fast a released drag settles onto a card (1/s). Higher = snappier. 4 = floaty, 7 = default, 12 = tight. */
  snapSpeed: number
  /** Max cards a single flick can travel. */
  maxCards: number
  /** Release velocity cap (px/s). */
  maxVelocity: number
  /** Pixels you must move before a press becomes a drag. */
  tapSlop: number
  /** Pixels before a press becomes a drag when you catch a moving carousel. */
  catchSlop: number
  /** 'moving' = carousel owns touches while moving/dragging, page scrolls at rest.
   *  'always' = carousel always owns touches (page can't be scrolled by touching it). */
  touchLock: 'moving' | 'always'
  /** A flick faster than this (px/s) always advances at least one card. */
  flickMin: number

  /** Scale of every card while dragging (1 = no change, 0.9 = 10% smaller). */
  dragScale: number
  /** How fast the drag scale eases in/out (1/s). Lower = softer, higher = snappier. */
  dragScaleSpeed: number

  /** Autoplay slide duration (ms). */
  autoplayDuration: number
  autoplayEase: (t: number) => number
  /** Cards per autoplay step. Negative = slide backwards. */
  autoplayStep: number

  /** Click-a-card-to-center duration (ms). */
  clickDuration: number
  clickEase: (t: number) => number

  /** Intro spin settle speed (1/s). Lower = longer, floatier spin. */
  introSpeed: number

  /** Distance (px) from the target card at which "settled" fires. Bigger = activates earlier. */
  settleDistance: number

  /** Intro spin starts this many px before the carousel enters the viewport (max ~200). */
  introLead: number
  /** Intro fade-in (see `introFade`): fade duration per card (ms). */
  introFadeDuration: number
  /** Intro fade-in: minimum gap (ms) between one card starting to fade and the next. */
  introFadeStagger: number
}

export const DEFAULT_CONFIG: CarouselConfig = {
  flickGlide: 0.32,
  snapSpeed: 7,
  maxCards: 7,
  maxVelocity: 9000,
  tapSlop: 20,
  catchSlop: 1.5,
  touchLock: 'moving',
  flickMin: 220,
  dragScale: 0.98,
  dragScaleSpeed: 14,
  autoplayDuration: 700,
  autoplayEase: eases.inOutCubic,
  autoplayStep: 1,
  clickDuration: 550,
  clickEase: eases.outCubic,
  introSpeed: 3,
  settleDistance: 40,
  introLead: 150,
  introFadeDuration: 600,
  introFadeStagger: 100,
}

const mod = (a: number, n: number) => ((a % n) + n) % n
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/** Elevation curve; `progress` is the distance from center in cards. */
function getTranslateY(progress: number) {
  const d = Math.abs(progress)
  if (d >= 2) return 0
  if (d >= 1) return -16 + 16 * (d - 1) // -16 → 0
  return -32 + 16 * d                     // -32 → -16
}

/* ------------------------------------------------------------------ */
/* Active card exposure                                                */
/* ------------------------------------------------------------------ */
export interface ActiveCardInfo {
  /** Index in the list of children you passed in (0..n-1) */
  index: number
  /** The props of that child element */
  props: any
  /** The wrapper DOM element of the card instance that is at the center */
  element: HTMLElement | null
  /** First element inside the card for each data-part="name" */
  parts: Record<string, HTMLElement>
  /** Every element for each data-part="name" (for repeated parts like list items) */
  all: Record<string, HTMLElement[]>
}

const CardContext = createContext<{ index: number; isActive: boolean }>({ index: -1, isActive: false })

/** One ring card. Memoized so activating a card re-renders only the 2 cards whose state changed. */
const CardSlot = memo(function CardSlot({ child, index, isActive }: { child: React.ReactNode; index: number; isActive: boolean }) {
  const value = useMemo(() => ({ index, isActive }), [index, isActive])
  return <CardContext.Provider value={value}>{child}</CardContext.Provider>
})

/** Call inside a card component rendered within <ElevatedSwiper>. */
export const useCard = () => useContext(CardContext)

/** Gives you the active card as state. Spread `bind` onto <ElevatedSwiper>. */
export function useActiveCard() {
  const [card, setCard] = useState<ActiveCardInfo | null>(null)
  return { card, bind: { onActivate: setCard } }
}

type Anim =
  | { kind: 'spring'; t0: number; target: number; A: number; B: number; omega: number; notified: boolean }
  | { kind: 'ease'; t0: number; from: number; target: number; dur: number; ease: (t: number) => number; notified: boolean }

interface ElevatedSwiperProps {
  /** Plain elements (NOT <SwiperSlide>). Give each one its own width, e.g. className="w-[320px]". */
  children: React.ReactNode
  initialSlide?: number
  className?: string
  style?: React.CSSProperties
  /** Gap between cards in px */
  gap?: number
  /** How far the cards move per px of finger/mouse movement */
  dragRatio?: number
  /** Slide over one card automatically */
  autoplay?: boolean
  /** ms between autoplay slides (timer restarts after any interaction) */
  autoplayDelay?: number
  /** Spin this many cards (then settle on initialSlide) when first scrolled into view. 0 = off */
  introSpin?: number
  /**
   * With `introSpin`: cards start invisible and each one fades in (staggered) the moment it
   * reaches the viewport during the intro spin. Needs introSpin > 0.
   */
  introFade?: boolean
  /**
   * true  = the card closest to center is "active" live, even while moving
   * false = a card becomes active only once the carousel settles on it
   */
  activateWhileScrolling?: boolean
  /** Fires when a card becomes active (timing depends on activateWhileScrolling) */
  onActivate?: (info: ActiveCardInfo) => void
  /** Fires live whenever a different card becomes the closest to center */
  onActiveChange?: (info: ActiveCardInfo) => void
  /** Fires every time the carousel comes to rest on a card */
  onSettle?: (info: ActiveCardInfo) => void
  /** Fires when the user presses down on the carousel (drag / touch begins) */
  onInteractStart?: () => void
  /** Fires when the user releases / the gesture ends */
  onInteractEnd?: () => void
  /** Override any speed/behaviour value, see CarouselConfig */
  config?: Partial<CarouselConfig>
}

export default function ElevatedSwiper({
  children,
  initialSlide = 0,
  className = '',
  style,
  gap = 10,
  dragRatio = 1.35,
  autoplay = false,
  autoplayDelay = 10000,
  introSpin = 0,
  introFade = false,
  activateWhileScrolling = false,
  onActivate,
  onActiveChange,
  onSettle,
  onInteractStart,
  onInteractEnd,
  config,
}: ElevatedSwiperProps) {
  // stable identity so memoized cards can skip re-rendering
  const items = useMemo(() => React.Children.toArray(children), [children])
  const n = items.length
  const conf: CarouselConfig = { ...DEFAULT_CONFIG, ...config }

  const [copies, setCopies] = useState(3)
  const [ready, setReady] = useState(false)
  const [activatedRing, setActivatedRing] = useState(-1) // ring index of the currently "active" card

  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const itemEls = useRef<(HTMLDivElement | null)[]>([])

  // latest props, readable from long-lived closures
  const cfg = useRef({
    n, gap, copies, initialSlide, dragRatio, autoplay, autoplayDelay, introSpin,
    introFade, activateWhileScrolling, items, onActivate, onActiveChange, onSettle, onInteractStart, onInteractEnd, conf,
  })
  cfg.current = {
    n, gap, copies, initialSlide, dragRatio, autoplay, autoplayDelay, introSpin,
    introFade, activateWhileScrolling, items, onActivate, onActiveChange, onSettle, onInteractStart, onInteractEnd, conf,
  }


  const S = useRef({
    pos: 0,
    vel: 0, // px/s of the glide currently running
    scale: 1,       // current card scale (eased)
    scaleTarget: 1, // 1 normally, conf.dragScale while dragging
    lastT: 0,       // previous frame timestamp, for frame-rate independent easing
    inited: false,
    sig: '',
    raf: 0,
    suppressClick: false,
    timer: 0 as any,
    visible: true,
    onScreen: true, // roughly in the viewport: when false, skip all DOM writes
    hidden: [] as boolean[],
    promoted: false, // will-change currently applied to the cards
    introPending: false,
    // intro fade-in: per ring card, the time (ms) its fade starts (-1 = not on screen yet)
    fade: { active: false, startAt: [] as number[], nextSlot: 0, done: [] as boolean[] },
    locked: null as null | boolean, // current touch-action lock state
    closest: -1,   // ring index closest to center right now
    activated: -1, // ring index last activated
    layout: { n: 0, L: 0, Ptot: 0, cx: 0, widths: [] as number[], centers: [] as number[] },
    anim: null as null | Anim,
    drag: null as null | {
      id: number
      startX: number
      startY: number
      vertical: boolean // touch that turned out to be a page scroll: not ours
      startPos: number
      basePos: number
      moved: boolean
      samples: { x: number; t: number }[]
      carryV: number
      wasGliding: boolean
      item: number
      tDown: number
    },
  }).current

  /* ---------------- ring helpers ---------------- */
  // lattice of all card centers, infinite in both directions, ascending in k
  const g = (k: number) => {
    const { centers, Ptot } = S.layout
    const M = centers.length
    return centers[mod(k, M)] + Math.floor(k / M) * Ptot
  }
  const nearestK = (x: number) => {
    const { centers, Ptot } = S.layout
    const M = centers.length
    const k0 = Math.floor(x / Ptot) * M
    let best = k0
    let bd = Infinity
    for (let k = k0 - M; k <= k0 + 2 * M; k++) {
      const gk = g(k)
      const dd = Math.abs(gk - x)
      if (dd < bd) { bd = dd; best = k }
      else if (gk > x) break
    }
    return best
  }

  /* ---------------- active card ---------------- */
  const getInfo = (ring: number): ActiveCardInfo => {
    const { n, items } = cfg.current
    const index = ring % n
    const element = itemEls.current[ring] ?? null
    const parts: Record<string, HTMLElement> = {}
    const all: Record<string, HTMLElement[]> = {}
    element?.querySelectorAll<HTMLElement>('[data-part]').forEach((el) => {
      const name = el.dataset.part!
      parts[name] ??= el
      ;(all[name] ??= []).push(el)
    })
    return { index, props: (items[index] as any)?.props, element, parts, all }
  }

  /** Marks a ring card as the active one: data-active, context, onActivate. */
  const activate = (ring: number) => {
    if (ring < 0 || ring === S.activated) return
    S.activated = ring
    itemEls.current.forEach((el) => el?.removeAttribute('data-active'))
    itemEls.current[ring]?.setAttribute('data-active', 'true')
    setActivatedRing(ring)
    cfg.current.onActivate?.(getInfo(ring))
  }

  const emitSettle = () => {
    if (S.closest < 0) return
    cfg.current.onSettle?.(getInfo(S.closest))
    if (!cfg.current.activateWhileScrolling) activate(S.closest)
    // Count autoplayDelay from the moment the card settles (not from when the move began),
    // so per-card UI (e.g. progress bars) gets the full delay. Matters for the long intro spin.
    if (!S.drag) scheduleAuto()
  }

  /* ---------------- touch lock ---------------- */
  /**
   * While the carousel is moving or being dragged it owns every touch (touch-action: none),
   * so the browser can't steal the gesture for page scrolling. At rest it goes back to
   * pan-y so the page still scrolls normally.
   */
  const syncTouchLock = () => {
    const root = rootRef.current
    if (!root) return
    const lock = cfg.current.conf.touchLock === 'always' || !!S.anim || !!S.drag
    if (lock !== S.locked) {
      S.locked = lock
      root.style.touchAction = lock ? 'none' : 'pan-y'
    }
  }

  /**
   * Promote cards (will-change: transform) ONLY while moving. During the drag-scale ease the
   * scale changes every frame, and without a promoted layer Chrome re-rasterizes every big card
   * at each new scale (that's the slowdown after a flick). Keeping it on only while moving
   * avoids permanently holding dozens of large GPU layers.
   */
  const syncPromotion = (moving: boolean) => {
    if (moving === S.promoted) return
    S.promoted = moving
    const v = moving ? 'transform' : ''
    for (const el of itemEls.current) if (el) el.style.willChange = v
  }

  /* ---------------- rendering ---------------- */
  const render = () => {
    const { widths, centers, Ptot, cx } = S.layout
    if (!centers.length) return
    const { n, gap } = cfg.current
    const half = Ptot / 2
    let best = Infinity
    let bestK = -1
    const F = S.fade
    const fadeOn = cfg.current.introFade && (S.introPending || F.active)
    const newlyVisible: { k: number; d: number }[] = []
    for (let k = 0; k < centers.length; k++) {
      const el = itemEls.current[k]
      if (!el) continue
      const w = widths[k % n]
      const d = mod(centers[k] - S.pos + half, Ptot) - half // signed distance from center, wrapped
      const ad = Math.abs(d)
      if (ad < best) { best = ad; bestK = k }
      // intro fade: every card that hasn't been revealed yet stays invisible
      // a revealed card that wraps around the ring and re-enters from the other side must
      // fade in again, so un-reveal it once it has left the viewport
      if (F.active && F.startAt[k] !== undefined && ad - w / 2 > cx + 40) {
        delete F.startAt[k]
        el.style.opacity = '0'
      }
      if (fadeOn && F.startAt[k] === undefined && el.style.opacity !== '0') el.style.opacity = '0'
      // cards well outside the viewport: don't touch their transform, just hide them once
      const off = ad - w / 2 > cx + 300
      if (off) {
        if (!S.hidden[k]) { el.style.visibility = 'hidden'; S.hidden[k] = true }
        continue
      }
      if (S.hidden[k]) { el.style.visibility = ''; S.hidden[k] = false }
      el.style.transform = `translate3d(${cx + d - w / 2}px, ${getTranslateY(ad / (w + gap))}px, 0) scale(${S.scale})`
      // first time this card is on screen during the intro: schedule its fade
      if (F.active && F.startAt[k] === undefined && ad - w / 2 < cx) newlyVisible.push({ k, d })
    }

    if (F.active) {
      const now = performance.now()
      const { introFadeDuration: dur, introFadeStagger: gapMs } = cfg.current.conf
      // cards that appear in the same frame fade in left to right, each `gapMs` after the last
      newlyVisible.sort((a, b) => a.d - b.d).forEach(({ k }) => {
        const t = Math.max(now, F.nextSlot)
        F.startAt[k] = t
        F.nextSlot = t + gapMs
      })
      const spinOver = !S.anim // spin finished (or interrupted): reveal anything left at once
      let allDone = true
      for (let k = 0; k < centers.length; k++) {
        const el = itemEls.current[k]
        if (!el) continue
        if (spinOver && F.startAt[k] === undefined) F.startAt[k] = now - dur
        const t0 = F.startAt[k]
        if (t0 === undefined) { allDone = false; continue }
        const u = clamp((now - t0) / dur, 0, 1)
        if (u < 1) allDone = false
        el.style.opacity = u >= 1 ? '' : String(1 - (1 - u) * (1 - u)) // ease-out quad
      }
      if (allDone) F.active = false
    }
    if (bestK !== S.closest) {
      S.closest = bestK
      cfg.current.onActiveChange?.(getInfo(bestK))
      if (cfg.current.activateWhileScrolling) activate(bestK)
    }
  }

  const step = (now: number) => {
    S.raf = 0
    const dt = S.lastT ? Math.min(0.05, (now - S.lastT) / 1000) : 1 / 60
    S.lastT = now

    // ease the drag scale toward its target (frame-rate independent)
    let scaling = false
    if (S.scale !== S.scaleTarget) {
      const diff = S.scaleTarget - S.scale
      if (Math.abs(diff) < 0.0005) {
        S.scale = S.scaleTarget
      } else {
        S.scale += diff * (1 - Math.exp(-cfg.current.conf.dragScaleSpeed * dt))
        scaling = true
      }
    }

    const a = S.anim
    let done = false
    let remaining = Infinity
    if (a) {
      const t = Math.max(0, (now - a.t0) / 1000)
      if (a.kind === 'spring') {
        const e = Math.exp(-a.omega * t)
        S.pos = a.target + (a.A + a.B * t) * e
        S.vel = (a.B - a.omega * (a.A + a.B * t)) * e
        done = t > 2.5 || (Math.abs(S.pos - a.target) < 0.5 && Math.abs(S.vel) < 15)
      } else {
        const u = Math.min(1, t / a.dur)
        S.pos = a.from + (a.target - a.from) * a.ease(u)
        const u2 = Math.min(1, u + 0.001)
        S.vel = u2 > u ? ((a.target - a.from) * (a.ease(u2) - a.ease(u))) / ((u2 - u) * a.dur) : 0
        done = u >= 1
      }
      remaining = Math.abs(S.pos - a.target)
      if (done) {
        // land exactly, and re-center the number so it never grows unbounded
        S.pos = a.target - Math.round(a.target / S.layout.Ptot) * S.layout.Ptot + S.layout.Ptot * Math.floor(cfg.current.copies / 2)
        S.vel = 0
        S.anim = null
      }
    }
    if (S.onScreen || done) render() // offscreen: advance the math only, no DOM writes
    if (a && !a.notified) {
      const pitch = S.layout.L / cfg.current.n
      const near = Math.min(cfg.current.conf.settleDistance, pitch * 0.3)
      if (done || remaining < near) {
        a.notified = true
        emitSettle() // fires BEFORE the tail of the glide finishes
      }
    }
    syncTouchLock()
    if (S.anim || S.drag || scaling || (S.fade.active && S.onScreen)) S.raf = requestAnimationFrame(step)
    else { S.lastT = 0; syncPromotion(false) }
  }
  const kick = () => { if (!S.raf) S.raf = requestAnimationFrame(step) }

  /**
   * Glide from the CURRENT position and velocity to `target` with no overshoot:
   *   x(t) = target + (A + B t) e^(-ωt),  x'(0) = v0
   * ω is raised just enough that the starting velocity can never carry past the target.
   * Because it starts from live pos/vel, grabbing and re-throwing mid-glide is seamless.
   */
  const startAnim = (target: number, v0: number, minOmega?: number) => {
    const A = S.pos - target
    if (Math.abs(A) < 0.3 && Math.abs(v0) < 5) {
      S.pos = target; S.vel = 0; S.anim = null; render(); emitSettle(); return
    }
    const floor = minOmega ?? cfg.current.conf.snapSpeed
    const toward = A < 0 ? v0 : -v0
    const omega = Math.max(floor, Math.max(0, toward) / Math.max(Math.abs(A), 1))
    S.anim = { kind: 'spring', t0: performance.now(), target, A, omega, B: v0 + omega * A, notified: false }
    S.vel = v0
    syncTouchLock()
    syncPromotion(true)
    kick()
  }

  /** Fixed-duration eased move (used by autoplay and click-to-center). */
  const startEase = (target: number, ms: number, ease: (t: number) => number) => {
    if (Math.abs(S.pos - target) < 0.3) {
      S.pos = target; S.vel = 0; S.anim = null; render(); emitSettle(); return
    }
    S.anim = { kind: 'ease', t0: performance.now(), from: S.pos, target, dur: Math.max(0.05, ms / 1000), ease, notified: false }
    S.vel = 0
    syncTouchLock()
    syncPromotion(true)
    kick()
  }

  const flick = (v: number, fromPos: number) => {
    const { flickGlide, maxCards, flickMin } = cfg.current.conf
    const pitch = S.layout.L / cfg.current.n
    const D = clamp(v * flickGlide, -maxCards * pitch, maxCards * pitch)
    let k = nearestK(S.pos + D)
    if (Math.abs(v) > flickMin) {
      const k0 = nearestK(fromPos)
      if (v > 0 && k <= k0) k = k0 + 1
      if (v < 0 && k >= k0) k = k0 - 1
    }
    startAnim(g(k), v)
  }

  const snap = () => startAnim(g(nearestK(S.pos)), 0)

  const centerOn = (ringIdx: number) => {
    const { centers, Ptot } = S.layout
    const c = centers[ringIdx]
    if (c === undefined) return snap()
    const { clickDuration, clickEase } = cfg.current.conf
    startEase(c + Math.round((S.pos - c) / Ptot) * Ptot, clickDuration, clickEase)
  }

  /* ---------------- autoplay ---------------- */
  const scheduleAuto = () => {
    if (S.timer) clearTimeout(S.timer)
    S.timer = 0
    const { autoplay, autoplayDelay } = cfg.current
    if (!autoplay || !S.layout.centers.length) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    S.timer = setTimeout(() => {
      S.timer = 0
      // never fight the user, a background tab, or an offscreen carousel
      if (document.hidden || !S.visible || S.drag || S.anim) return scheduleAuto()
      const { autoplayDuration, autoplayEase, autoplayStep } = cfg.current.conf
      startEase(g(nearestK(S.pos) + autoplayStep), autoplayDuration, autoplayEase)
      scheduleAuto()
    }, autoplayDelay)
  }

  /* ---------------- measuring / layout ---------------- */
  const measure = () => {
    const root = rootRef.current
    const track = trackRef.current
    const { n, gap, copies, initialSlide, introSpin } = cfg.current
    if (!root || !track || n === 0) return

    const els = itemEls.current
    const widths: number[] = []
    let maxH = 0
    for (let i = 0; i < n; i++) {
      const el = els[i]
      if (!el) return
      widths.push(el.offsetWidth)
      maxH = Math.max(maxH, el.offsetHeight)
    }
    if (widths.some((w) => !w)) return // not laid out yet

    const starts: number[] = []
    let acc = 0
    widths.forEach((w) => { starts.push(acc); acc += w + gap })
    const L = acc
    const maxW = Math.max(...widths)

    // Enough copies that the wrap window is wider than anything that can be on screen,
    // however few cards there are. Cards only ever teleport while fully off-screen.
    const cover = 2 * Math.max(window.innerWidth, root.clientWidth) + 2 * (maxW + gap)
    const need = Math.max(3, Math.ceil(cover / L))
    if (need !== copies) { setCopies(need); return }

    const sig = `${widths.join(',')}|${gap}|${copies}|${root.clientWidth}|${maxH}`
    if (sig === S.sig) return
    S.sig = sig
    // Resetting the flags alone left already-hidden cards with visibility:hidden in the DOM
    // (render() only un-hides cards flagged as hidden), which showed up as random gaps after a resize.
    for (const el of itemEls.current) if (el) el.style.visibility = ''
    S.hidden = []

    const centers: number[] = []
    for (let c = 0; c < copies; c++) {
      for (let i = 0; i < n; i++) centers.push(c * L + starts[i] + widths[i] / 2)
    }

    // remember which card (and offset from it) was centered, so a resize keeps your place
    let anchorI = 0
    let off = 0
    let justInited = false
    if (S.inited && S.layout.centers.length) {
      const k = nearestK(S.pos)
      anchorI = mod(k, S.layout.centers.length) % S.layout.n
      off = S.pos - g(k)
      if (anchorI >= n) anchorI = 0
    }

    S.layout = { n, L, Ptot: L * copies, cx: root.clientWidth / 2, widths, centers }
    S.closest = -1   // ring indices changed: recompute the active card
    S.activated = -1
    const h = `${maxH}px`
    if (track.style.height !== h) {
      track.style.height = h
      // page height changed: let ScrollTrigger re-measure every trigger (this one's and the ones below)
      requestAnimationFrame(() => ScrollTrigger.refresh())
    }

    const mid = Math.floor(copies / 2)
    if (!S.inited) {
      justInited = true
      S.pos = centers[mid * n + clamp(initialSlide, 0, n - 1)]
      S.inited = true
      // start rewound by `introSpin` cards; the scroll-in spin carries it back to initialSlide
      if (introSpin > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        S.pos = g(nearestK(S.pos) - introSpin)
        S.introPending = true
      }
      setReady(true)
    } else {
      S.pos = centers[mid * n + anchorI] + off
      S.anim = null
      S.vel = 0
    }
    render()
    // report the starting card (with an intro spin, it settles at the end of the spin instead)
    if (justInited && !S.introPending) emitSettle()
  }

  useIsoLayoutEffect(() => {
    syncTouchLock()
    measure()
    const root = rootRef.current
    if (!root) return
    const ro = new ResizeObserver(() => measure())
    ro.observe(root)
    for (let i = 0; i < n; i++) { const el = itemEls.current[i]; if (el) ro.observe(el) }
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copies, n, gap])

  useEffect(() => () => {
    if (S.raf) cancelAnimationFrame(S.raf)
    if (S.timer) clearTimeout(S.timer)
  }, [S])

  // scroll-in spin: runs once, the first time the carousel is visible
  useEffect(() => {
    const root = rootRef.current
    if (!ready || !S.introPending || !root) return
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || !S.introPending) return
      S.introPending = false
      if (cfg.current.introFade) S.fade = Object.assign(S.fade, { active: true, startAt: [], nextSlot: 0 })
      io.disconnect()
      if (S.drag) return
      const target = g(nearestK(S.pos) + cfg.current.introSpin)
      const w = cfg.current.conf.introSpeed
      // v0 = distance * ω gives a pure decelerating spin that lands exactly on the card
      startAnim(target, (target - S.pos) * w, w)
      scheduleAuto()
    // start `introLead` px before the carousel scrolls into view, so it's already in motion
    // when it appears (keep this under the 200px rootMargin of the viewport tracker below)
    }, { threshold: 0, rootMargin: `0px 0px ${cfg.current.conf.introLead}px 0px` })
    io.observe(root)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  // viewport tracking: skip DOM writes while offscreen, re-sync when it comes back
  useEffect(() => {
    const root = rootRef.current
    if (!ready || !root) return
    const io = new IntersectionObserver(([entry]) => {
      const was = S.onScreen
      S.onScreen = entry.isIntersecting
      if (S.onScreen && !was) { render(); if (S.fade.active) kick() }
    }, { rootMargin: '200px 0px', threshold: 0 })
    io.observe(root)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  // autoplay visibility tracking + initial timer
  useEffect(() => {
    const root = rootRef.current
    if (!ready || !autoplay || !root) return
    const io = new IntersectionObserver(([entry]) => { S.visible = entry.isIntersecting }, { threshold: 0.2 })
    io.observe(root)
    scheduleAuto()
    return () => {
      io.disconnect()
      if (S.timer) clearTimeout(S.timer)
      S.timer = 0
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, autoplay, autoplayDelay])

  /* ---------------- pointer handling ---------------- */
  const releaseVelocity = (samples: { x: number; t: number }[], now: number) => {
    if (samples.length < 2) return 0
    const last = samples[samples.length - 1]
    if (now - last.t > 100) return 0 // paused before letting go: no throw
    let first = samples[0]
    for (const s of samples) { if (last.t - s.t <= 100) { first = s; break } }
    const dt = (last.t - first.t) / 1000
    if (dt < 0.008) return 0
    const mv = cfg.current.conf.maxVelocity
    return clamp((-(last.x - first.x) / dt) * cfg.current.dragRatio, -mv, mv)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (!S.layout.centers.length) return
    const gliding = !!S.anim
    const carryV = gliding ? S.vel : 0
    const item = (e.target as HTMLElement).closest('[data-k]')?.getAttribute('data-k')

    if (S.timer) { clearTimeout(S.timer); S.timer = 0 } // pause autoplay while touching

    // Freeze exactly where the cards are right now: no jump, no snap.
    S.anim = null
    S.drag = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      vertical: false,
      startPos: S.pos,
      basePos: S.pos,
      moved: false,
      samples: [{ x: e.clientX, t: e.timeStamp }],
      carryV,
      wasGliding: gliding && Math.abs(carryV) > 120,
      item: item ? parseInt(item, 10) : -1,
      tDown: e.timeStamp,
    }
    syncTouchLock()
    syncPromotion(true)
    try { rootRef.current?.setPointerCapture(e.pointerId) } catch {}
    kick()
    cfg.current.onInteractStart?.()
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = S.drag
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.startX
    if (d.vertical) return
    if (!d.moved && e.pointerType === 'touch') {
      // vertical swipe = page scroll (handled by the smooth scroller), not a carousel drag
      const dy = e.clientY - d.startY
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { d.vertical = true; return }
    }
    if (!d.moved) {
      const slop = d.wasGliding ? cfg.current.conf.catchSlop : cfg.current.conf.tapSlop
      if (Math.abs(dx) < slop) return
      d.moved = true
      S.scaleTarget = cfg.current.conf.dragScale // dragging has started: shrink the cards
      // rebase so the cards don't lurch by the slop distance
      d.startX = e.clientX
      d.basePos = S.pos
      try { rootRef.current?.setPointerCapture(e.pointerId) } catch {}
      if (rootRef.current) rootRef.current.style.cursor = 'grabbing'
    }
    S.pos = d.basePos - (e.clientX - d.startX) * cfg.current.dragRatio
    d.samples.push({ x: e.clientX, t: e.timeStamp })
    if (d.samples.length > 14) d.samples.shift()
    kick()
  }

  const endPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = S.drag
    if (!d || d.id !== e.pointerId) return
    S.drag = null
    S.scaleTarget = 1 // let go: ease back to full size
    try { rootRef.current?.releasePointerCapture(e.pointerId) } catch {}
    if (rootRef.current) rootRef.current.style.cursor = 'grab'

    if (d.vertical) {
      snap()
    } else if (d.moved) {
      S.suppressClick = true
      setTimeout(() => { S.suppressClick = false }, 60)

      let v = releaseVelocity(d.samples, e.timeStamp)
      if (d.wasGliding && Math.sign(v) === Math.sign(d.carryV)) {
        const mv = cfg.current.conf.maxVelocity
        v = clamp(v + d.carryV, -mv, mv)
      }
      flick(v, d.startPos)
    } else if (d.wasGliding && e.type === 'pointercancel') {
      // gesture was stolen by the browser: keep coasting instead of stopping
      flick(d.carryV, d.startPos)
    } else if (d.wasGliding && e.type !== 'pointercancel') {
      // Tap while coasting should STOP the motion.
      S.suppressClick = true
      setTimeout(() => { S.suppressClick = false }, 60)
      snap()
    } else if (d.item >= 0 && e.type !== 'pointercancel') {
      centerOn(d.item) // click a card to bring it to center
    } else {
      snap()
    }
    kick() // make sure the scale-back animation runs even if the position is already settled
    scheduleAuto() // restart the countdown after every interaction
    cfg.current.onInteractEnd?.()
  }

  return (
    <div
      ref={rootRef}
      className={`numbered-cards-swiper relative select-none py-[48px] ${className}`}
      style={{ cursor: 'grab', ...style }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onDragStart={(e) => e.preventDefault()}
      onClickCapture={(e) => {
        if (S.suppressClick) { e.stopPropagation(); e.preventDefault() }
      }}
    >
      <div
        ref={trackRef}
        className="relative w-full"
        style={{ opacity: ready ? 1 : 0, transition: 'opacity 200ms' }}
      >
        {Array.from({ length: copies }).flatMap((_, c) =>
          items.map((child, i) => (
            <div
              key={`${c}-${i}`}
              ref={(el) => { itemEls.current[c * n + i] = el }}
              data-k={c * n + i}
              aria-hidden={c !== 0 ? true : undefined}
              className="absolute left-0 top-0"
              style={{ width: 'max-content' }}
            >
              <CardSlot child={child} index={i} isActive={c * n + i === activatedRing} />
            </div>
          )),
        )}
      </div>
    </div>
  )
}