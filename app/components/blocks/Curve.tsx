import { stegaClean } from '@sanity/client/stega'
import { getSpacingClasses } from '@/app/utils/spacing'
import { CURVE_CLIP, CURVE_VARS } from '@/app/utils/curve'
import type { CurveBlockProps } from '@/types/sanity'

const COLORS = {
  offwhite: 'bg-darkbg',
  orange: 'bg-brand-orange',
  blue: 'bg-brand-blue',
  brown: 'bg-brand-brown'
}

export default function Curve({ block, className }: CurveBlockProps & { className?: string }) {
  const spacingClasses = getSpacingClasses(block?.spacing)
  const color = (stegaClean(block?.color) || 'orange') as keyof typeof COLORS

  return (
    <section
      style={{ clipPath: CURVE_CLIP }}
      className={`${className} ${CURVE_VARS} w-full h-(--curve-r) translate-y-[1px] ${COLORS[color] ?? COLORS.orange} ${spacingClasses}`}
    />
  )
}
