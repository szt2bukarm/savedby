'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import VisualEditing from 'next-sanity/visual-editing/client-component'

export function SanityLiveWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    const originalError = console.error
    console.error = (...args: unknown[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('Failed to decode stega')
      )
        return
      originalError.apply(console, args)
    }
    return () => {
      console.error = originalError
    }
  }, [])

  if (pathname.startsWith('/studio')) return null

  return (
    <>
      {children}
      <VisualEditing />
    </>
  )
}
