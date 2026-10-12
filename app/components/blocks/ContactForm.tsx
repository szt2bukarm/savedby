"use client"
import { useRef, useState } from 'react'
import type { ContactFormBlockProps } from '@/types/sanity'
import { getSpacingClasses } from '@/app/utils/spacing'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { PortableText, PortableTextComponents } from 'next-sanity'
import Button from '../common/Button'
import { useGSAP } from '@gsap/react'
import GradientRevealText from '../common/GradientRevealText'
import gsap from 'gsap'

const headingComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <h2 className="text-mobile-h2 sm:text-tablet-h2 lg:text-desktop-h3 font-riforma-regular leading-[85%] tracking-[-4%]">
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

const bottomTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-mobile-h6 sm:text-desktop-h6 font-riforma-regular tracking-[-4%] leading-[85%] whitespace-pre-line">
        {children}
      </p>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-riforma-bold">{children}</strong>
    ),
    link: ({ children, value }) => {
      return (
        <a href={value?.href} className="underline underline-offset-2 hover:opacity-50 transition-opacity">
          {children}
        </a>
      )
    },
  },
}

const Box = ({className} : {className:string}) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" fill="none">
    <path d="M30.8431 51.8037L22.293 65.455L29.465 68.6832" stroke="black" strokeWidth="2.99978" strokeLinejoin="bevel"/>
  <path d="M42.0404 74.3375C46.0604 76.1419 49.319 73.6903 49.319 68.8632C49.319 64.0362 46.0604 58.6533 42.0404 56.8413C38.0204 55.0292 34.7617 57.4884 34.7617 62.3155C34.7617 67.1426 38.0204 72.5254 42.0404 74.3375Z" stroke="black" strokeWidth="2.99978" strokeLinejoin="round"/>
  <path d="M43.9174 72.9285C46.902 74.2685 49.3231 72.4488 49.3231 68.8628C49.3231 65.2767 46.902 61.2796 43.9174 59.9396C40.9329 58.5996 38.5117 60.4192 38.5117 64.0053C38.5117 67.5913 40.9329 71.5885 43.9174 72.9285Z" fill="black"/>
  <path d="M15.0307 59.9324C18.0153 61.2724 20.4364 59.4527 20.4364 55.8667C20.4364 52.2806 18.0153 48.2835 15.0307 46.9435C12.0461 45.6035 9.625 47.4231 9.625 51.0092C9.625 54.5952 12.0461 58.5924 15.0307 59.9324Z" fill="black"/>
  <path d="M13.1576 61.3422C17.1776 63.1466 20.4362 60.695 20.4362 55.868C20.4362 51.0333 17.1776 45.6581 13.1576 43.846C9.13755 42.0416 5.87891 44.4932 5.87891 49.3202C5.87891 54.1473 9.13755 59.5302 13.1576 61.3422Z" stroke="black" strokeWidth="2.99978" strokeLinejoin="round"/>
  <path d="M43.9134 82.2329C39.6954 84.0754 33.7492 83.55 27.5973 80.7863C21.4455 78.0225 15.4992 73.1954 11.2812 67.5537" stroke="black" strokeWidth="2.99978" strokeLinejoin="round"/>
  <path d="M53.828 48.6406L3.39514 25.9748L1.32422 25.0459" stroke="black" strokeWidth="2.64955"/>
  <path d="M53.8281 105.445V48.6396" stroke="black" strokeWidth="2.64955"/>
  <path d="M105.449 25.4443L53.8281 48.6432" stroke="black" strokeWidth="2.64955"/>
  <path d="M106.324 25.0469L53.828 1.45215L1.32422 25.0469V82.8117L53.828 106.406L106.324 82.8117V25.0469Z" stroke="black" strokeWidth="2.64955"/>
  <path d="M27.582 36.3906L80.0858 12.7959" stroke="black" strokeWidth="2.64955"/>
</svg>
  )
}

const Asterisk = ({className}:{className:string}) => {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" fill="none">
  <path d="M8.78812 0C8.73267 0.319249 8.68185 0.685446 8.63564 1.09859C8.59868 1.50235 8.56634 1.92958 8.53861 2.38028C8.51089 2.83099 8.48779 3.28638 8.46931 3.74648C8.46007 4.20657 8.45545 4.6385 8.45545 5.04225C8.54786 5.04225 8.70495 5.00939 8.92673 4.94366C9.14852 4.86854 9.40264 4.77465 9.68911 4.66197C9.97558 4.53991 10.2805 4.40845 10.604 4.26761C10.9274 4.12676 11.237 3.99061 11.5327 3.85915C11.8284 3.71831 12.0964 3.59155 12.3366 3.47887C12.5861 3.35681 12.7802 3.25822 12.9188 3.1831L14 6.61972C13.7043 6.66667 13.3624 6.723 12.9743 6.78873C12.5954 6.85446 12.1934 6.92958 11.7683 7.01408C11.3432 7.09859 10.9135 7.19249 10.4792 7.29577C10.0541 7.39906 9.65677 7.51174 9.28713 7.6338C9.86007 8.43192 10.4515 9.20657 11.0614 9.95775C11.6805 10.6995 12.2627 11.3333 12.8079 11.8592L9.89703 14C9.75842 13.7089 9.58284 13.3756 9.3703 13C9.167 12.615 8.93597 12.2113 8.67723 11.7887C8.42772 11.3662 8.15974 10.939 7.87327 10.507C7.5868 10.0751 7.30033 9.65258 7.01386 9.23944C6.37624 10.1784 5.82178 11.0469 5.3505 11.8451C4.88845 12.6338 4.49109 13.3521 4.15842 14L1.27525 11.8592C1.50627 11.6244 1.76502 11.3474 2.05149 11.0282C2.34719 10.6995 2.64752 10.3474 2.95248 9.97183C3.25743 9.58685 3.56238 9.19249 3.86733 8.78873C4.18152 8.38498 4.47261 7.99061 4.74059 7.60563C3.9736 7.3615 3.19274 7.1784 2.39802 7.05634C1.61254 6.92488 0.813201 6.78873 0 6.64789L1.13663 3.1831C1.40462 3.34272 1.71419 3.50704 2.06535 3.67606C2.42574 3.83568 2.8 4 3.18812 4.16901C3.57624 4.32864 3.9736 4.48357 4.3802 4.6338C4.79604 4.78404 5.1934 4.92019 5.57228 5.04225C5.57228 4.19718 5.54455 3.32864 5.48911 2.43662C5.4429 1.5446 5.3505 0.732394 5.21188 0H8.78812Z" fill="#FDF6E2"/>
</svg>
  )
}

const Form = () => {
  const [phone, setPhone] = useState<string | undefined>()

  return (
    <form className='flex flex-col gap-[17px]'>
      <div data-gsap='contact-form' className='flex flex-col'>
        <label htmlFor='name' className='flex'>
          <p className='text-mobile-subtitle sm:text-desktop-p2 text-black font-riforma-regular bg-background h-[19px] sm:h-[26px] px-[10px] flex items-center'>Your Name</p>
          <div className='min-w-[19px] h-[19px] sm:min-w-[26px] sm:min-h-[26px] bg-brand-orange relative flex items-center justify-center'>
            <Asterisk className="w-[9px] h-[9px] sm:w-[14px] sm:h-[14px]"/>
          </div>
        </label>
        <input name='name' required type="text" className='font-riforma-regular w-full py-[7px] sm:py-[15px] px-[10px] sm:px-[20px] xl:px-[24px] tracking-[-4%] text-mobile-p2 sm:text-desktop-h6 bg-background rounded-[0px_10px_10px_10px] outline-brand-orange' />
      </div>
      <div data-gsap='contact-form' className='flex flex-col'>
        <label htmlFor='companyname' className='flex'>
          <p className='text-mobile-subtitle sm:text-desktop-p2 text-black font-riforma-regular bg-background h-[19px] sm:h-[26px] px-[10px] flex items-center'>Company Name</p>
          <div className='min-w-[19px] h-[19px] sm:min-w-[26px] sm:min-h-[26px] bg-brand-orange relative flex items-center justify-center'>
            <Asterisk className="w-[9px] h-[9px] sm:w-[14px] sm:h-[14px]"/>
          </div>
        </label>
        <input name='companyname' required type="text" className='font-riforma-regular w-full py-[7px] sm:py-[15px] px-[10px] sm:px-[20px] xl:px-[24px] tracking-[-4%] text-mobile-p2 sm:text-desktop-h6 bg-background rounded-[0px_10px_10px_10px] outline-brand-orange' />
      </div>
      <div data-gsap='contact-form' className='flex flex-col'>
        <label htmlFor='email' className='flex'>
          <p className='text-mobile-subtitle sm:text-desktop-p2 text-black font-riforma-regular bg-background h-[19px] sm:h-[26px] px-[10px] flex items-center'>Work Email</p>
          <div className='min-w-[19px] h-[19px] sm:min-w-[26px] sm:min-h-[26px] bg-brand-orange relative flex items-center justify-center'>
            <Asterisk className="w-[9px] h-[9px] sm:w-[14px] sm:h-[14px]"/>
          </div>
        </label>
        <input name='workemail' required type="text" className='font-riforma-regular w-full py-[7px] sm:py-[15px] px-[10px] sm:px-[20px] xl:px-[24px] tracking-[-4%] text-mobile-p2 sm:text-desktop-h6 bg-background rounded-[0px_10px_10px_10px] outline-brand-orange' />
      </div>
      <div data-gsap='contact-form' className='flex flex-col'>
        <label htmlFor='phone' className='flex'>
          <p className='text-mobile-subtitle sm:text-desktop-p2 text-black font-riforma-regular bg-background h-[19px] sm:h-[26px] px-[10px] flex items-center'>Phone Number</p>
          <div className='min-w-[19px] h-[19px] sm:min-w-[26px] sm:min-h-[26px] bg-brand-orange relative flex items-center justify-center'>
            <Asterisk className="w-[9px] h-[9px] sm:w-[14px] sm:h-[14px]"/>
          </div>
        </label>
        <PhoneInput
          placeholder="Enter phone number"
          value={phone}
          onChange={setPhone}
          defaultCountry="US"
          international
          withCountryCallingCode
          limitMaxLength
          className="custom-phone-input font-riforma-regular w-full py-[7px] sm:py-[15px] px-[10px] sm:px-[20px] xl:px-[24px] tracking-[-4%] text-mobile-p2 sm:text-desktop-h6 bg-background rounded-[0px_10px_10px_10px] outline-brand-orange"
        />
      </div>
      <div data-gsap='contact-form' className='flex flex-col'>
        <label htmlFor='hearaboutus' className='flex'>
          <p className='text-mobile-subtitle sm:text-desktop-p2 text-black font-riforma-regular bg-background h-[19px] sm:h-[26px] px-[10px] flex items-center'>Where did you hear about us?</p>
          <div className='min-w-[19px] h-[19px] sm:min-w-[26px] sm:min-h-[26px] bg-brand-orange relative flex items-center justify-center'>
            <Asterisk className="w-[9px] h-[9px] sm:w-[14px] sm:h-[14px]"/>
          </div>
        </label>
        <input name='hearaboutus' required type="text" className='font-riforma-regular w-full py-[7px] sm:py-[15px] px-[10px] sm:px-[20px] xl:px-[24px] tracking-[-4%] text-mobile-p2 sm:text-desktop-h6 bg-background rounded-[0px_10px_10px_10px] outline-brand-orange' />
      </div>

      <Button dataGsap='contact-form' href='/' className='w-full py-[12px] sm:py-[17px] text-mobile-p2 sm:text-desktop-h6 mt-[25px]' text='Continue'/>
      <p data-gsap='contact-form' className='font-riforma-regular mx-auto mt-[5px] sm:mt-[25px] text-desktop-subtitle text-black leading-[110%] tracking-[1%] text-center w-[90%] sm:w-[80%]'>By submitting this form, you agree to receive promotional messages from SavedBy and agree to the Privacy Policy.</p>
    </form>
  )
}

export default function ContactForm({ block }: ContactFormBlockProps) {
  const spacingClasses = getSpacingClasses(block?.spacing);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.set("[data-gsap='contact-form-heading']", {
      "--gradient-size": "0%",
      "--gradient-position": "-15% -15%",
      "--gradient-color" : "#FD4015",
    })
    gsap.to("[data-gsap='contact-form-heading']", {
      "--gradient-size": "120%",
      "--gradient-color": "#110F0B",
      duration: 0.5,
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: "10% 50%",
        invalidateOnRefresh: true,
      }
    })

    gsap.set("[data-gsap='contact-form-bottom-text']", {
      "--gradient-size": "0%",
      "--gradient-position": "-15% -15%",
      "--gradient-color" : "#FD4015",
    })
    gsap.to("[data-gsap='contact-form-bottom-text']", {
      "--gradient-size": "120%",
      "--gradient-color": "#110F0B",
      delay: 0.1,
      duration: 0.5,
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: "10% 50%",
        invalidateOnRefresh: true,
      }
    })

    gsap.set("[data-gsap='contact-form']", {
      opacity: 0,
      y: 100,
    })
    gsap.to("[data-gsap='contact-form']", {
      opacity: 1,
      y: 0,
      stagger: 0.1,
      duration: 0.75,
      ease: "power4.out",
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: "10% 50%",
        invalidateOnRefresh: true,
      }
    })
  }, [])

  return (
    <section ref={wrapperRef} data-navcolorlistener='true' className={`w-full ${spacingClasses} bg-darkbg`}>
      <div className="px-[20px] sm:px-[40px] lg:px-[60px] xl:px-[110px]">
        {block?.variant === 'minimal' && (
          <div className="flex flex-col lg:flex-row gap-[60px] sm:gap-[80px] lg:gap-[100px]">
            {/* Left side content */}
            <div className="flex-1 flex flex-col justify-between">
              {/* Box Icon placeholder */}
              <Box className='mb-[30px] sm:mb-[50px] lg:mb-0 w-[50px] sm:w-[70px] lg:w-[100px]'/>
              
              {block?.centerText && (
                <div className='w-[240px] sm:w-[550px] mb-[40px] sm:mb-[100px]'>
                <GradientRevealText dataGsap='contact-form-heading' value={block.centerText} components={headingComponents} />
                </div>
              )}
              
              {block?.bottomText && (
                <GradientRevealText dataGsap='contact-form-bottom-text' value={block.bottomText} components={bottomTextComponents} />
              )}
            </div>
            
            {/* Right side form */}
            <div className="flex-1">
              <Form />
            </div>
          </div>
        )}

        {block?.variant === 'complex' && (
          <div>
          </div>
        )}
      </div>
    </section>
  )
}
