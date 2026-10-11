import type { LogoCarouselBlockProps } from '@/types/sanity'
import SectionHeading from '../common/SectionHeading'
import { getSpacingClasses } from '@/app/utils/spacing'
import LogoMarquee from '../common/LogoMarquee'

export default function LogoCarousel({ block }: LogoCarouselBlockProps) {
  const spacingClasses = getSpacingClasses(block?.spacing);

  return (
    <section className={`w-full h-full flex flex-col gap-[100px] ${spacingClasses}`}>
    <SectionHeading className='mb-0!'>{block?.title}</SectionHeading>
      <div className='w-full'>
        <LogoMarquee direction='left' logoSize='h-[40px] sm:h-[60px] lg:h-[70px]' logos={block?.logos} />
      </div>
      
    </section>
  )
}
