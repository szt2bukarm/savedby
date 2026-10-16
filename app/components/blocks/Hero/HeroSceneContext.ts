'use client'

import { createContext, useContext } from 'react'

export interface HeroSceneContextValue {
  /** Moves the persistent canvas into `slot`. Returns a cleanup that parks it again. */
  attach: (slot: HTMLElement) => () => void
  setHeroInView: (inView: boolean) => void
  setWobbleEnabled: (enabled: boolean) => void
}

const noop = () => {}

export const HeroSceneContext = createContext<HeroSceneContextValue>({
  attach: () => noop,
  setHeroInView: noop,
  setWobbleEnabled: noop,
})

export const useHeroScene = () => useContext(HeroSceneContext)
