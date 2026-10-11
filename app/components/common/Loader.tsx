'use client'

import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { useGLTF, useTexture } from '@react-three/drei'
import { useAppContext } from '@/app/AppContext'

// GLBs + door textures are NOT fetched here: drei's preload below fetches *and*
// parses them into its cache, so the Canvas doesn't redo the work.
const FETCH_ASSETS = ['/SavedBy.riv']
const IMAGE_ASSETS = [
  '/assets/c1.jpg',
  '/assets/c2.jpg',
  '/assets/c3.jpg',
  '/assets/c4.jpg',
]
const MAX_WAIT_MS = 15000
const FADE_MS = 600

const loadFetch = (url: string) =>
  fetch(url).then((r) => r.arrayBuffer()).catch(() => null)

const loadImage = (url: string) =>
  new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = img.onerror = () => resolve()
    img.src = url
  })

export default function Loader() {
  const { isAppLoaded, setIsAppLoaded, isSceneReady } = useAppContext()
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [removed, setRemoved] = useState(isAppLoaded)

  // Freeze all gsap time while loading so the hero's intro tweens/delays
  // (created on mount, behind the overlay) don't play out before we reveal.
  useEffect(() => {
    if (isAppLoaded) return
    gsap.globalTimeline.pause()
    return () => {
      gsap.globalTimeline.resume()
    }
  }, [isAppLoaded])

  // 1. Network assets
  useEffect(() => {
    if (isAppLoaded) return
    let cancelled = false

    // Kick off GLB parsing + texture loading immediately, in parallel with everything else
    useGLTF.preload('/gltf/box.glb')
    useGLTF.preload('/gltf/base.glb')
    useTexture.preload(['/assets/door.png', '/assets/door_blue.png'])

    const tasks: Promise<unknown>[] = [
      ...FETCH_ASSETS.map(loadFetch),
      ...IMAGE_ASSETS.map(loadImage),
      document.fonts.ready,
    ]
    let done = 0
    const tracked = tasks.map((t) =>
      t.then(() => {
        done++
        if (!cancelled) setProgress(done / tasks.length)
      })
    )
    Promise.all(tracked).then(() => {
      if (!cancelled) setAssetsLoaded(true)
    })

    // Safety net so a failure never leaves the page hidden
    const timeout = setTimeout(() => setIsAppLoaded(true), MAX_WAIT_MS)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [isAppLoaded, setIsAppLoaded])

  // 2. Once assets are in, wait for the hero WebGL scene to be compiled and
  //    rendered (if this page has one), then reveal.
  useEffect(() => {
    if (isAppLoaded || !assetsLoaded) return
    const hasHero = !!document.querySelector("[data-gsap='hero-outer']")
    if (hasHero && !isSceneReady) return
    setIsAppLoaded(true)
  }, [assetsLoaded, isSceneReady, isAppLoaded, setIsAppLoaded])

  // Unmount the overlay once the fade-out has finished
  useEffect(() => {
    if (!isAppLoaded) return
    const t = setTimeout(() => setRemoved(true), FADE_MS)
    return () => clearTimeout(t)
  }, [isAppLoaded])

  if (removed) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
      style={{
        opacity: isAppLoaded ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
        pointerEvents: isAppLoaded ? 'none' : 'auto',
      }}
    >
      {/* assets count for 70%, the remaining 30% is the WebGL scene warm-up */}
      <span>{Math.round((isSceneReady ? 1 : progress * 0.7) * 100)}%</span>
    </div>
  )
}
