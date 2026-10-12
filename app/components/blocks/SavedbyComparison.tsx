'use client'

import { useRef } from 'react'
import { getSpacingClasses } from '@/app/utils/spacing'
import type { SavedbyComparisonBlockProps } from '@/types/sanity'
import SectionHeading from '../common/SectionHeading'
import MatterBoxes from './MatterBoxes'
import { CURVE_CLIP, CURVE_VARS } from '@/app/utils/curve'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const Star = ({dataGsap,fill}:{dataGsap:string,fill:string}) => (
  <svg data-gsap={dataGsap} className='opacity-0' xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 27 26" fill="none">
    <path d="M12.5651 0.484389C12.9537 -0.161431 13.89 -0.16143 14.2787 0.48439L18.1408 6.90194C18.2804 7.13395 18.5082 7.29942 18.772 7.36051L26.0689 9.0505C26.8032 9.22056 27.0926 10.111 26.5985 10.6802L21.6885 16.3365C21.511 16.541 21.424 16.8087 21.4474 17.0785L22.095 24.5405C22.1602 25.2914 21.4027 25.8418 20.7086 25.5477L13.812 22.6259C13.5626 22.5203 13.2811 22.5203 13.0318 22.6259L6.13511 25.5477C5.44107 25.8418 4.6836 25.2914 4.74877 24.5405L5.39637 17.0785C5.41978 16.8087 5.33279 16.541 5.15528 16.3365L0.245297 10.6802C-0.248811 10.111 0.0405206 9.22056 0.774835 9.05049L8.07175 7.36051C8.33555 7.29942 8.5633 7.13395 8.70293 6.90194L12.5651 0.484389Z" fill={fill} />
  </svg>
)

const Price = ({className}:{className:string}) => {
  return (
    <svg data-physics='svg' className={className} viewBox="0 0 865 670" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M260.399 66.2158C285.695 69.6878 307.52 75.8884 325.872 84.8164C344.72 93.2484 360.096 103.665 372 116.064C384.4 128.464 393.824 142.353 400.271 157.729C407.215 172.608 411.432 188.233 412.92 204.601H296.855C295.367 197.161 292.888 190.216 289.416 183.769C286.44 176.825 281.975 170.872 276.023 165.912C270.072 160.456 262.136 156.241 252.216 153.265C242.792 150.289 230.64 148.8 215.76 148.8C198.896 148.8 184.76 150.536 173.352 154.008C161.944 157.48 152.767 161.944 145.823 167.4C138.879 172.856 133.919 179.304 130.943 186.744C127.967 193.688 126.479 200.88 126.479 208.32C126.48 216.752 127.967 224.688 130.943 232.128C134.415 239.568 140.616 246.264 149.544 252.216C158.472 258.168 170.624 263.376 186 267.84C201.376 272.304 221.216 276.024 245.52 279C309.008 286.44 355.88 304.048 386.136 331.824C416.392 359.6 431.52 397.792 431.52 446.4C431.52 465.744 428.296 484.096 421.848 501.456C415.4 518.816 405.232 534.688 391.344 549.072C377.456 562.96 359.599 574.864 337.775 584.784C316.447 594.208 290.655 600.656 260.399 604.128V669.601H171.12V603.384C141.856 600.408 116.808 594.208 95.9756 584.784C75.1437 575.36 57.7835 563.953 43.8955 550.561C30.5035 536.673 20.0875 521.544 12.6475 505.176C5.70357 488.312 1.48799 471.2 0 453.84H116.063C119.535 475.664 128.464 492.28 142.848 503.688C157.728 515.096 182.032 520.8 215.76 520.8C234.112 520.8 249.736 519.064 262.632 515.592C275.528 512.12 285.944 507.408 293.88 501.456C301.816 495.504 307.519 488.56 310.991 480.624C314.463 472.192 316.199 463.264 316.199 453.84C316.199 440.944 313.72 430.528 308.76 422.592C303.8 414.656 296.359 408.208 286.439 403.248C276.52 398.288 264.367 394.568 249.983 392.088C235.6 389.112 219.232 386.136 200.88 383.16C175.584 379.688 151.528 373.984 128.712 366.048C105.896 358.112 85.8073 347.449 68.4473 334.057C51.0873 320.665 37.1992 304.048 26.7832 284.208C16.3673 263.872 11.1602 239.816 11.1602 212.04C11.1602 194.68 14.3841 178.064 20.832 162.192C27.28 145.824 36.9517 131.192 49.8477 118.296C62.7436 104.904 79.1122 93.7444 98.9521 84.8164C119.288 75.3925 143.344 68.9446 171.12 65.4727V0H260.399V66.2158ZM652.227 63.2402C681.986 63.2403 709.762 68.2003 735.554 78.1201C761.346 88.0401 783.666 103.912 802.514 125.736C821.858 147.064 836.986 175.089 847.898 209.809C858.81 244.032 864.267 285.696 864.267 334.8C864.267 383.904 858.81 425.816 847.898 460.536C836.986 494.76 821.858 522.784 802.514 544.608C783.666 565.936 761.346 581.561 735.554 591.48C709.762 601.4 681.986 606.36 652.227 606.36C622.467 606.36 594.69 601.4 568.898 591.48C543.107 581.56 520.538 565.936 501.194 544.608C482.346 522.784 467.466 494.76 456.554 460.536C445.642 425.816 440.187 383.904 440.187 334.8C440.187 285.696 445.642 244.032 456.554 209.809C467.466 175.089 482.346 147.064 501.194 125.736C520.538 103.912 543.106 88.0401 568.898 78.1201C594.69 68.2002 622.467 63.2402 652.227 63.2402ZM652.227 163.68C638.339 163.68 625.69 166.656 614.282 172.608C602.874 178.56 592.954 188.232 584.522 201.624C576.586 215.016 570.386 232.624 565.922 254.448C561.458 276.272 559.227 303.056 559.227 334.8C559.227 366.544 561.458 393.328 565.922 415.152C570.386 436.976 576.586 454.585 584.522 467.977C592.954 481.368 602.874 491.04 614.282 496.992C625.69 502.944 638.339 505.92 652.227 505.92C666.114 505.92 678.762 502.944 690.17 496.992C701.578 491.04 711.251 481.368 719.187 467.977C727.619 454.585 734.066 436.976 738.53 415.152C742.994 393.328 745.227 366.544 745.227 334.8C745.227 303.056 742.994 276.272 738.53 254.448C734.066 232.624 727.618 215.016 719.187 201.624C711.251 188.232 701.578 178.56 690.17 172.608C678.762 166.656 666.114 163.68 652.227 163.68Z" fill="#0095EC"/>
</svg>
  )
}

const SB = () => {
  return (
    <svg className='w-[70%] max-w-[163px] h-auto' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 163 113" fill="none">
  <path d="M91.1641 113.002V0H127.648C147.666 0 162.194 14.3674 162.194 33.9006C162.194 42.295 159.289 49.7209 152.67 55.371C159.934 61.5054 163.002 69.2541 163.002 78.2943C163.002 98.3118 148.15 113.002 127.648 113.002H91.1641ZM126.518 87.9801C132.652 87.9801 137.172 83.6215 137.172 77.81C137.172 71.9984 132.652 67.8012 126.518 67.8012H116.993V87.9801H126.518ZM126.518 43.5865C132.168 43.5865 136.365 39.5507 136.365 34.2235C136.365 28.8962 132.168 25.0219 126.518 25.0219H116.993V43.5865H126.518Z" fill="#FDF6E2"/>
  <path d="M0 113.002V87.9801H19.6948C29.2193 87.9801 36.1609 80.7157 36.1609 70.707V41.165C36.1609 15.8203 52.1428 0 78.1335 0H97.8283V25.0219H78.4563C68.1246 25.0219 61.9902 32.2863 61.9902 42.295V76.0342C61.9902 99.4418 46.0083 113.002 22.1163 113.002H0Z" fill="#FDF6E2"/>
</svg>
  )
}

const Questionmark = () => {
  return (
    <svg className='w-[70%] max-w-[85px] h-auto' viewBox="0 0 94 130" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M93.4141 36.9531C93.4141 42.0521 92.4401 46.8646 90.4922 51.3906C88.6016 55.8594 85.9661 59.7839 82.5859 63.1641C79.263 66.487 75.3385 69.1224 70.8125 71.0703C66.3438 73.0182 61.5599 73.9922 56.4609 73.9922C54.6849 73.9922 53.1094 74.3073 51.7344 74.9375C50.4167 75.5677 49.2995 76.4557 48.3828 77.6016C47.5234 78.6901 46.8646 79.9792 46.4062 81.4688C45.9479 82.9583 45.7188 84.5625 45.7188 86.2812V92.8125H21.1406V85.9375C21.1979 80.8958 22.0859 76.1406 23.8047 71.6719C25.5807 67.2031 28.0156 63.3359 31.1094 60.0703C34.2604 56.7474 37.9844 54.1406 42.2812 52.25C46.5781 50.3021 51.3047 49.3281 56.4609 49.3281C58.1797 49.3281 59.7839 49.013 61.2734 48.3828C62.763 47.7526 64.0521 46.8932 65.1406 45.8047C66.2865 44.6589 67.1745 43.3411 67.8047 41.8516C68.4922 40.3047 68.8359 38.6719 68.8359 36.9531C68.8359 35.2344 68.4922 33.6302 67.8047 32.1406C67.1745 30.651 66.2865 29.362 65.1406 28.2734C64.0521 27.1276 62.763 26.2396 61.2734 25.6094C59.7839 24.9792 58.1797 24.6641 56.4609 24.6641H0V0H56.4609C61.5599 0 66.3438 0.973958 70.8125 2.92188C75.3385 4.86979 79.263 7.53385 82.5859 10.9141C85.9661 14.237 88.6016 18.1328 90.4922 22.6016C92.4401 27.0703 93.4141 31.8542 93.4141 36.9531ZM48.2109 114.469C48.2109 116.531 47.8099 118.479 47.0078 120.312C46.263 122.089 45.2318 123.635 43.9141 124.953C42.5964 126.271 41.0495 127.302 39.2734 128.047C37.4974 128.849 35.6068 129.25 33.6016 129.25C31.5964 129.25 29.6771 128.849 27.8438 128.047C26.0677 127.302 24.4922 126.271 23.1172 124.953C21.7995 123.635 20.7396 122.089 19.9375 120.312C19.1927 118.479 18.8203 116.531 18.8203 114.469C18.8203 112.464 19.1927 110.573 19.9375 108.797C20.7396 107.021 21.7995 105.474 23.1172 104.156C24.4922 102.839 26.0677 101.807 27.8438 101.062C29.6771 100.26 31.5964 99.8594 33.6016 99.8594C35.6068 99.8594 37.4974 100.26 39.2734 101.062C41.0495 101.807 42.5964 102.839 43.9141 104.156C45.2318 105.474 46.263 107.021 47.0078 108.797C47.8099 110.573 48.2109 112.464 48.2109 114.469Z" fill="#ECECEC"/>
</svg>

  )
}

const CARD_HEIGHT = 400       // px, matches the card height
const SPREAD_HOLD = 60        // px of scroll the cards stay stuck before sliding apart
const SPREAD_DISTANCE = 500   // px of scroll the cards keep sliding apart, until they're out of the window

export default function SavedbyComparison({ block, nextBlockType }: SavedbyComparisonBlockProps) {
  const hasCurve = nextBlockType === 'caseStudySliderBlock'
  const spacingClasses = getSpacingClasses(block?.spacing)

  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null) 
  const stickyRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const priceRef = useRef<HTMLParagraphElement>(null) 
  const savedbyRef = useRef<HTMLDivElement>(null)
  const savedbyListRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    let mm = gsap.matchMedia();

    mm.add({
      wide: "(min-width: 1440px)",
      mid: "(min-width: 1140px) and (max-width: 1439px)",
      narrow: "(min-width: 768px) and (max-width: 1139px)",
      mobile: "(max-width: 767px)"
    }, (context) => {
      const targetWidth = context.conditions?.mid ? 175 : 235;
      const panelSize = context.conditions?.mobile ? { height: 180 } : { width: targetWidth };

      const savedbyTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top+200 30%",
        }
      });

      savedbyTl.to('[data-gsap="savedby-comp"]', {
        ...panelSize,
        duration: 1.2,
        ease: "power2.inOut",
      })
      .to('[data-gsap="savedby-comp-title"]', {
        opacity: 1,
        duration: 0.2
      }, "-=0.5")
      .fromTo('[data-gsap="savedby-comp-star"]', {
        scale: 0.8,
        opacity: 0
      }, {
        scale: 1,
        opacity: 1,
        stagger: 0.1,
        ease: "back.inOut(1.5)"
      }, "-=0.3")
      .to('[data-gsap="savedby-comp-offer"]', {
        opacity: 1,
        stagger: 0.1,
        delay: 0.1
      }, "<");

      const compTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top+200 30%",
        }
      });

      compTl.to('[data-gsap="comp-comp"]', {
        ...panelSize,
        duration: 1.2,
        ease: "power2.inOut",
      })
      .to('[data-gsap="comp-comp-title"]', {
        opacity: 1,
        duration: 0.2
      }, "-=0.5")
      .fromTo('[data-gsap="comp-comp-star"]', {
        scale: 0.8,
        opacity: 0
      }, {
        scale: 1,
        opacity: 1,
        stagger: 0.1,
        ease: "back.inOut(1.5)"
      }, "-=0.3")
      .to('[data-gsap="comp-comp-offer"]', {
        opacity: 1,
        stagger: 0.1,
        delay: 0.1
      }, "<");
    });

    // Row layout only: cards stick in the middle of the screen and slide apart, opening a gap for the boxes
    mm.add("(min-width: 1140px)", () => {
      const spreadTl = gsap.timeline({
        scrollTrigger: {
          trigger: stickyRef.current,
          start: () => `top top+=${window.innerHeight / 2 - CARD_HEIGHT / 2 - SPREAD_HOLD}`,
          end: `+=${SPREAD_DISTANCE}`,
          scrub: true,
          invalidateOnRefresh: true,
        }
      });

      spreadTl.to('[data-gsap="card-savedby"]', { x: () => -window.innerWidth / 2, ease: "power2.in" })
      .to('[data-gsap="card-comp"]', { x: () => window.innerWidth / 2, ease: "power2.in" }, "<");
    });

  }, [sectionRef])

  return (
    <section data-navcolorlistener="true" ref={sectionRef} className={`relative w-full h-full overflow-clip ${spacingClasses} bg-darkbg`}>
      <div className='w-full h-full px-[20px] sm:px-[40px] lg:px-[60px] xl:px-[110px]'>

        <div className='flex flex-col lg:flex-row gap-0 lg:gap-[20px] items-center lg:justify-between lg:items-start mb-[50px] sm:mb-[75px]'>
          <SectionHeading centered={false} className='mb-[20px]! sm:mb-[30px]! lg:mb-0! text-center lg:text-left w-full!'>{block?.heading}</SectionHeading>
          <p className='text-mobile-p2 sm:text-desktop-h5 text-black font-riforma-regular tracking-[-3%] leading-[100%] text-right'>{block?.subtitle}</p>
        </div>

        <div ref={stickyRef} className='relative min-[1140px]:h-[950px]'>
        {/* Marks the point (spread finished) where the boxes start dropping from the top of the window */}
        <div ref={dropRef} aria-hidden className='hidden min-[1140px]:block pointer-events-none absolute left-0 top-[460px] bottom-0 w-px' />
        <div ref={cardsRef} className='flex flex-col lg:flex-row gap-[20px] min-[1140px]:sticky min-[1140px]:top-[calc(50vh-200px)]'>
          <div data-gsap='card-savedby' className='relative w-full h-[400px] max-md:h-auto bg-background rounded-[10px] overflow-hidden'>
            <div data-gsap='savedbycomp-list' className='absolute left-[235px] min-[1140px]:left-[175px] min-[1440px]:left-[235px] right-0 top-0 bottom-0 flex flex-col justify-between px-[20px] py-[30px] max-md:relative max-md:inset-auto max-md:mt-[180px] max-md:gap-[40px]'>
              <p data-gsap='savedby-comp-title' className='text-mobile-h2 sm:text-desktop-h4 text-[#110F0B] tracking-[-3%] leading-[85%] opacity-0'>SavedBy offers</p>
              <div className='flex flex-col'>
                {block?.savedbyOffers?.map((offer, i) => (
                  <div key={i} className='flex gap-[10px] items-center'>
                    <Star dataGsap={`savedby-comp-star`} fill='#FD4015'/>
                    <p data-gsap='savedby-comp-offer' className='text-mobile-p2 sm:text-desktop-p1 font-riforma-regular text-black leading-[100%] tracking-[-2%] opacity-0'>{offer}</p>
                  </div>
                ))}
              </div>
            </div>
            <div data-gsap='savedby-comp' className='absolute left-0 top-0 bottom-0 w-[100%] max-md:bottom-auto max-md:h-full flex items-center justify-center bg-brand-blue z-10'>
              <SB />
            </div>
          </div>

          <div data-gsap='card-comp' className='relative w-full h-[400px] max-md:h-auto bg-background rounded-[10px] overflow-hidden'>
            <div data-gsap='comp-comp-list' className='absolute left-[235px] w-[calc(100%-235px)] min-[1140px]:w-[calc(100%-175px)] min-[1440px]:w-[calc(100%-235px)] lg:left-0 top-0 bottom-0 flex flex-col justify-between px-[20px] py-[30px] max-md:relative max-md:inset-auto max-md:w-full max-md:mt-[180px] max-md:gap-[40px]'>
              <p data-gsap='comp-comp-title' className='text-mobile-h2 sm:text-desktop-h4 text-[#110F0B] tracking-[-3%] leading-[85%] opacity-0'>Others offer</p>
              <div className='flex flex-col'>
                {block?.competitionOffers?.map((offer, i) => (
                  <div key={i} className='flex gap-[10px] items-center'>
                    <Star dataGsap='comp-comp-star' fill='#000000'/>
                    <p data-gsap='comp-comp-offer' className='text-mobile-p2 sm:text-desktop-p1 font-riforma-regular text-black leading-[100%] tracking-[-2%] opacity-0'>{offer}</p>
                  </div>
                ))}
              </div>
            </div>
            <div data-gsap='comp-comp' className='absolute left-0 lg:left-auto lg:right-0 top-0 bottom-0 w-[100%] max-md:bottom-auto max-md:h-full flex items-center justify-center bg-[#2C2C2C] z-10'>
              <Questionmark />
            </div>
          </div>
        </div>
        </div>

        <div className='flex justify-between items-center mt-[250px] min-[1140px]:mt-[-5px] flex-col lg:flex-row'>
          <div className='flex flex-col gap-[25px] w-[350px] text-center lg:text-left'>
            <p data-physics='text' className='text-mobile-h2 sm:text-desktop-h5 text-black font-riforma-regular leading-[100%] tracking-[-3%]'>SavedBy Offers</p>
            <p data-physics='text' className='text-mobile-h2 sm:text-desktop-h5 text-black font-riforma-bold leading-[85%] tracking-[-3%]'>{block?.pricingText}</p>
          </div>

          <div className='relative w-[90vw] md:w-[50vw] mt-[50px] lg:mt-0'>
            <Price className='w-full h-auto block' />
          </div>

        </div>
      </div>

      {hasCurve && (
        <div
          data-physics='curve'
          aria-hidden
          style={{ clipPath: CURVE_CLIP }}
          className={`${CURVE_VARS} pointer-events-none absolute bottom-0 left-0 w-full h-(--curve-r) translate-y-[1px] bg-brand-orange z-10`}
        />
      )}

      <MatterBoxes sectionRef={sectionRef} cardsRef={cardsRef} dropRef={dropRef} />
    </section>
  )
}
