"use client"
import { getSpacingClasses } from '@/app/utils/spacing'
import type { RatingCardsBlockProps } from '@/types/sanity'
import SectionHeading from '../common/SectionHeading';
import ElevatedSwiper from '../common/ElevatedSwiper';

const Star = ({ className }: { className: string }) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 46" fill="none">
  <path d="M23.027 0.484391C23.4156 -0.161429 24.3519 -0.16143 24.7406 0.484391L32.2235 12.9184C32.3631 13.1504 32.5909 13.3159 32.8547 13.377L46.9924 16.6513C47.7268 16.8214 48.0161 17.7118 47.522 18.2811L38.0089 29.24C37.8314 29.4445 37.7444 29.7123 37.7678 29.982L39.0225 44.4397C39.0877 45.1906 38.3302 45.7409 37.6362 45.4469L24.2739 39.7859C24.0245 39.6803 23.743 39.6803 23.4937 39.7859L10.1314 45.4469C9.43735 45.7409 8.67987 45.1906 8.74504 44.4397L9.99978 29.982C10.0232 29.7122 9.9362 29.4445 9.75869 29.24L0.245591 18.2811C-0.248517 17.7118 0.0408145 16.8214 0.775128 16.6513L14.9129 13.377C15.1767 13.3159 15.4045 13.1504 15.5441 12.9184L23.027 0.484391Z" fill="#FD4015"/>
</svg>
  )
}

export default function RatingCards({ block }: RatingCardsBlockProps) {
  const spacingClasses = getSpacingClasses(block?.spacing);
  const cards = block?.ratings ?? []

  return (
    <section className={`w-full ${spacingClasses} overflow-x-clip`}>
      <SectionHeading>{block?.heading}</SectionHeading>

            <ElevatedSwiper initialSlide={cards.length > 1 ? 1 : 0} autoplay autoplayDelay={10000} introFade introSpin={cards.length}>
              {cards.map((card, i) => (
                <div key={card._key || i} style={{ width: 'auto', height: 'auto' }}>
                  <div className="card-inner w-[250px] h-[250px] sm:w-[325px] lg:w-[450px] sm:h-[325px] flex flex-col justify-between px-[15px] py-[20px] sm:px-[20px] sm:py-[30px] bg-darkbg rounded-[10px]">
                    <div className='flex items-center gap-[5px]'>
                      <p className='text-[44px] sm:text-[78px] font-riforma-regular text-black tracking-[-4%] leading-[85%]'>5/5</p>
                      <Star className='w-[24px] sm:w-[48px] h-[24px] sm:h-[48px]'/>
                    </div>
                    <div className='flex flex-col gap-[25px] text-mobile-p2 sm:text-desktop-p1'>
                      <p className='text-black tracking-[-4%] leading-[120%] font-riforma-regular'>{'"' + card.quote + '"'}</p>
                      <p className="text-black font-riforma-regular  leading-[85%] tracking-[-4%]">{"— " + card.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </ElevatedSwiper>
    </section>
  )
}
