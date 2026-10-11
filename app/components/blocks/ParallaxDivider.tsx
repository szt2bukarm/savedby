"use client"
import { useGSAP } from '@gsap/react'
import gsap from 'gsap';
import { useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function ParallaxDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const oRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
      gsap.fromTo(oRef.current,{height:450},{height:0,
        ease: "none",
        scrollTrigger: {
        trigger: ref.current,
        start: "top 140%",
        end: "top 50%",
        markers: true,
        scrub: true,
      }
    })
    gsap.fromTo(bRef.current,{height:220},{height:0,
      scrollTrigger: {
        trigger: ref.current,
        start: "top 140%",
        end: "top 50%",
        scrub: true,
      }
    })
  },[])

  return (
    <section ref={ref} className={`relative w-full`}>
      <div ref={oRef} className='absolute bottom-0 left-0 right-0 w-full h-[450px] bg-brand-orange' />
      <div ref={bRef} className='absolute bottom-0 left-0 right-0 w-full h-[220px] bg-brand-blue' />
    </section>
  )
}
