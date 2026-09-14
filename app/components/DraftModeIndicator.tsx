'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DraftModeIndicator() {
  const pathname = usePathname()
  const [inIframe, setInIframe] = useState(true)

  useEffect(() => {
    if (window.top === window.self && !pathname.startsWith('/studio')) {
      setInIframe(false)
    }
  }, [pathname])

  if (inIframe || pathname.startsWith('/studio')) return null

  return (
    <a
      href="/api/disable-draft"
      className="fixed right-4 bottom-4 z-50 rounded bg-black px-4 py-2 text-sm text-white shadow-lg transition-colors hover:bg-gray-800">
      Disable Draft Mode
    </a>
  )
}
