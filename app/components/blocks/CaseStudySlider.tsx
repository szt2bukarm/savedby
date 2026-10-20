"use client"
import { getSpacingClasses } from '@/app/utils/spacing'
import type { CaseStudySliderBlockProps } from '@/types/sanity'
import { PortableText, PortableTextComponents } from 'next-sanity'
import SanityImage from '../common/SanityImage'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/all'
import GradientRevealText from '../common/GradientRevealText'
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-webgl2'
import { RIVE_GATED, useRiveResize, useRiveRenderGate } from '@/app/utils/useRiveResize'
import { useRivFile } from '@/app/utils/riveAssets';

gsap.registerPlugin(useGSAP, ScrollTrigger)

const headingComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <h2 className="text-mobile-p1 sm:text-tablet-h4 lg:text-desktop-h4 text-background font-riforma-regular tracking-[-4%] leading-[85%]">
        {children}
      </h2>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-riforma-bold">{children}</strong>
    ),
  },
}

const Arrow = ({className} : {className:string}) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 54" fill="none">
      <path d="M38.8672 51.1191L62.7301 26.7139L38.8672 2.3086" stroke="black" strokeWidth="6.60322" strokeMiterlimit="10"/>
      <path d="M61.3164 26.5925L0.000813127 26.5925" stroke="black" strokeWidth="6.60322"/>
    </svg>
  )
}

export default function CaseStudySlider({ block }: CaseStudySliderBlockProps) {
  const spacingClasses = getSpacingClasses(block?.spacing);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const riveFile = useRivFile();
  const { rive, canvas, container, RiveComponent } = useRive(riveFile ? {
    riveFile,
    artboard: 'Spinning Globe',
    stateMachines: 'State Machine 1',
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  } : undefined, RIVE_GATED);
  useRiveResize(rive, canvas, container);
  useRiveRenderGate(rive, canvas);

  useGSAP(() => {
    const cards = gsap.utils.toArray<HTMLElement>('[data-gsap="case-card"]', wrapperRef.current);
    if (!wrapperRef.current || !cards.length) return;
    gsap.set(cards, { x: 150,opacity: 0 });
    gsap.to(cards, {
      x: 0,
      opacity: 1,
      duration: 0.75,
      ease: "power2.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: "top 45%",
        toggleActions: "play none none none",
        invalidateOnRefresh: true,
      },
    });

    gsap.set("[data-gsap='case-heading']", {
      "--gradient-size": "0%",
      "--gradient-position": "-17% -17%",
      "--gradient-color" : "#0095EC",
    })
    gsap.to("[data-gsap='case-heading']", {
      "--gradient-size": "120%",
      "--gradient-color": "#FDF6E2",
      duration: 0.75,
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: "0% 50%",
      }
    })
  }, { scope: wrapperRef, dependencies: [block?.caseStudies] });



  return (
    <section ref={wrapperRef} className={`relative w-full ${spacingClasses} px-[20px] sm:px-[40px] lg:px-[60px] xl:px-[110px] bg-background`}>
      <div data-navcolorlistener='true' className='absolute top-0 left-0 right-0 w-full h-[50%] bg-brand-orange z-0' />


      {block?.heading && (
        <div className='flex justify-between flex-col-reverse sm:flex-row  gap-[20px]'>
          <div className="relative w-[70%] sm:w-[550px] lg:w-[710px] mb-[40px] sm:mb-[60px] lg:mb-[70px] z-10">
          <GradientRevealText dataGsap='case-heading' value={block.heading} components={headingComponents} />
        </div>
          <RiveComponent className="w-[70px] h-[70px] sm:w-[100px] sm:h-[100px] shrink-0 z-10" />

        </div>
      )}
      <div className="relative w-full z-10 group">
        <Swiper
          spaceBetween={10}
          slidesPerView="auto"
          className="w-full !overflow-visible cursor-grab"
        >
          {block?.caseStudies?.map((item, i) => (
            <SwiperSlide key={item._key} className="!w-auto">
              <div data-gsap="case-card" className='group/card w-[240px] sm:w-[320px] lg:w-[450px] flex flex-col bg-darkbg rounded-[10px] overflow-hidden transition-[filter,scale] duration-300 group-hover:brightness-85 hover:!brightness-100 hover:scale-[0.98]! cursor-pointer active:cursor-grabbing'>
                <SanityImage 
                  image={item.image} 
                  alt={item.image?.alt || item.companyName || ''} 
                  className="w-full h-[180px] sm:h-[240px] lg:h-[340px] object-cover" 
                  sizes="(max-width: 768px) 100vw, 50vw" 
                />
                <div className='py-[20px] sm:py-[30px] px-[14px] sm:px-[20px] flex flex-col justify-between h-[170px] sm:h-[225px] lg:h-[325px]'>
                  <div className='flex flex-col gap-[10px] sm:gap-[20px]'>
                    <p className='text-mobile-h2 sm:text-tablet-h3 lg:text-desktop-h2 text-black tracking-[-4%] leading-[85%] font-riforma-bold'>{item.companyName}</p>
                    <p className='text-mobile-subtitle sm:text-desktop-p1 text-black tracking-[-2%] leading-[100%] whitespace-pre-line font-riforma-regular'>
                      {typeof item.textUnder === 'string' 
                        ? item.textUnder 
                        : Array.isArray(item.textUnder) 
                          ? (item.textUnder as any[]).map((b: any) => b.children?.map((c: any) => c.text).join('')).join('\n') 
                          : ''}
                    </p>
                  </div>
                  <div className='ml-auto relative  min-h-[40px] w-[40px] lg:w-[60px] lg:min-h-[50px] overflow-hidden'>
                    <Arrow className='absolute bottom-0 right-0 w-[40px] lg:w-[60px] duration-300 group-hover/card:translate-x-full'/>
                    <Arrow className='absolute bottom-0 right-0 w-[40px] lg:w-[60px] duration-300 -translate-x-full group-hover/card:translate-x-0'/>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
