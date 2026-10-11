import { stegaClean } from '@sanity/client/stega'
import type { SpacingData } from '@/types/sanity'

const PT = {
  mobile: {
    0: 'pt-0', 10: 'pt-[10px]', 20: 'pt-[20px]', 30: 'pt-[30px]', 40: 'pt-[40px]',
    50: 'pt-[50px]', 60: 'pt-[60px]', 70: 'pt-[70px]', 80: 'pt-[80px]', 90: 'pt-[90px]',
    100: 'pt-[100px]', 110: 'pt-[110px]', 120: 'pt-[120px]', 130: 'pt-[130px]', 140: 'pt-[140px]',
    150: 'pt-[150px]', 160: 'pt-[160px]', 170: 'pt-[170px]', 180: 'pt-[180px]', 190: 'pt-[190px]',
    200: 'pt-[200px]', 210: 'pt-[210px]', 220: 'pt-[220px]', 230: 'pt-[230px]', 240: 'pt-[240px]',
    250: 'pt-[250px]', 260: 'pt-[260px]', 270: 'pt-[270px]', 280: 'pt-[280px]', 290: 'pt-[290px]',
    300: 'pt-[300px]', 310: 'pt-[310px]', 320: 'pt-[320px]', 330: 'pt-[330px]', 340: 'pt-[340px]',
    350: 'pt-[350px]', 360: 'pt-[360px]', 370: 'pt-[370px]', 380: 'pt-[380px]', 390: 'pt-[390px]',
    400: 'pt-[400px]',
  } as Record<number, string>,
  tablet: {
    0: 'sm:pt-0', 10: 'sm:pt-[10px]', 20: 'sm:pt-[20px]', 30: 'sm:pt-[30px]', 40: 'sm:pt-[40px]',
    50: 'sm:pt-[50px]', 60: 'sm:pt-[60px]', 70: 'sm:pt-[70px]', 80: 'sm:pt-[80px]', 90: 'sm:pt-[90px]',
    100: 'sm:pt-[100px]', 110: 'sm:pt-[110px]', 120: 'sm:pt-[120px]', 130: 'sm:pt-[130px]', 140: 'sm:pt-[140px]',
    150: 'sm:pt-[150px]', 160: 'sm:pt-[160px]', 170: 'sm:pt-[170px]', 180: 'sm:pt-[180px]', 190: 'sm:pt-[190px]',
    200: 'sm:pt-[200px]', 210: 'sm:pt-[210px]', 220: 'sm:pt-[220px]', 230: 'sm:pt-[230px]', 240: 'sm:pt-[240px]',
    250: 'sm:pt-[250px]', 260: 'sm:pt-[260px]', 270: 'sm:pt-[270px]', 280: 'sm:pt-[280px]', 290: 'sm:pt-[290px]',
    300: 'sm:pt-[300px]', 310: 'sm:pt-[310px]', 320: 'sm:pt-[320px]', 330: 'sm:pt-[330px]', 340: 'sm:pt-[340px]',
    350: 'sm:pt-[350px]', 360: 'sm:pt-[360px]', 370: 'sm:pt-[370px]', 380: 'sm:pt-[380px]', 390: 'sm:pt-[390px]',
    400: 'sm:pt-[400px]',
  } as Record<number, string>,
  desktop: {
    0: 'lg:pt-0', 10: 'lg:pt-[10px]', 20: 'lg:pt-[20px]', 30: 'lg:pt-[30px]', 40: 'lg:pt-[40px]',
    50: 'lg:pt-[50px]', 60: 'lg:pt-[60px]', 70: 'lg:pt-[70px]', 80: 'lg:pt-[80px]', 90: 'lg:pt-[90px]',
    100: 'lg:pt-[100px]', 110: 'lg:pt-[110px]', 120: 'lg:pt-[120px]', 130: 'lg:pt-[130px]', 140: 'lg:pt-[140px]',
    150: 'lg:pt-[150px]', 160: 'lg:pt-[160px]', 170: 'lg:pt-[170px]', 180: 'lg:pt-[180px]', 190: 'lg:pt-[190px]',
    200: 'lg:pt-[200px]', 210: 'lg:pt-[210px]', 220: 'lg:pt-[220px]', 230: 'lg:pt-[230px]', 240: 'lg:pt-[240px]',
    250: 'lg:pt-[250px]', 260: 'lg:pt-[260px]', 270: 'lg:pt-[270px]', 280: 'lg:pt-[280px]', 290: 'lg:pt-[290px]',
    300: 'lg:pt-[300px]', 310: 'lg:pt-[310px]', 320: 'lg:pt-[320px]', 330: 'lg:pt-[330px]', 340: 'lg:pt-[340px]',
    350: 'lg:pt-[350px]', 360: 'lg:pt-[360px]', 370: 'lg:pt-[370px]', 380: 'lg:pt-[380px]', 390: 'lg:pt-[390px]',
    400: 'lg:pt-[400px]',
  } as Record<number, string>,
}

const PB = {
  mobile: {
    0: 'pb-0', 10: 'pb-[10px]', 20: 'pb-[20px]', 30: 'pb-[30px]', 40: 'pb-[40px]',
    50: 'pb-[50px]', 60: 'pb-[60px]', 70: 'pb-[70px]', 80: 'pb-[80px]', 90: 'pb-[90px]',
    100: 'pb-[100px]', 110: 'pb-[110px]', 120: 'pb-[120px]', 130: 'pb-[130px]', 140: 'pb-[140px]',
    150: 'pb-[150px]', 160: 'pb-[160px]', 170: 'pb-[170px]', 180: 'pb-[180px]', 190: 'pb-[190px]',
    200: 'pb-[200px]', 210: 'pb-[210px]', 220: 'pb-[220px]', 230: 'pb-[230px]', 240: 'pb-[240px]',
    250: 'pb-[250px]', 260: 'pb-[260px]', 270: 'pb-[270px]', 280: 'pb-[280px]', 290: 'pb-[290px]',
    300: 'pb-[300px]', 310: 'pb-[310px]', 320: 'pb-[320px]', 330: 'pb-[330px]', 340: 'pb-[340px]',
    350: 'pb-[350px]', 360: 'pb-[360px]', 370: 'pb-[370px]', 380: 'pb-[380px]', 390: 'pb-[390px]',
    400: 'pb-[400px]',
  } as Record<number, string>,
  tablet: {
    0: 'sm:pb-0', 10: 'sm:pb-[10px]', 20: 'sm:pb-[20px]', 30: 'sm:pb-[30px]', 40: 'sm:pb-[40px]',
    50: 'sm:pb-[50px]', 60: 'sm:pb-[60px]', 70: 'sm:pb-[70px]', 80: 'sm:pb-[80px]', 90: 'sm:pb-[90px]',
    100: 'sm:pb-[100px]', 110: 'sm:pb-[110px]', 120: 'sm:pb-[120px]', 130: 'sm:pb-[130px]', 140: 'sm:pb-[140px]',
    150: 'sm:pb-[150px]', 160: 'sm:pb-[160px]', 170: 'sm:pb-[170px]', 180: 'sm:pb-[180px]', 190: 'sm:pb-[190px]',
    200: 'sm:pb-[200px]', 210: 'sm:pb-[210px]', 220: 'sm:pb-[220px]', 230: 'sm:pb-[230px]', 240: 'sm:pb-[240px]',
    250: 'sm:pb-[250px]', 260: 'sm:pb-[260px]', 270: 'sm:pb-[270px]', 280: 'sm:pb-[280px]', 290: 'sm:pb-[290px]',
    300: 'sm:pb-[300px]', 310: 'sm:pb-[310px]', 320: 'sm:pb-[320px]', 330: 'sm:pb-[330px]', 340: 'sm:pb-[340px]',
    350: 'sm:pb-[350px]', 360: 'sm:pb-[360px]', 370: 'sm:pb-[370px]', 380: 'sm:pb-[380px]', 390: 'sm:pb-[390px]',
    400: 'sm:pb-[400px]',
  } as Record<number, string>,
  desktop: {
    0: 'lg:pb-0', 10: 'lg:pb-[10px]', 20: 'lg:pb-[20px]', 30: 'lg:pb-[30px]', 40: 'lg:pb-[40px]',
    50: 'lg:pb-[50px]', 60: 'lg:pb-[60px]', 70: 'lg:pb-[70px]', 80: 'lg:pb-[80px]', 90: 'lg:pb-[90px]',
    100: 'lg:pb-[100px]', 110: 'lg:pb-[110px]', 120: 'lg:pb-[120px]', 130: 'lg:pb-[130px]', 140: 'lg:pb-[140px]',
    150: 'lg:pb-[150px]', 160: 'lg:pb-[160px]', 170: 'lg:pb-[170px]', 180: 'lg:pb-[180px]', 190: 'lg:pb-[190px]',
    200: 'lg:pb-[200px]', 210: 'lg:pb-[210px]', 220: 'lg:pb-[220px]', 230: 'lg:pb-[230px]', 240: 'lg:pb-[240px]',
    250: 'lg:pb-[250px]', 260: 'lg:pb-[260px]', 270: 'lg:pb-[270px]', 280: 'lg:pb-[280px]', 290: 'lg:pb-[290px]',
    300: 'lg:pb-[300px]', 310: 'lg:pb-[310px]', 320: 'lg:pb-[320px]', 330: 'lg:pb-[330px]', 340: 'lg:pb-[340px]',
    350: 'lg:pb-[350px]', 360: 'lg:pb-[360px]', 370: 'lg:pb-[370px]', 380: 'lg:pb-[380px]', 390: 'lg:pb-[390px]',
    400: 'lg:pb-[400px]',
  } as Record<number, string>,
}

const MT = {
  mobile: {
    0: 'mt-0', 10: 'mt-[10px]', 20: 'mt-[20px]', 30: 'mt-[30px]', 40: 'mt-[40px]',
    50: 'mt-[50px]', 60: 'mt-[60px]', 70: 'mt-[70px]', 80: 'mt-[80px]', 90: 'mt-[90px]',
    100: 'mt-[100px]', 110: 'mt-[110px]', 120: 'mt-[120px]', 130: 'mt-[130px]', 140: 'mt-[140px]',
    150: 'mt-[150px]', 160: 'mt-[160px]', 170: 'mt-[170px]', 180: 'mt-[180px]', 190: 'mt-[190px]',
    200: 'mt-[200px]', 210: 'mt-[210px]', 220: 'mt-[220px]', 230: 'mt-[230px]', 240: 'mt-[240px]',
    250: 'mt-[250px]', 260: 'mt-[260px]', 270: 'mt-[270px]', 280: 'mt-[280px]', 290: 'mt-[290px]',
    300: 'mt-[300px]', 310: 'mt-[310px]', 320: 'mt-[320px]', 330: 'mt-[330px]', 340: 'mt-[340px]',
    350: 'mt-[350px]', 360: 'mt-[360px]', 370: 'mt-[370px]', 380: 'mt-[380px]', 390: 'mt-[390px]',
    400: 'mt-[400px]',
  } as Record<number, string>,
  tablet: {
    0: 'sm:mt-0', 10: 'sm:mt-[10px]', 20: 'sm:mt-[20px]', 30: 'sm:mt-[30px]', 40: 'sm:mt-[40px]',
    50: 'sm:mt-[50px]', 60: 'sm:mt-[60px]', 70: 'sm:mt-[70px]', 80: 'sm:mt-[80px]', 90: 'sm:mt-[90px]',
    100: 'sm:mt-[100px]', 110: 'sm:mt-[110px]', 120: 'sm:mt-[120px]', 130: 'sm:mt-[130px]', 140: 'sm:mt-[140px]',
    150: 'sm:mt-[150px]', 160: 'sm:mt-[160px]', 170: 'sm:mt-[170px]', 180: 'sm:mt-[180px]', 190: 'sm:mt-[190px]',
    200: 'sm:mt-[200px]', 210: 'sm:mt-[210px]', 220: 'sm:mt-[220px]', 230: 'sm:mt-[230px]', 240: 'sm:mt-[240px]',
    250: 'sm:mt-[250px]', 260: 'sm:mt-[260px]', 270: 'sm:mt-[270px]', 280: 'sm:mt-[280px]', 290: 'sm:mt-[290px]',
    300: 'sm:mt-[300px]', 310: 'sm:mt-[310px]', 320: 'sm:mt-[320px]', 330: 'sm:mt-[330px]', 340: 'sm:mt-[340px]',
    350: 'sm:mt-[350px]', 360: 'sm:mt-[360px]', 370: 'sm:mt-[370px]', 380: 'sm:mt-[380px]', 390: 'sm:mt-[390px]',
    400: 'sm:mt-[400px]',
  } as Record<number, string>,
  desktop: {
    0: 'lg:mt-0', 10: 'lg:mt-[10px]', 20: 'lg:mt-[20px]', 30: 'lg:mt-[30px]', 40: 'lg:mt-[40px]',
    50: 'lg:mt-[50px]', 60: 'lg:mt-[60px]', 70: 'lg:mt-[70px]', 80: 'lg:mt-[80px]', 90: 'lg:mt-[90px]',
    100: 'lg:mt-[100px]', 110: 'lg:mt-[110px]', 120: 'lg:mt-[120px]', 130: 'lg:mt-[130px]', 140: 'lg:mt-[140px]',
    150: 'lg:mt-[150px]', 160: 'lg:mt-[160px]', 170: 'lg:mt-[170px]', 180: 'lg:mt-[180px]', 190: 'lg:mt-[190px]',
    200: 'lg:mt-[200px]', 210: 'lg:mt-[210px]', 220: 'lg:mt-[220px]', 230: 'lg:mt-[230px]', 240: 'lg:mt-[240px]',
    250: 'lg:mt-[250px]', 260: 'lg:mt-[260px]', 270: 'lg:mt-[270px]', 280: 'lg:mt-[280px]', 290: 'lg:mt-[290px]',
    300: 'lg:mt-[300px]', 310: 'lg:mt-[310px]', 320: 'lg:mt-[320px]', 330: 'lg:mt-[330px]', 340: 'lg:mt-[340px]',
    350: 'lg:mt-[350px]', 360: 'lg:mt-[360px]', 370: 'lg:mt-[370px]', 380: 'lg:mt-[380px]', 390: 'lg:mt-[390px]',
    400: 'lg:mt-[400px]',
  } as Record<number, string>,
}

const MB = {
  mobile: {
    0: 'mb-0', 10: 'mb-[10px]', 20: 'mb-[20px]', 30: 'mb-[30px]', 40: 'mb-[40px]',
    50: 'mb-[50px]', 60: 'mb-[60px]', 70: 'mb-[70px]', 80: 'mb-[80px]', 90: 'mb-[90px]',
    100: 'mb-[100px]', 110: 'mb-[110px]', 120: 'mb-[120px]', 130: 'mb-[130px]', 140: 'mb-[140px]',
    150: 'mb-[150px]', 160: 'mb-[160px]', 170: 'mb-[170px]', 180: 'mb-[180px]', 190: 'mb-[190px]',
    200: 'mb-[200px]', 210: 'mb-[210px]', 220: 'mb-[220px]', 230: 'mb-[230px]', 240: 'mb-[240px]',
    250: 'mb-[250px]', 260: 'mb-[260px]', 270: 'mb-[270px]', 280: 'mb-[280px]', 290: 'mb-[290px]',
    300: 'mb-[300px]', 310: 'mb-[310px]', 320: 'mb-[320px]', 330: 'mb-[330px]', 340: 'mb-[340px]',
    350: 'mb-[350px]', 360: 'mb-[360px]', 370: 'mb-[370px]', 380: 'mb-[380px]', 390: 'mb-[390px]',
    400: 'mb-[400px]',
  } as Record<number, string>,
  tablet: {
    0: 'sm:mb-0', 10: 'sm:mb-[10px]', 20: 'sm:mb-[20px]', 30: 'sm:mb-[30px]', 40: 'sm:mb-[40px]',
    50: 'sm:mb-[50px]', 60: 'sm:mb-[60px]', 70: 'sm:mb-[70px]', 80: 'sm:mb-[80px]', 90: 'sm:mb-[90px]',
    100: 'sm:mb-[100px]', 110: 'sm:mb-[110px]', 120: 'sm:mb-[120px]', 130: 'sm:mb-[130px]', 140: 'sm:mb-[140px]',
    150: 'sm:mb-[150px]', 160: 'sm:mb-[160px]', 170: 'sm:mb-[170px]', 180: 'sm:mb-[180px]', 190: 'sm:mb-[190px]',
    200: 'sm:mb-[200px]', 210: 'sm:mb-[210px]', 220: 'sm:mb-[220px]', 230: 'sm:mb-[230px]', 240: 'sm:mb-[240px]',
    250: 'sm:mb-[250px]', 260: 'sm:mb-[260px]', 270: 'sm:mb-[270px]', 280: 'sm:mb-[280px]', 290: 'sm:mb-[290px]',
    300: 'sm:mb-[300px]', 310: 'sm:mb-[310px]', 320: 'sm:mb-[320px]', 330: 'sm:mb-[330px]', 340: 'sm:mb-[340px]',
    350: 'sm:mb-[350px]', 360: 'sm:mb-[360px]', 370: 'sm:mb-[370px]', 380: 'sm:mb-[380px]', 390: 'sm:mb-[390px]',
    400: 'sm:mb-[400px]',
  } as Record<number, string>,
  desktop: {
    0: 'lg:mb-0', 10: 'lg:mb-[10px]', 20: 'lg:mb-[20px]', 30: 'lg:mb-[30px]', 40: 'lg:mb-[40px]',
    50: 'lg:mb-[50px]', 60: 'lg:mb-[60px]', 70: 'lg:mb-[70px]', 80: 'lg:mb-[80px]', 90: 'lg:mb-[90px]',
    100: 'lg:mb-[100px]', 110: 'lg:mb-[110px]', 120: 'lg:mb-[120px]', 130: 'lg:mb-[130px]', 140: 'lg:mb-[140px]',
    150: 'lg:mb-[150px]', 160: 'lg:mb-[160px]', 170: 'lg:mb-[170px]', 180: 'lg:mb-[180px]', 190: 'lg:mb-[190px]',
    200: 'lg:mb-[200px]', 210: 'lg:mb-[210px]', 220: 'lg:mb-[220px]', 230: 'lg:mb-[230px]', 240: 'lg:mb-[240px]',
    250: 'lg:mb-[250px]', 260: 'lg:mb-[260px]', 270: 'lg:mb-[270px]', 280: 'lg:mb-[280px]', 290: 'lg:mb-[290px]',
    300: 'lg:mb-[300px]', 310: 'lg:mb-[310px]', 320: 'lg:mb-[320px]', 330: 'lg:mb-[330px]', 340: 'lg:mb-[340px]',
    350: 'lg:mb-[350px]', 360: 'lg:mb-[360px]', 370: 'lg:mb-[370px]', 380: 'lg:mb-[380px]', 390: 'lg:mb-[390px]',
    400: 'lg:mb-[400px]',
  } as Record<number, string>,
}

function parseValue(val: unknown): number | undefined {
  const cleaned = stegaClean(val)
  if (cleaned === undefined || cleaned === null || cleaned === '') return undefined
  const num = typeof cleaned === 'number' ? cleaned : parseInt(String(cleaned), 10)
  if (isNaN(num)) return undefined
  return Math.max(0, Math.min(400, Math.round(num / 10) * 10))
}

export function getSpacingClasses(spacing?: SpacingData): string {
  if (!spacing) return ''

  const isMargin = stegaClean(spacing.type) === 'margin'
  const topMap = isMargin ? MT : PT
  const bottomMap = isMargin ? MB : PB

  const desktopTop = parseValue(spacing.top)
  const tabletTop = parseValue(spacing.tabletTop)
  const mobileTop = parseValue(spacing.mobileTop)

  const desktopBottom = parseValue(spacing.bottom)
  const tabletBottom = parseValue(spacing.tabletBottom)
  const mobileBottom = parseValue(spacing.mobileBottom)

  const finalDesktopTop = desktopTop ?? 0
  const finalTabletTop = tabletTop ?? finalDesktopTop
  const finalMobileTop = mobileTop ?? finalTabletTop

  const finalDesktopBottom = desktopBottom ?? 0
  const finalTabletBottom = tabletBottom ?? finalDesktopBottom
  const finalMobileBottom = mobileBottom ?? finalTabletBottom

  const classes: string[] = []

  // Top classes
  classes.push(topMap.mobile[finalMobileTop] || `${isMargin ? 'mt' : 'pt'}-[${finalMobileTop}px]`)
  if (finalTabletTop !== finalMobileTop) {
    classes.push(topMap.tablet[finalTabletTop] || `sm:${isMargin ? 'mt' : 'pt'}-[${finalTabletTop}px]`)
  }
  if (finalDesktopTop !== finalTabletTop) {
    classes.push(topMap.desktop[finalDesktopTop] || `lg:${isMargin ? 'mt' : 'pt'}-[${finalDesktopTop}px]`)
  }

  // Bottom classes
  classes.push(bottomMap.mobile[finalMobileBottom] || `${isMargin ? 'mb' : 'pb'}-[${finalMobileBottom}px]`)
  if (finalTabletBottom !== finalMobileBottom) {
    classes.push(bottomMap.tablet[finalTabletBottom] || `sm:${isMargin ? 'mb' : 'pb'}-[${finalTabletBottom}px]`)
  }
  if (finalDesktopBottom !== finalTabletBottom) {
    classes.push(bottomMap.desktop[finalDesktopBottom] || `lg:${isMargin ? 'mb' : 'pb'}-[${finalDesktopBottom}px]`)
  }

  return classes.join(' ')
}
