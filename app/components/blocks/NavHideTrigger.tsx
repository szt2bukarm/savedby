"use client"
import { useAppContext } from '@/app/AppContext';
import type { NavHideTriggerBlockProps } from '@/types/sanity'
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react'
gsap.registerPlugin(ScrollTrigger);

export default function NavHideTrigger({ block }: NavHideTriggerBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const {setNavHidden} = useAppContext();

  useGSAP(() => {
    if (!ref.current || !block?.to || !block?.from) return;

    const toHidden = block.to === 'hidden';
    const fromHidden = block.from === 'hidden';

    const ctx = gsap.context(() => {
        ScrollTrigger.create({
        trigger: ref.current,
        start: "top-150 5%",
        end: "bottom 5%",
        onEnter: () => {
          setNavHidden(toHidden)
        },
        onLeaveBack: () => {
          setNavHidden(fromHidden)
        },
        onRefresh: (self) => {
          if (self.progress > 0) {
            setNavHidden(toHidden)
          } else {
            setNavHidden(fromHidden)
          }
        }
      })
    }, ref)


    return () => ctx.revert();
  },[ref])

  return <div ref={ref} className='w-full h-[0px]' />
}
