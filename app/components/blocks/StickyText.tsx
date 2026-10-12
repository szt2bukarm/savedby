"use client"
import { getSpacingClasses } from '@/app/utils/spacing'
import type { StickyTextBlockProps } from '@/types/sanity'
import { PortableTextComponents } from 'next-sanity';
import { useRef, useState, useEffect } from 'react';
import { useRive, useViewModelInstanceBoolean, Layout, Fit, Alignment } from '@rive-app/react-webgl2';
import GradientRevealText from '../common/GradientRevealText';
import { RIVE_MANUAL_RESIZE, useRiveResize } from '@/app/utils/useRiveResize';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/all';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// scroll distance (px) the section stays pinned per text item
const PIN_PX_PER_ITEM = 500;

// view model boolean: damaged = false, intact = true
const BOX_STATE_PROP = 'toggleOn';

export default function StickyText({ block }: StickyTextBlockProps) {
  const spacingClasses = getSpacingClasses(block?.spacing);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const items = block?.items || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  const { rive, canvas, container, RiveComponent } = useRive({
    src: '/SavedBy.riv',
    artboard: 'Box Switch',
    stateMachines: 'State Machine 1',
    autoplay: true,
    autoBind: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  }, RIVE_MANUAL_RESIZE);
  useRiveResize(rive, canvas, container);

  const boxStateProp = useViewModelInstanceBoolean(BOX_STATE_PROP, rive?.viewModelInstance);
  const activeBoxIcon = items[activeIndex]?.boxIcon === 'damaged' ? 'damaged' : 'intact';

  useEffect(() => {
    if (boxStateProp?.setValue) boxStateProp.setValue(activeBoxIcon === 'intact');
  }, [activeBoxIcon, boxStateProp]);

  const portableTextComponents: PortableTextComponents = {
    block: {
      normal: ({ children }) => (
        <span className="text-mobile-h2 sm:text-tablet-h4 lg:text-desktop-h4 leading-[85%] tracking-[-4%] font-riforma-regular text-center text-black w-[90%] sm:w-[600px] lg:w-[800px] text-balance">
          {children}
        </span>
      ),
    },
    marks: {
      strong: ({ children }) => (
        <strong className="font-riforma-bold font-bold">{children}</strong>
      ),
    },
  }

  useGSAP(() => {
    const els = textRefs.current.filter(Boolean) as HTMLElement[];
    if (!trackRef.current || !els.length) return;

    gsap.set(els, {
      "--gradient-size": "0%",
      "--gradient-position": "-17% -17%",
      "--gradient-color": "#FD4015",
    });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: trackRef.current,
        start: "top top",
        end: `+=${els.length * PIN_PX_PER_ITEM}`,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.min(items.length - 1, Math.floor(self.progress * items.length));
          if (idx !== activeIndexRef.current) {
            activeIndexRef.current = idx;
            setActiveIndex(idx);
          }
        },
      },
    });

    els.forEach((el, i) => {
      const t = i;
      // reveal in
      tl.set(el, { "--gradient-position": "-17% -17%", "--gradient-color": "#FD4015" , opacity: 1}, t)
        .to(el, { "--gradient-size": "120%", "--gradient-color": "#110F0B", duration: 0.75 }, t);

      // reveal out
      if (i < els.length - 1) {
        tl.set(el, { "--gradient-position": "110% 110%" , opacity: 1}, t + 0.75)
          .to(el, { "--gradient-size": "0%", "--gradient-color": "#0095EC", duration: 0.75 }, t + 0.7);
      } else {
        tl.to({}, { duration: 0.75 }, t + 0.75);
      }
    });
  }, { scope: wrapperRef, dependencies: [items.length] });

  return (
    <div ref={wrapperRef} className={`w-full ${spacingClasses} bg-background`}>
    <div ref={trackRef}>
    <section className={`sticky top-0 h-screen w-full bg-background
    flex flex-col items-center justify-center gap-[20px] sm:gap-[40px]`}>
      <RiveComponent className="w-[60%] aspect-square sm:w-[310px] sm:h-[310px] shrink-0" />
      <div className="grid items-start w-[80%] sm:w-[550px] text-center lg:w-[700px]">
        {items.map((item: any, index: number) => (
          <GradientRevealText
            key={index}
            style={{ "--gradient-size": "0%", "--gradient-position": "-17% -17%", opacity: 0} as React.CSSProperties}
            ref={(el: HTMLElement | null) => { textRefs.current[index] = el; }}
            className="col-start-1 row-start-1"
            value={item.text}
            components={portableTextComponents}
          />
        ))}
      </div>
    </section>
    <div aria-hidden style={{ height: items.length * PIN_PX_PER_ITEM }} />
    </div>
    </div>
  )
}
