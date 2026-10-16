import type { TextHeroBlockProps } from '@/types/sanity'
import Curve from './Curve'
import NavColorChangeTrigger from './NavColorChangeTrigger'
import { getSpacingClasses } from '@/app/utils/spacing'

export default function TextHero({ block }: TextHeroBlockProps) {
  const spacingClasses = getSpacingClasses(block?.spacing)

  return (
    <div className={`w-full ${spacingClasses}`}>

      <div className={`relative w-full h-[120px] z-0 ${block?.curveColor == 'orange' ? 'bg-brand-orange' : block?.curveColor == 'brown' ? 'bg-brand-brown' : 'bg-brand-blue'}`}></div>
      
      <NavColorChangeTrigger block={{
        _key: 'text-hero-nav-color-change-trigger',
        _type: 'navColorChangeTriggerBlock',
        from: "light",
        to: "dark"
      }} />
      
      <Curve className="scale-y-[-1] -mt-[1px]" 
      block={{
        _type: 'curveBlock',
        _key: 'text-hero-curve',
        color: block?.curveColor,
      }} />


      <div className='flex flex-col justify-center items-center mt-[-20px]'>
        {block?.smallText && <p className='font-riforma-bold text-desktop-p2 tracking-[-3%] leading-[110%] mb-[20px]'>{block?.smallText}</p>}
        {block?.heading && <p className='whitespace-pre-line text-center text-brand-orange text-desktop-h1 tracking-[-6%] leading-[85%] font-riforma-bold mb-[50px]'>{block?.heading}</p>}
        {block?.subtext && <p className='whitespace-pre-line text-center text-black text-desktop-h5 tracking-[-4%] leading-[100%] font-riforma-regular w-[710px] '>{block?.subtext}</p>}
      </div>
    </div>
  )
}
