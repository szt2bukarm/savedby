"use client"

const Arrow = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 57" fill="none">
    <path d="M41.2031 54.1904L66.5 28.3187L41.2031 2.4469" strokeWidth="7" strokeMiterlimit="10" stroke="black" />
    <path d="M65 28.1904L0 28.1904" strokeWidth="7" stroke="black" />
  </svg>
)

const buttonClass =
  'opacity-100 hover:opacity-50 transition-opacity duration-300 cursor-pointer'

interface SwiperArrowsProps {
  onPrev: () => void
  onNext: () => void
  className?: string
  visible?: boolean
}

export default function SwiperArrows({
  onPrev,
  onNext,
  className = 'px-[20px] sm:px-[40px] lg:px-[60px] xl:px-[110px] pt-[50px]',
  visible = true,
}: SwiperArrowsProps) {
  return (
    <div
      className={`flex justify-between transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${className}`}
      aria-hidden={!visible}
    >
      <button type="button" aria-label="Previous" className={buttonClass} onClick={onPrev}>
        <Arrow className="w-[40px] lg:w-[70px] rotate-180" />
      </button>
      <button type="button" aria-label="Next" className={buttonClass} onClick={onNext}>
        <Arrow className="w-[40px] lg:w-[70px]" />
      </button>
    </div>
  )
}
