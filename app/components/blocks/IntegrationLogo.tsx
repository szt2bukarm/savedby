import type { IntegrationLogoBlockProps } from '@/types/sanity'
import { getSpacingClasses } from '@/app/utils/spacing'
import SavedbyComparison from './SavedbyComparison'
import SavedByLogo from '../common/SavedByLogo'
import SanityImage from '../common/SanityImage'
import Button from '../common/Button'

export default function IntegrationLogo({ block }: IntegrationLogoBlockProps) {
  const spacingClasses = getSpacingClasses(block?.spacing)
  const buttonText = block?.button?.text
  const buttonHref = block?.button?.href

  return <div className={`w-full ${spacingClasses} flex gap-[80px] items-center justify-center`}>

    <div className='flex items-center gap-[30px]'>
      <SavedByLogo color="#110F0B" className="w-[165px]" />
      <p className='font-riforma-bold text-desktop-p2 text-black'>X</p>
      <SanityImage image={block?.logo} className="w-[165px]" />
    </div>

    <div className='flex flex-col'>
      <p className='font-riforma-bold text-desktop-p1 text-black tracking-[-4%] leading-[100%] mb-[15px]'>{block?.text}</p>
      <p className='font-riforma-regular text-desktop-p1 text-black tracking-[-4%] leading-[120%] w-[530px] mb-[30px]'>{block?.subtext}</p>
      {buttonText && buttonHref && (
        <Button className='px-[25px] py-[15px]' text={buttonText} href={buttonHref} />
      )}
    </div>

  </div>
}
