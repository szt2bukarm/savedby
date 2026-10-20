'use client'

import { useEffect, useState } from 'react'
import { decodeFont, RiveFile } from '@rive-app/react-webgl2'


let rivPromise: Promise<RiveFile> | null = null
let rivFile: RiveFile | null = null

export const RIV_URL = '/SavedBy.riv'

/**
 * Fetches AND parses /SavedBy.riv exactly once. Every `useRive` instance gets this same
 * RiveFile (`riveFile` param) and only creates its own artboard/state machine from it.
 */
export const loadRivFile = () => {
  if (!rivPromise) {
    rivPromise = new Promise<RiveFile>((resolve, reject) => {
      const file = new RiveFile({ src: RIV_URL, onLoad: () => {
        // Hold one reference for the lifetime of the page so that when the last instance
        // unmounts (e.g. carousel remount) the parsed file isn't destroyed.
        file.getInstance()
        rivFile = file
        resolve(file)
      }, onLoadError: () => reject(new Error(`Failed to load ${RIV_URL}`)) })
      file.init().catch(reject)
    })
    rivPromise.catch(() => { rivPromise = null })
  }
  return rivPromise
}

/** Returns the shared parsed RiveFile once loaded (undefined before), to pass as `riveFile` to `useRive`. */
export function useRivFile(): RiveFile | undefined {
  const [file, setFile] = useState<RiveFile | undefined>(rivFile ?? undefined)
  useEffect(() => {
    if (file) return
    let cancelled = false
    loadRivFile().then((f) => { if (!cancelled) setFile(f) }).catch(() => {})
    return () => { cancelled = true }
  }, [file])
  return file
}

type Font = Awaited<ReturnType<typeof decodeFont>>
let fontsPromise: Promise<[Font, Font]> | null = null

const loadFont = async (url: string) =>
  decodeFont(new Uint8Array(await (await fetch(url)).arrayBuffer()))

export const getRiveFonts = () => {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      loadFont('/fonts/RiformaLLSub-Regular.ttf'),
      loadFont('/fonts/RiformaLLSub-Bold.ttf'),
    ])
    fontsPromise.catch(() => { fontsPromise = null })
  }
  return fontsPromise
}
