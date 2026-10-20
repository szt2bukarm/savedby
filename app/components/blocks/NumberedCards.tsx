"use client"
import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { NumberedCardsBlockProps } from '@/types/sanity'
import { getSpacingClasses } from '@/app/utils/spacing'
import ElevatedSwiper, {
  useActiveCard,
  eases,
  type ActiveCardInfo,
  type SwiperControls,
} from '@/app/components/common/ElevatedSwiper'
import SwiperArrows from '@/app/components/common/SwiperArrows'

import { animateSlotMachine } from '@/app/utils/animations'

const TICK_MS = 3000

// Placeholder shown before the first roll: the numeric part becomes "0.0", prefix/suffix kept
const zeroDigits = (v: unknown) =>
  String(v ?? '').replace(/(?:\d|,)+(?:\.\d+)?/, '0.0')

function incrementNumberText(rawText: string, step?: number): string {
  const match = rawText.match(/^([^\d]*)((?:\d|,)+(?:\.\d+)?)(.*)$/)

  let prefix = ''
  let suffix = ''
  let currentNum = 0
  let decimals = 0

  if (match) {
    prefix = match[1]
    const numStr = match[2].replace(/,/g, '')
    currentNum = parseFloat(numStr) || 0
    if (numStr.includes('.')) decimals = numStr.split('.')[1].length
    suffix = match[3]
  } else {
    const rawNumStr = rawText.replace(/[^\d.-]/g, '')
    currentNum = parseFloat(rawNumStr) || 0
    if (rawNumStr.includes('.')) decimals = rawNumStr.split('.')[1].length
  }

  // default: bump the last visible digit, so the text length stays the same (e.g. 500 -> 501)
  currentNum += step ?? Math.pow(10, -decimals)
  currentNum = Math.round(currentNum * 10000) / 10000

  const naturalDecimals = currentNum.toString().includes('.')
    ? currentNum.toString().split('.')[1].length
    : 0
  const targetDecimals = Math.max(decimals, naturalDecimals)

  const parts = currentNum.toFixed(targetDecimals).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return prefix + parts.join('.') + suffix
}

export default function NumberedCards({ block }: NumberedCardsBlockProps) {
  const cards = block?.cards ?? []
  const spacingClasses = getSpacingClasses(block?.spacing)

  const { card, bind } = useActiveCard()
  const last = useRef<ActiveCardInfo | null>(null)
  const controlsRef = useRef<SwiperControls | null>(null)
  const [introDone, setIntroDone] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const activeNumberRef = useRef<HTMLElement | null>(null)
  const lastValuesRef = useRef<string[]>([])
  const hasRolledRef = useRef(false)
  if (lastValuesRef.current.length === 0 && cards.length > 0) {
    lastValuesRef.current = cards.map(c => String(c.number ?? ''))
  }

  const pauseProgress = () => {
    const bar = last.current?.parts.progress
    if (bar) gsap.getTweensOf(bar).forEach((t) => t.pause())
  }
  const restartProgress = () => {
    const bar = last.current?.parts.progress
    if (!bar) return
    gsap.to(bar, {
      opacity: 0,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: true,
      onComplete: () => {
        gsap.fromTo(
          bar,
          { scaleX: 0, opacity: 1 },
          { scaleX: 1, duration: TICK_MS / 1000, delay: 0.1, ease: 'none', overwrite: true },
        )
      },
    })
  }

  useGSAP(
    () => {
      const prev = last.current
      if (prev && prev.element !== card?.element) {
        gsap.to([prev.parts.text, prev.parts.number].filter(Boolean), {
          opacity: 0.4,
          scale: 1,
          color: '#000000',
          duration: 0.35,
          ease: 'power2.out',
          overwrite: true,
        })

        const prevProgress = prev.parts.progress
        if (prevProgress) {
          gsap.to(prevProgress, {
            opacity: 0,
            duration: 0.35,
            ease: 'power2.out',
            overwrite: true,
            onComplete: () => {
              gsap.set(prevProgress, { scaleX: 0, opacity: 1 })
            },
          })
        }
      }

      if (card) {
        const { text, number } = card.parts

        if (card.parts.progress) {
          gsap.fromTo(
            card.parts.progress,
            { scaleX: 0, opacity: 1 },
            { scaleX: 1, duration: TICK_MS / 1000, delay: 0.1, ease: 'none', overwrite: true },
          )
        }
        const tl = gsap.timeline({ defaults: { ease: 'power3.out', overwrite: 'auto' } })

        if (text) tl.to(text, { opacity: 1, duration: 0.45 }, 0)

        if (number) {
          tl.to(number, { opacity: 1, duration: 0.45 }, '<0.05')
        }

        const section = sectionRef.current
        if (section) {
          // First roll: numbers start at 0 and roll to their real values (no increment)
          const isFirstRoll = !hasRolledRef.current
          hasRolledRef.current = true
          for (let i = 0; i < cards.length; i++) {
            const oldText = lastValuesRef.current[i]
            const newText = isFirstRoll ? oldText : incrementNumberText(oldText)
            lastValuesRef.current[i] = newText

            section
              .querySelectorAll<HTMLElement>(`[data-part="number"][data-card-index="${i}"]`)
              .forEach((el) => {
                const isActive = el === number
                const elOld = el.getAttribute('data-val') || oldText
                animateSlotMachine(el, newText, undefined, isActive, elOld)
                el.setAttribute('data-val', newText)
              })
          }
        }
      }

      last.current = card
    },
    { dependencies: [card], revertOnUpdate: false },
  )

  if (!cards.length) return null

  return (
    <section ref={sectionRef} className={`w-full bg-background ${spacingClasses}`}>
      <ElevatedSwiper
        initialSlide={cards.length > 1 ? 1 : 0}
        autoplay
        autoplayDelay={3000}
        introSpin={cards.length}
        introFade
        controlsRef={controlsRef} onIntroComplete={() => setIntroDone(true)}
        activateWhileScrolling={false}
        config={{
          autoplayDuration: 700,
        }}
        {...bind}
        onInteractStart={pauseProgress}
        onInteractEnd={restartProgress}
      >
        {cards.map((card, i) => (
          <div
            key={card._key || i}
            className="relative flex flex-col justify-between pt-[25px] px-[12px] pb-[12px] sm:pt-[35px] sm:pb-[15px] sm:px-[15px] lg:pt-[45px] lg:pb-[0px] lg:px-[20px] 
            bg-darkbg rounded-[4px] sm:rounded-[6px] lg:rounded-[10px] w-[230px] h-[210px] sm:w-[280px] sm:h-[260px] lg:w-[450px] lg:h-[415px] overflow-hidden select-none"
          >
            <div
              className="absolute top-0 left-0 right-0 h-[9px] sm:h-[15px] lg:h-[20px] overflow-hidden"
              style={{ backgroundColor: card.color }}
            >
              <div
                data-part="progress"
                className="absolute inset-0 bg-white/35"
                style={{ transform: 'scaleX(0)', transformOrigin: 'left center' }}
              />
            </div>
            <p
              data-part="text"
              className="opacity-40 text-black font-riforma-regular text-mobile-p1 sm:text-tablet-h4 lg:text-desktop-h3 leading-[85%] tracking-[-6%] whitespace-pre-line"
            >
              {card.text}
            </p>
            <p
              data-part="number"
              data-val={zeroDigits(card.number)}
              data-card-index={i}
              className="opacity-40 ml-auto text-black font-riforma-bold text-[44px] sm:text-[64px] lg:text-[100px] leading-[85%] tracking-[-6%]"
            >
              {zeroDigits(card.number)}
            </p>
          </div>
        ))}
      </ElevatedSwiper>
      <SwiperArrows visible={introDone} onPrev={() => controlsRef.current?.prev()} onNext={() => controlsRef.current?.next()} />
    </section>
  )
}
