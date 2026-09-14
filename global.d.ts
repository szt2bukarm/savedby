declare module '*.css'

declare global {
  interface Window {
    fbq: (...args: any[]) => void
    ttq: any
  }
}

export {}
