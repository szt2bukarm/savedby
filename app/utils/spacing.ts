import { stegaClean } from '@sanity/client/stega'

const PT_DESKTOP: Record<string, string> = {
  '0': 'sm:pt-0',
  xs: 'sm:pt-[30px]',
  sm: 'sm:pt-[40px]',
  md: 'sm:pt-[50px]',
  lg: 'sm:pt-[60px]',
  xl: 'sm:pt-[80px]',
  huge: 'sm:pt-[100px]',
  massive: 'sm:pt-[120px]',
}

const PT_MOBILE: Record<string, string> = {
  '0': 'pt-0',
  xs: 'pt-[20px]',
  sm: 'pt-[30px]',
  md: 'pt-[40px]',
  lg: 'pt-[50px]',
  xl: 'pt-[60px]',
  huge: 'pt-[80px]',
  massive: 'pt-[100px]',
}

const PB_DESKTOP: Record<string, string> = {
  '0': 'sm:pb-0',
  xs: 'sm:pb-[30px]',
  sm: 'sm:pb-[40px]',
  md: 'sm:pb-[50px]',
  lg: 'sm:pb-[60px]',
  xl: 'sm:pb-[80px]',
  huge: 'sm:pb-[100px]',
  massive: 'sm:pb-[120px]',
}

const PB_MOBILE: Record<string, string> = {
  '0': 'pb-0',
  xs: 'pb-[20px]',
  sm: 'pb-[30px]',
  md: 'pb-[40px]',
  lg: 'pb-[50px]',
  xl: 'pb-[60px]',
  huge: 'pb-[80px]',
  massive: 'pb-[100px]',
}

export function getPaddingClasses(spacing?: {
  top?: string
  bottom?: string
  mobileTop?: string
  mobileBottom?: string
}) {
  const topKey = stegaClean(spacing?.top) || 'md'
  const bottomKey = stegaClean(spacing?.bottom) || 'md'
  const mobileTopKey = stegaClean(spacing?.mobileTop) || topKey
  const mobileBottomKey = stegaClean(spacing?.mobileBottom) || bottomKey

  return [
    PT_DESKTOP[topKey] || PT_DESKTOP['md'],
    PT_MOBILE[mobileTopKey] || PT_MOBILE['md'],
    PB_DESKTOP[bottomKey] || PB_DESKTOP['md'],
    PB_MOBILE[mobileBottomKey] || PB_MOBILE['md'],
  ].join(' ')
}
