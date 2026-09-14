'use client'

import { ReactLenis } from 'lenis/react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(CustomEase, ScrollTrigger)

import { useAppContext } from './AppContext'
import { usePathname } from 'next/navigation'

function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { isDraftMode } = useAppContext()
  const pathname = usePathname()

  const isFindUsPage = pathname === '/find-us'

  if (isDraftMode || isFindUsPage) return <>{children}</>

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.05,
        duration: 1.5,
      }}>
      {children}
    </ReactLenis>
  )
}

export default SmoothScroll
