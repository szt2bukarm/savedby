"use client"
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useRive, useViewModelInstanceFont, decodeFont } from '@rive-app/react-webgl2'
import { RIVE_GATED, useRiveResize, useRiveRenderGate } from '@/app/utils/useRiveResize'

import type { FeatureCardsBlockProps } from '@/types/sanity'
import { getSpacingClasses } from '@/app/utils/spacing'
import { animateSlotMachine } from '@/app/utils/animations'
import ElevatedSwiper, {
  useActiveCard,
  eases,
  type ActiveCardInfo,
} from '@/app/components/common/ElevatedSwiper'
import SectionHeading from '../common/SectionHeading'

const loadFont = async (url: string) =>
  decodeFont(new Uint8Array(await (await fetch(url)).arrayBuffer()))

let fontsPromise: Promise<[Awaited<ReturnType<typeof decodeFont>>, Awaited<ReturnType<typeof decodeFont>>]> | null = null
const getFonts = () => {
  if (!fontsPromise) {
    fontsPromise = (async () => {
      const regular = await loadFont('/fonts/RiformaLLSub-Regular.ttf')
      const bold = await loadFont('/fonts/RiformaLLSub-Bold.ttf')
      return [regular, bold] as [typeof regular, typeof bold]
    })()
    fontsPromise.catch(() => { fontsPromise = null })
  }
  return fontsPromise
}

const CardRive = ({ artboard }: { artboard: string }) => {
  const { rive, canvas, container, RiveComponent } = useRive({
    src: '/SavedBy.riv',
    artboard,
    autoplay: true,
    autoBind: true,
    shouldDisableRiveListeners: true,
  }, RIVE_GATED)
  useRiveResize(rive, canvas, container,1.5)
  useRiveRenderGate(rive, canvas, '[data-k]')

  const fontProp = useViewModelInstanceFont('font', rive?.viewModelInstance)
  const fontBoldProp = useViewModelInstanceFont('boldFont', rive?.viewModelInstance)
  const fontLoaded = useRef(false)

  useEffect(() => {
    fontLoaded.current = false
  }, [rive])

  useEffect(() => {
    if (canvas) canvas.style.filter = 'brightness(1)'
  }, [canvas])

  useEffect(() => {
    if (fontProp?.setValue && fontBoldProp?.setValue && !fontLoaded.current) {
      fontLoaded.current = true
      const loadFonts = async () => {
        try {
          const [regular, bold] = await getFonts()
          fontProp.setValue(regular)
          fontBoldProp.setValue(bold)
        } catch (e) {}
      }
      loadFonts()
    }
  }, [fontProp, fontBoldProp])

  return <RiveComponent data-part="rive" className="absolute inset-0 w-full h-full object-contain z-10" />
}

export default function FeatureCards({ block }: FeatureCardsBlockProps) {
  const cards = block?.cards ?? []
  const spacingClasses = getSpacingClasses(block?.spacing)

  const { card, bind } = useActiveCard()
  const last = useRef<ActiveCardInfo | null>(null)

  useGSAP(
    () => {
      // 1. ease the card back to its original state
      const prev = last.current
      if (prev && prev.element !== card?.element) {
        gsap.to([prev.parts.title, prev.parts.text, prev.parts.number].filter(Boolean), {
          opacity: 0.4,
          scale: 1,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: true,
        })
        if (prev.parts.circle) {
          gsap.to(prev.parts.circle, {
            scale: 1,
            xPercent: -50,
            yPercent: -50,
            filter: "brightness(1)",
            duration: 0.2,
            ease: 'power2.out',
            overwrite: true,
          })
        }
        if (prev.parts.rive) {
          gsap.to(prev.parts.rive, {
            scale: 1,
            filter: "brightness(1)",
            duration: 0.2,
            ease: 'power2.out',
            overwrite: true,
          })
        }
      }

      // 2. animate the new current card
      if (card) {
        const { title, text, number, circle, rive } = card.parts
        const tl = gsap.timeline({ defaults: { ease: 'power3.out', overwrite: 'auto' } })
        
        if (title) tl.to(title, { opacity: 1, duration: 0.45 }, 0)
        if (text) tl.to(text, { opacity: 1, duration: 0.45 }, 0)
        
        if (number) {
          const endStr = number.getAttribute('data-val') || number.innerText || '0'
          tl.to(number, { opacity: 1, scale: 1.05, transformOrigin: '50% 50%', duration: 0.45 }, '<0.05')
          animateSlotMachine(number, endStr, tl)
        }
        
        if (circle) {
          tl.to(circle, {
            scale: 0.95,
            xPercent: -50,
            yPercent: -50,
            duration: 0.4,
            filter: "brightness(1.05)",
            ease: "back.out(2)",
          }, 0)
        }
        if (rive) {
          tl.to(rive, {
            scale: 0.95,
            duration: 0.4,
            filter: "brightness(1.05)",
            ease: "back.out(2)",
          }, 0)
        }
      }

      last.current = card
    },
    { dependencies: [card], revertOnUpdate: false },
  )

  if (!cards.length) return null

  return (
    <section className={`w-full overflow-hidden bg-background ${spacingClasses}`}>

    <SectionHeading>{block?.heading}</SectionHeading>


      <ElevatedSwiper 
        initialSlide={cards.length > 1 ? 1 : 0} 
        autoplay 
        autoplayDelay={7000} 
        introSpin={cards.length}
        activateWhileScrolling={true}
        introFade
        config={{
          autoplayDuration: 700,
        }}
        {...bind}
      >
        {cards.map((card, i) => (
          <div key={card._key || i} style={{ width: 'auto', height: 'auto' }}>
            <div className="card-inner flex flex-col rounded-[4px] sm:rounded-[6px] lg:rounded-[10px] w-[270px] sm:w-[360px] lg:w-[450px] overflow-hidden" style={{ backgroundColor: card.backgroundColor?.split(",")[0] }}>

              <div className='relative min-h-[180px] sm:min-h-[270px] lg:min-h-[340px] flex items-center justify-center overflow-hidden'>
                <div 
                  data-part='circle' 
                  className='absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 min-h-[calc(100%+100px)] w-full rounded-full' 
                  style={{
                    backgroundColor: card.backgroundColor?.split(",")[1],
                    filter: "brightness(1)"
                  }} 
                />
                {card.mediaType === 'rive' && card.riveArtboard && (
                  <CardRive artboard={card.riveArtboard} />
                )}
                {card.mediaType !== 'rive' && card.number && (
                  <p data-part="number" data-val={card.number} className='opacity-40 text-[100px] sm:text-[120px] lg:text-[153px] text-background tracking-[-6%] z-10 font-riforma-bold'>{card.number}</p>
                )}
              </div>

              <div className='relative flex flex-col justify-between px-[12px] py-[20px] sm:px-[15px] sm:py-[25px] lg:py-[30px] lg:px-[20px] bg-darkbg max-w-full min-h-[220px] sm:min-h-[250px] lg:min-h-[325px] overflow-hidden select-none'>
                <p data-part="title" className='opacity-40 text-black font-riforma-bold text-mobile-h3 sm:text-tablet-h4 lg:text-desktop-h4 leading-[85%] tracking-[-6%] whitespace-pre-line'>{card.title}</p>
                <p data-part="text" className="opacity-40 text-black font-riforma-regular text-mobile-p2 sm:text-tablet-p2 lg:text-desktop-p1 leading-[120%] tracking-[-4%]">{card.text}</p>
              </div>
            </div>
          </div>
        ))}
      </ElevatedSwiper>
    </section>
  )
}
