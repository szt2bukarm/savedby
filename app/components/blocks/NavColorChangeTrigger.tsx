"use client"
import { useAppContext } from '@/app/AppContext';
import type { NavColorChangeTriggerBlockProps } from '@/types/sanity'
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react'
gsap.registerPlugin(ScrollTrigger);

export default function NavColorChangeTrigger({ block }: NavColorChangeTriggerBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const {setNavColor} = useAppContext();

  useGSAP(() => {
    if (!ref.current || !block?.to || !block?.from) return;

    const toColor = block.to;
    const fromColor = block.from;

    const ctx = gsap.context(() => {
        ScrollTrigger.create({
        trigger: ref.current,
        start: "top 5%",
        end: "bottom 5%",
        onEnter: () => {
          setNavColor(toColor)
        },
        onLeaveBack: () => {
          setNavColor(fromColor)
        },
        onRefresh: (self) => {
          if (self.progress > 0) {
            setNavColor(toColor)
          } else {
            setNavColor(fromColor)
          }
        }
      })
    }, ref)


    return () => ctx.revert();
  },[ref])

  return <div ref={ref} className='w-full h-[0px]' />
}
