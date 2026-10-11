import type { CtaBlockProps } from '@/types/sanity'
import Button from '../common/Button'
import { getSpacingClasses } from '@/app/utils/spacing'

export default function Cta({ block }: CtaBlockProps) {
  const spacingClasses = getSpacingClasses(block?.spacing);
  const isVertical = block?.orientation == "vertical";
  const textWidthClasses = block?.textWidth == "wider"
    ? "w-[90%] max-w-[520px] sm:max-w-[850px]"
    : "w-[70%] max-w-[400px] sm:max-w-[550px]";

  return (
    <section className={`w-full flex flex-col justify-center items-center text-center gap-[40px] sm:gap-[75px] ${isVertical ? "" : "lg:flex-row lg:justify-between lg:items-stretch lg:text-left lg:gap-0 lg:px-[60px] xl:px-[110px]"} ${spacingClasses}`}>
      {block?.text && (
      <p className={`text-mobile-p2 sm:text-tablet-h5 lg:text-desktop-h5 text-black ${textWidthClasses} ${isVertical ? "" : "lg:w-[50%] lg:max-w-none"} font-riforma-regular tracking-[-4%] leading-[110%] lg:leading-[100%]`}>{block?.text}</p>
      )}
      {block?.button?.text && block?.button?.href && 
        <Button href={block?.button?.href} text={block?.button?.text} className='px-[60px] sm:px-[105px] py-[17px] sm:py-[25px] text-mobile-p1 sm:text-desktop-h6' />
      }
    </section>
  )
}
