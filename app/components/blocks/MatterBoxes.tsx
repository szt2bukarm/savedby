'use client'

import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { getCurveY } from '@/app/utils/curve'

/* ------------------------------------------------------------------ */
/* Tweakables                                                          */
/* ------------------------------------------------------------------ */
const BOX_COUNT = 25          // total boxes that will fall
const SPAWN_INTERVAL = 200    // ms between boxes
const DROP_SPAWN_INTERVAL = 120 // ms between boxes when dropping from the top of the window
const DROP_MAX_WIDTH = 300    // px, widest area boxes spawn in when the cards slide far apart
const CLOSED_GAP = 30         // px, gap between the cards at which they count as closed again
const DROP_SPEED = 2        // simulation speed when dropping from the top of the window
const DROP_VELOCITY = 10       // initial downward velocity when dropping from the top of the window
const GRAVITY = 1             // Reduced gravity
const PUSH_RADIUS = 150       // hover push radius
const PUSH_STRENGTH = 0.01    // hover push strength
const DEBUG = false            // true = draws the physics colliders

const CAT_BOX = 0x0001
const CAT_STATIC = 0x0002

const BoxSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 108 108" fill="none">
    <path d="M30.8441 51.8042L22.2939 65.4555L29.466 68.6837" stroke="black" strokeWidth="2.99978" strokeLinejoin="bevel" />
    <path d="M42.0414 74.3379C46.0614 76.1424 49.32 73.6908 49.32 68.8637C49.32 64.0367 46.0614 58.6538 42.0414 56.8418C38.0213 55.0297 34.7627 57.4889 34.7627 62.316C34.7627 67.143 38.0213 72.5259 42.0414 74.3379Z" stroke="black" strokeWidth="2.99978" strokeLinejoin="round" />
    <path d="M43.9184 72.929C46.9029 74.269 49.3241 72.4493 49.3241 68.8633C49.3241 65.2772 46.9029 61.28 43.9184 59.94C40.9338 58.6 38.5127 60.4197 38.5127 64.0057C38.5127 67.5918 40.9338 71.589 43.9184 72.929Z" fill="black" />
    <path d="M15.0317 59.9329C18.0162 61.2729 20.4374 59.4532 20.4374 55.8672C20.4374 52.2811 18.0162 48.284 15.0317 46.944C12.0471 45.6039 9.62598 47.4236 9.62598 51.0096C9.62598 54.5957 12.0471 58.5929 15.0317 59.9329Z" fill="black" />
    <path d="M13.1585 61.3427C17.1786 63.1471 20.4372 60.6955 20.4372 55.8685C20.4372 51.0338 17.1786 45.6585 13.1585 43.8465C9.13853 42.0421 5.87988 44.4937 5.87988 49.3207C5.87988 54.1478 9.13853 59.5306 13.1585 61.3427Z" stroke="black" strokeWidth="2.99978" strokeLinejoin="round" />
    <path d="M43.9144 82.2333C39.6964 84.0758 33.7501 83.5505 27.5983 80.7867C21.4465 78.023 15.5002 73.1959 11.2822 67.5542" stroke="black" strokeWidth="2.99978" strokeLinejoin="round" />
    <path d="M53.829 48.6411L3.39611 25.9753L1.3252 25.0464" stroke="black" strokeWidth="2.64955" />
    <path d="M53.8291 105.446V48.6401" stroke="black" strokeWidth="2.64955" />
    <path d="M105.45 25.4448L53.8291 48.6436" stroke="black" strokeWidth="2.64955" />
    <path d="M106.325 25.0474L53.829 1.45264L1.3252 25.0474V82.8122L53.829 106.407L106.325 82.8122V25.0474Z" stroke="black" strokeWidth="2.64955" />
    <path d="M27.583 36.3911L80.0868 12.7964" stroke="black" strokeWidth="2.64955" />
  </svg>
)

type MatterBoxesProps = {
  sectionRef: React.RefObject<HTMLElement | null>
  cardsRef: React.RefObject<HTMLDivElement | null>
  // Optional visible marker: when it's displayed, boxes drop from the top of the window (no mask)
  // once it crosses the middle of the screen, instead of from below the cards
  dropRef?: React.RefObject<HTMLDivElement | null>
}

export default function MatterBoxes({ sectionRef, cardsRef, dropRef }: MatterBoxesProps) {
  const layerRef = useRef<HTMLDivElement>(null)
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null)
  const boxRefs = useRef<(HTMLDivElement | null)[]>([])
  
  const [maskTop, setMaskTop] = useState<number | null>(0)
  const [boxSize, setBoxSize] = useState(80) // default, will update on mount

  useEffect(() => {
    const section = sectionRef.current
    const layer = layerRef.current
    if (!section || !layer) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const confettiInstance = confettiCanvasRef.current
      ? confetti.create(confettiCanvasRef.current, { resize: true, useWorker: false })
      : null

    let cancelled = false
    let cleanup = () => {}

    ;(async () => {
      const mod = await import('matter-js')
      if (cancelled) return
      const M: typeof import('matter-js') = (mod as any).default ?? mod
      const { Engine, Bodies, Body, Bounds, Composite, Query, Render } = M
      try {
        // @ts-expect-error poly-decomp ships no type declarations
        const decomp = await import('poly-decomp')
        M.Common.setDecomp((decomp as any).default ?? decomp)
      } catch (e) {
        console.warn('poly-decomp unavailable; concave SVG colliders will be approximated', e)
      }

      const engine = Engine.create({
        gravity: { x: 0, y: GRAVITY },
        positionIterations: 8,
        velocityIterations: 6,
      })

      // Calculate initial box size based on screen width (e.g. 4.5vw, min 40px, max 100px)
      const calculateBoxSize = () => {
        const vw = window.innerWidth
        return Math.max(40, Math.min(100, vw * 0.045))
      }
      
      let currentBoxSize = calculateBoxSize()
      setBoxSize(currentBoxSize)

      const isWindowDrop = () => !!dropRef?.current && dropRef.current.offsetParent !== null

      /* ---------- state & timers ---------- */
      let statics: Matter.Body[] = []
      const bodies: Matter.Body[] = []
      let startable = false // the spawn trigger is currently active
      let closing = false // scrolled back up, waiting for the cards to close before clearing the boxes
      const popped = new Set<number>() // indexes of boxes that got squished and exploded
      let spawned = 0
      let spawnTimer: ReturnType<typeof setInterval> | undefined
      let startDelayTimer: ReturnType<typeof setTimeout> | undefined
      let resizeTimeout: ReturnType<typeof setTimeout> | undefined
      let visible = false
      let raf = 0

      /* ---------- exact collider from an SVG <path> ---------- */
      // Samples each outer contour of the path (holes are skipped, they are unreachable)
      // and maps it from viewBox units to the on-screen rect of the <svg>.
      const svgPathToBodies = (svgEl: SVGSVGElement, s: DOMRect, opts: Matter.IBodyDefinition) => {
        const out: Matter.Body[] = []
        const pathEl = svgEl.querySelector('path')
        const vb = svgEl.viewBox.baseVal
        if (!pathEl || !vb || !vb.width || !vb.height) return out
        const r = svgEl.getBoundingClientRect()
        // viewBox is fit with preserveAspectRatio (xMidYMid meet)
        const k = Math.min(r.width / vb.width, r.height / vb.height)
        const ox = r.left - s.left + (r.width - vb.width * k) / 2 - vb.x * k
        const oy = r.top - s.top + (r.height - vb.height * k) / 2 - vb.y * k

        const contours = (pathEl.getAttribute('d') ?? '')
          .split(/(?=[Mm])/)
          .map((d) => d.trim())
          .filter(Boolean)
          .map((d) => {
            const sub = document.createElementNS('http://www.w3.org/2000/svg', 'path')
            sub.setAttribute('d', d)
            const len = sub.getTotalLength()
            const n = Math.max(32, Math.min(400, Math.ceil((len * k) / 4)))
            const pts: { x: number; y: number }[] = []
            for (let i = 0; i < n; i++) {
              const p = sub.getPointAtLength((len * i) / n)
              pts.push({ x: ox + p.x * k, y: oy + p.y * k })
            }
            const xs = pts.map((p) => p.x)
            const ys = pts.map((p) => p.y)
            return { pts, minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) }
          })

        contours.forEach((c, i) => {
          const isHole = contours.some(
            (o, j) => j !== i && c.minX >= o.minX && c.maxX <= o.maxX && c.minY >= o.minY && c.maxY <= o.maxY,
          )
          if (isHole) return
          const body = Bodies.fromVertices(0, 0, [c.pts], opts, false, 0.01, 5)
          if (!body) return
          // place so the body's bounds land exactly on the sampled outline
          Body.translate(body, { x: c.minX - body.bounds.min.x, y: c.minY - body.bounds.min.y })
          out.push(body)
        })
        return out
      }

      /* ---------- static colliders built from the DOM ---------- */
      const buildStatics = () => {
        if (!sectionRef.current || !cardsRef.current) return
        
        // Update mask position to start exactly below cardsRef
        const sRect = sectionRef.current.getBoundingClientRect()
        const cRect = cardsRef.current.getBoundingClientRect()
        setMaskTop(isWindowDrop() ? null : cRect.bottom - sRect.top)
        
        // Update box size on resize
        currentBoxSize = calculateBoxSize()
        setBoxSize(currentBoxSize)

        Composite.remove(engine.world, statics)
        statics = []

        const s = sRect
        const opts = {
          isStatic: true,
          friction: 0.85,
          restitution: 0.1,
          collisionFilter: { category: CAT_STATIC },
        }

        // floor + side walls
        statics.push(
          Bodies.rectangle(s.width / 2, s.height + 50, s.width * 2, 100, opts),
          Bodies.rectangle(-50, s.height / 2, 100, s.height * 3, opts),
          Bodies.rectangle(s.width + 50, s.height / 2, 100, s.height * 3, opts),
        )

        sectionRef.current.querySelectorAll<HTMLElement>('[data-physics]').forEach((el) => {
          const mode = el.dataset.physics
          const insetX = parseFloat(el.dataset.insetX ?? '0')
          const insetY = parseFloat(el.dataset.insetY ?? '0')

          const toBody = (r: DOMRect) => {
            const w = r.width * (1 - insetX * 2)
            const h = r.height * (1 - insetY * 2)
            const x = r.left - s.left + r.width / 2
            const y = r.top - s.top + r.height / 2
            if (w < 2 || h < 2) return null

            if (mode === 'ellipse') {
              const b = Bodies.circle(x, y, w / 2, opts, 40)
              Body.scale(b, 1, h / w)
              return b
            }
            return Bodies.rectangle(x, y, w, h, opts)
          }

          if (mode === 'curve') {
            // Orange wedge under the arc: vertical trapezoid strips following the exact arc, down to the wedge bottom.
            const r = el.getBoundingClientRect()
            const left = r.left - s.left
            const top = r.top - s.top
            const STRIPS = 64
            for (let i = 0; i < STRIPS; i++) {
              const x0 = (r.width * i) / STRIPS
              const x1 = (r.width * (i + 1)) / STRIPS
              const y0 = getCurveY(x0, r.width, r.height, window.innerWidth)
              const y1 = getCurveY(x1, r.width, r.height, window.innerWidth)
              const bottom = r.height + 100 // extend below so nothing tunnels through
              const quad = [
                { x: x0, y: y0 },
                { x: x1, y: y1 },
                { x: x1, y: bottom },
                { x: x0, y: bottom },
              ]
              const body = Bodies.fromVertices(0, 0, [quad], opts)
              if (!body) continue
              Body.translate(body, { x: left + x0 - body.bounds.min.x, y: top + Math.min(y0, y1) - body.bounds.min.y })
              statics.push(body)
            }
            return
          }

          if (mode === 'svg') {
            statics.push(...svgPathToBodies(el as unknown as SVGSVGElement, s, opts))
            return
          }

          if (mode === 'text') {
            const range = document.createRange()
            range.selectNodeContents(el)
            Array.from(range.getClientRects()).forEach((r) => {
              const b = toBody(r)
              if (b) statics.push(b)
            })
          } else {
            const b = toBody(el.getBoundingClientRect())
            if (b) statics.push(b)
          }
        })

        Composite.add(engine.world, statics)
      }

      const handleResize = () => {
        // Immediately clear boxes to hide them
        clearInterval(spawnTimer)
        clearTimeout(startDelayTimer)
        spawnTimer = undefined
        spawned = 0
        bodies.forEach(b => Composite.remove(engine.world, b))
        bodies.length = 0
        popped.clear()
        closing = false
        boxRefs.current.forEach(el => { if (el) el.style.opacity = '0' })
        
        // Clear previous timeout
        clearTimeout(resizeTimeout)
        
        // Wait 200ms of settlement before rebuilding
        resizeTimeout = setTimeout(() => {
          if (cancelled) return
          buildStatics()
          // Re-trigger spawn only if the trigger is still active, otherwise wait for it
          if (visible && startable) {
            spawnTimer = setInterval(spawnBox, isWindowDrop() ? DROP_SPAWN_INTERVAL : SPAWN_INTERVAL)
          }
        }, 200)
      }

      /* ---------- card walls (window-drop mode) ---------- */
      // Two walls hug the inner edges of the cards and follow them (sticky + spread), so boxes can only fall through the gap.
      // They reach from far above the section down to the bottom of the cards.
      const WALL_W = 80
      const WALL_H = 10000
      const wallOpts = { isStatic: true, friction: 0, restitution: 0, collisionFilter: { category: CAT_STATIC } }
      const walls = [
        Bodies.rectangle(0, -WALL_H, WALL_W, WALL_H, wallOpts),
        Bodies.rectangle(0, -WALL_H, WALL_W, WALL_H, wallOpts),
      ]
      Composite.add(engine.world, walls)

      const updateWalls = () => {
        const cards = cardsRef.current?.children
        if (!sectionRef.current || !cards || cards.length < 2 || !isWindowDrop()) {
          walls.forEach((w) => Body.setPosition(w, { x: 0, y: -WALL_H * 2 }))
          return
        }
        const s = sectionRef.current.getBoundingClientRect()
        const l = cards[0].getBoundingClientRect()
        const r = cards[1].getBoundingClientRect()
        Body.setPosition(walls[0], { x: l.right - s.left - WALL_W / 2, y: l.bottom - s.top - WALL_H / 2 })
        Body.setPosition(walls[1], { x: r.left - s.left + WALL_W / 2, y: r.bottom - s.top - WALL_H / 2 })
      }

      // Box leaves the world: fades out, with a confetti burst only when it was squished by the cards
      const popBox = (b: Matter.Body, i: number, burst = false) => {
        if (!sectionRef.current) return
        const s = sectionRef.current.getBoundingClientRect()
        popped.add(i)
        Composite.remove(engine.world, b)
        const el = boxRefs.current[i]
        if (!el) return
        el.style.transition = 'opacity 80ms ease-out'
        el.style.opacity = '0'
        if (burst) confettiInstance?.({
          particleCount: 20,
          spread: 360,
          origin: { x: b.position.x / s.width, y: b.position.y / s.height },
          colors: ['#FD4015', '#0095EC', '#110F0B'],
          zIndex: 1,
          gravity: 1,
          startVelocity: 20,
          ticks: 150,
        })
      }

      // A box whose center ended up inside a static collider (layout rebuilt, fast fall, fast scroll) can never get out, so quietly remove it
      const popEmbedded = () => {
        bodies.forEach((b, i) => {
          if (popped.has(i)) return
          if (Query.point(statics, b.position).length) popBox(b, i)
        })
      }

      // Scrolling back up closes the cards: any box caught between them pops (bursts into confetti) and leaves the world
      const popSquished = () => {
        const cards = cardsRef.current?.children
        if (!sectionRef.current || !cards || cards.length < 2 || !isWindowDrop()) return
        const s = sectionRef.current.getBoundingClientRect()
        const l = cards[0].getBoundingClientRect()
        const r = cards[1].getBoundingClientRect()
        const gap = r.left - l.right
        // Cards are back together: clear whatever is left (boxes below the cards) and allow a fresh drop
        if (closing && gap <= CLOSED_GAP) {
          closing = false
          spawned = 0
          bodies.forEach(b => Composite.remove(engine.world, b))
          bodies.length = 0
          popped.clear()
          boxRefs.current.forEach(el => { if (el) el.style.opacity = '0' })
          return
        }
        const squishing = gap <= currentBoxSize * 1.2
        bodies.forEach((b, i) => {
          if (popped.has(i)) return
          const y = b.position.y + s.top
          // Caught between the closing cards, or a wall jumped onto it (fast scrolling): its center is inside a wall, so it can't get out
          const embedded = walls.some((w) => Bounds.contains(w.bounds, b.position))
          if (!embedded && (!squishing || y < l.top || y > l.bottom)) return
          popBox(b, i, squishing)
        })
      }

      buildStatics()
      document.fonts?.ready.then(() => !cancelled && buildStatics())
      const ro = new ResizeObserver(handleResize)
      ro.observe(section)

      /* ---------- boxes ---------- */
      const spawnBox = () => {
        if (spawned >= BOX_COUNT) {
          clearInterval(spawnTimer)
          return
        }
        if (!sectionRef.current || !cardsRef.current) return
        
        const s = sectionRef.current.getBoundingClientRect()
        const c = cardsRef.current.getBoundingClientRect()

        // Spawn from just above the text, exactly at the bottom of the cards
        // Widen the X spawn area to prevent early collisions
        // In window-drop mode they fall through the gap between the cards, from just above the top of the window
        const windowDrop = isWindowDrop()
        // Window drop picks a random x inside the actual gap between the cards (margin keeps rotated boxes clear of the walls)
        let x = s.width / 2 + (Math.random() - 0.5) * 40
        const cards = cardsRef.current.children
        if (windowDrop && cards.length >= 2) {
          const margin = currentBoxSize * 0.7
          // capped around the center since the cards keep sliding apart while they leave the window
          const gapLeft = Math.max(cards[0].getBoundingClientRect().right, window.innerWidth / 2 - DROP_MAX_WIDTH / 2) - s.left + margin
          const gapRight = Math.min(cards[1].getBoundingClientRect().left, window.innerWidth / 2 + DROP_MAX_WIDTH / 2) - s.left - margin
          x = gapRight > gapLeft ? gapLeft + Math.random() * (gapRight - gapLeft) : s.width / 2
        }
        const y = windowDrop ? Math.max(0, -s.top) - currentBoxSize : c.bottom - s.top

        const scale = currentBoxSize / 108;
        const boxVertices = [
          { x: 53.8 * scale, y: 1.4 * scale },
          { x: 106.3 * scale, y: 25 * scale },
          { x: 106.3 * scale, y: 82.8 * scale },
          { x: 53.8 * scale, y: 106.4 * scale },
          { x: 1.3 * scale, y: 82.8 * scale },
          { x: 1.3 * scale, y: 25 * scale }
        ];

        const body = Bodies.fromVertices(x, y, [boxVertices], {
          restitution: 0.15,
          friction: 0.85,
          frictionAir: 0.02,
          collisionFilter: { category: CAT_BOX },
        })

        // Window drop gets a full random rotation, some spin and a slight sideways drift (the card walls keep them in the gap)
        Body.setAngle(body, windowDrop ? Math.random() * Math.PI * 2 : (Math.random() - 0.5) * Math.PI)
        Body.setAngularVelocity(body, (Math.random() - 0.5) * (windowDrop ? 0.15 : 0.05))
        // Set very little initial horizontal velocity to prevent erratic shooting
        Body.setVelocity(body, { x: (Math.random() - 0.5) * (windowDrop ? 2 : 0.1), y: windowDrop ? DROP_VELOCITY * (0.6 + Math.random() * 0.8) : 0 })

        bodies.push(body)
        Composite.add(engine.world, body)
        const el = boxRefs.current[spawned]
        if (el) {
          el.style.transition = ''
          el.style.opacity = '1'
        }
        spawned++
      }

      /* ---------- mouse: hover push ---------- */
      const onMove = (e: PointerEvent) => {
        if (!sectionRef.current) return
        const s = sectionRef.current.getBoundingClientRect()
        const mx = e.clientX - s.left
        const my = e.clientY - s.top
        for (const b of bodies) {
          const dx = b.position.x - mx
          const dy = b.position.y - my
          const d = Math.hypot(dx, dy)
          if (d > 0 && d < PUSH_RADIUS) {
            const f = PUSH_STRENGTH * b.mass * (1 - d / PUSH_RADIUS)
            Body.applyForce(b, b.position, { x: (dx / d) * f, y: (dy / d) * f })
          }
        }
      }
      section.addEventListener('pointermove', onMove)

      /* ---------- optional debug renderer ---------- */
      let render: Matter.Render | undefined
      if (DEBUG) {
        render = Render.create({
          element: layer,
          engine,
          options: {
            width: section.clientWidth,
            height: section.clientHeight,
            wireframes: true,
            background: 'transparent',
            wireframeBackground: 'transparent',
          } as any,
        })
        Object.assign(render.canvas.style, { position: 'absolute', inset: '0', pointerEvents: 'none' })
        Render.run(render)
      }

      /* ---------- loop (pauses when offscreen) ---------- */
      const STEP = 1000 / 60
      const SIM_SPEED = 1.5 // 1 = real-time at 60Hz pace; raise to speed up, lower to slow down
      let last = 0
      let acc = 0
      const tick = (now: number) => {
        raf = requestAnimationFrame(tick)
        if (!visible) {
          last = 0
          return
        }
        if (!last) last = now
        acc += Math.min(now - last, 100) * (isWindowDrop() ? DROP_SPEED : SIM_SPEED)
        last = now
        updateWalls()
        popSquished()
        popEmbedded()
        while (acc >= STEP) {
          Engine.update(engine, STEP)
          acc -= STEP
        }
        bodies.forEach((b, i) => {
          const el = boxRefs.current[i]
          if (!el || popped.has(i)) return
          el.style.transform = `translate3d(${b.position.x - currentBoxSize / 2}px, ${b.position.y - currentBoxSize / 2}px, 0) rotate(${b.angle}rad)`
        })
      }
      raf = requestAnimationFrame(tick)

      // Simulation runs as long as any part of the section is on screen
      const visibilityIo = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting
        },
        { threshold: 0 },
      )
      visibilityIo.observe(section)

      // Spawn only starts once 30% of the section is in view (or the marker crosses the middle in window-drop mode)
      const onStartable = (isIntersecting: boolean) => {
        startable = isIntersecting
        if (startable && !spawnTimer && !startDelayTimer && spawned === 0) {
          startDelayTimer = setTimeout(() => {
            if (cancelled || !startable) return
            spawnTimer = setInterval(spawnBox, isWindowDrop() ? DROP_SPAWN_INTERVAL : SPAWN_INTERVAL)
          }, isWindowDrop() ? 0 : 500)
        }
      }
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!isWindowDrop()) onStartable(entry.isIntersecting)
        },
        { threshold: 0.3 },
      )
      io.observe(section)

      // Window-drop mode: start once the marker crosses the middle of the screen
      const dropIo = new IntersectionObserver(
        ([entry]) => {
          if (!isWindowDrop()) return
          onStartable(entry.isIntersecting)
          // Scrolled back up (marker below the middle line): stop spawning and let the closing cards squish the boxes,
          // they get fully cleared once the cards are back together (see popSquished)
          if (!entry.isIntersecting && entry.boundingClientRect.top > window.innerHeight / 2) {
            clearInterval(spawnTimer)
            clearTimeout(startDelayTimer)
            spawnTimer = undefined
            startDelayTimer = undefined
            closing = true
          } else if (entry.isIntersecting && closing) {
            // Opened again before they closed: carry on dropping the remaining boxes
            closing = false
            if (!spawnTimer && spawned > 0 && spawned < BOX_COUNT) spawnTimer = setInterval(spawnBox, DROP_SPAWN_INTERVAL)
          }
        },
        { rootMargin: '-50% 0px -50% 0px' },
      )
      if (dropRef?.current) dropIo.observe(dropRef.current)

      cleanup = () => {
        confettiInstance?.reset()
        cancelAnimationFrame(raf)
        clearInterval(spawnTimer)
        clearTimeout(startDelayTimer)
        clearTimeout(resizeTimeout)
        io.disconnect()
        dropIo.disconnect()
        visibilityIo.disconnect()
        ro.disconnect()
        section.removeEventListener('pointermove', onMove)
        if (render) {
          Render.stop(render)
          render.canvas.remove()
        }
        Composite.clear(engine.world, false)
        Engine.clear(engine)
      }
    })()

    return () => {
      cancelled = true
      cleanup()
    }
  }, [sectionRef, cardsRef, dropRef])

  return (
    <div 
      ref={layerRef} 
      aria-hidden 
      className='pointer-events-none absolute inset-0 z-20 overflow-hidden'
      style={maskTop === null ? undefined : {
        maskImage: `linear-gradient(to bottom, transparent 0px, transparent ${maskTop}px, black ${maskTop + 100}px)`,
        WebkitMaskImage: `linear-gradient(to bottom, transparent 0px, transparent ${maskTop}px, black ${maskTop + 100}px)`
      }}
    >
      <canvas ref={confettiCanvasRef} className='absolute inset-0 w-full h-full' />
      {Array.from({ length: BOX_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { boxRefs.current[i] = el }}
          className='absolute left-0 top-0 opacity-0 will-change-transform transition-opacity duration-200 ease-out'
          style={{ width: boxSize, height: boxSize }}
        >
          <BoxSvg />
        </div>
      ))}
    </div>
  )
}
