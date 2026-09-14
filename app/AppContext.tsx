'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

type AppContextType = {
  isNavOpen: boolean
  setIsNavOpen: (open: boolean) => void
  toggleNav: () => void
  isAppLoaded: boolean
  setIsAppLoaded: (loaded: boolean) => void
  isMobile: boolean
  isDraftMode: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppProvider')
  return context
}

export function AppProvider({
  children,
  isDraftMode = false,
}: {
  children: React.ReactNode
  isDraftMode?: boolean
}) {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isAppLoaded, setIsAppLoaded] = useState(isDraftMode)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()


  useEffect(() => {
    const checkIfMobile = () => {
      const ua = navigator.userAgent.toLowerCase()
      const isMobileUA = /iphone|ipod|android|mobile/.test(ua)
      const isIpad =
        /ipad/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      return isMobileUA || isIpad
    }
    setIsMobile(checkIfMobile())
  }, [])

  const toggleNav = () => setIsNavOpen(prev => !prev)

  useEffect(() => {
    setIsNavOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsNavOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isNavOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [isNavOpen])

  return (
    <AppContext.Provider
      value={{
        isNavOpen,
        setIsNavOpen,
        toggleNav,
        isAppLoaded,
        setIsAppLoaded,
        isMobile,
        isDraftMode,
      }}>
      {children}
    </AppContext.Provider>
  )
}
