'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useAppContext } from '@/app/AppContext'
import { HeroScenes } from '../Hero'
import { HeroSceneContext } from './HeroSceneContext'

/**
 * Builds the hero WebGL scene once (during the loader) and keeps it alive across routes.
 * The <canvas> is parked in an off-screen holder and moved into the Hero's slot while a Hero
 * is mounted, so returning to "/" never reloads models or recompiles shaders.
 */
export default function HeroSceneProvider({ children }: { children: React.ReactNode }) {
  const { setIsSceneReady } = useAppContext()
  const holderRef = useRef<HTMLDivElement>(null)
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const tokenCounter = useRef(0)

  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  // > 0 while a hero is mounted; new value per mount so scroll animations get rebuilt
  const [mountToken, setMountToken] = useState(0)
  const [heroInView, setHeroInView] = useState(true)
  const [wobbleEnabled, setWobbleEnabled] = useState(true)

  useEffect(() => {
    setIsMobile(window.matchMedia('(pointer: coarse)').matches)
    setMounted(true)
  }, [])

  const attach = useCallback((slot: HTMLElement) => {
    const wrap = canvasWrapRef.current
    const holder = holderRef.current
    if (!wrap || !holder) return () => {}
    slot.appendChild(wrap)
    setWobbleEnabled(true)
    const outer = slot.closest('[data-gsap="hero-outer"]') ?? slot
    const r = outer.getBoundingClientRect()
    setHeroInView(r.bottom > -100 && r.top < window.innerHeight + 100)
    setMountToken((tokenCounter.current += 1))
    return () => {
      holder.appendChild(wrap)
      setMountToken(0)
    }
  }, [])

  const onReady = useCallback(() => {
    setSceneReady(true)
    setIsSceneReady(true)
  }, [setIsSceneReady])

  const value = useMemo(() => ({ attach, setHeroInView, setWobbleEnabled }), [attach])

  // render while warming up; afterwards only while a hero is visible
  const frameloop = !sceneReady || (mountToken > 0 && heroInView) ? 'always' : 'never'

  return (
    <HeroSceneContext.Provider value={value}>
      {/* Must come BEFORE {children}: refs attach in tree order, and a Hero's layout effect
          (attach) needs holderRef/canvasWrapRef to already be set on the very first render. */}
      <div
        ref={holderRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: '-200vw',
          width: '100vw',
          height: '100dvh',
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <div ref={canvasWrapRef} className="relative w-full h-[100dvh] pointer-events-none">
          {mounted && (
            <Canvas
              camera={{ fov: 18.18, position: [0, 0, 35] }}
              dpr={isMobile ? 1 : [1, 1.5]}
              frameloop={frameloop}
              gl={{ antialias: !isMobile, powerPreference: 'high-performance' }}
              style={{ pointerEvents: 'none' }}
              className="pointer-events-none w-full h-[100dvh]"
            >
              <HeroScenes wobbleEnabled={wobbleEnabled} mountToken={mountToken} onReady={onReady} />
            </Canvas>
          )}
        </div>
      </div>
      {children}
    </HeroSceneContext.Provider>
  )
}
