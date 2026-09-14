'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useLenis } from 'lenis/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'

gsap.registerPlugin(ScrollTrigger)

export function ScrollReset() {
  const pathname = usePathname()
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return

    lenis.stop()

    lenis.scrollTo(0, {
      immediate: true,
      force: true,
    })

    requestAnimationFrame(() => {
      lenis.start()
    })
  }, [pathname, lenis])

  return null
}
