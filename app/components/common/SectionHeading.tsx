"use client"
import { ReactNode, useRef } from "react"
import GradientRevealText from "./GradientRevealText"
import { PortableTextComponents } from "next-sanity"
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function SectionHeading({children,className = '',centered = true} : {children: ReactNode,className?:string,centered?:boolean}) {
    const headingRef = useRef<any>(null);

      useGSAP(() => {
        gsap.set(headingRef.current, {
          "--gradient-size": "0%",
          "--gradient-position": "-15% -15%",
          "--gradient-color" : "#FD4015",
        })
    
        gsap.to(headingRef.current, {
          "--gradient-size": "120%",
          "--gradient-color": "#110F0B",
          duration: 0.75,
          scrollTrigger: {
            trigger: headingRef.current,
            start: "25% 60%",
            markers: true
          }
        })
      },[])


    return (
        <GradientRevealText as="p" ref={headingRef} className={`text-black text-mobile-h2 sm:text-desktop-h4 lg:text-desktop-h3 tracking-[-4%] leading-[85%] 
            w-[70%] max-w-[400px]
            sm:max-w-[550px] sm:w-[550px] lg:max-w-[650px] lg:w-[650px] 
            mb-[70px] lg:mb-[100px] font-riforma-bold ${centered ? 'text-center mx-auto' : ''} ${className}`}>{children}</GradientRevealText>
    )
}