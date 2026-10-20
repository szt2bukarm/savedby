"use client"
import type { MerchantReviewSlideBlockProps } from '@/types/sanity'
import { useEffect, useRef, useState } from 'react'
import SavedByLogo from '../common/SavedByLogo';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import confetti from 'canvas-confetti';
import GradientRevealText from '../common/GradientRevealText';
import { useRive, useViewModelInstanceBoolean, Layout, Fit, Alignment } from '@rive-app/react-webgl2';
import { RIVE_GATED, useRiveResize, useRiveRenderGate } from '@/app/utils/useRiveResize';
import { useRivFile } from '@/app/utils/riveAssets';
import { getSpacingClasses } from '@/app/utils/spacing';

const Star = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className='translate-y-[-2px]' width="14" height="13" viewBox="0 0 14 13" fill="none">
      <path d="M5.90784 0.484361C6.2965 -0.161459 7.2328 -0.16146 7.62146 0.48436L9.17948 3.07325C9.3191 3.30526 9.54685 3.47073 9.81065 3.53183L12.7543 4.21358C13.4886 4.38365 13.7779 5.27412 13.2838 5.84333L11.3031 8.12511C11.1256 8.32959 11.0386 8.59733 11.062 8.8671L11.3233 11.8773C11.3884 12.6283 10.631 13.1786 9.93692 12.8846L7.15474 11.7059C6.90541 11.6003 6.62389 11.6003 6.37456 11.7059L3.59238 12.8846C2.89835 13.1786 2.14087 12.6283 2.20604 11.8773L2.46729 8.8671C2.4907 8.59733 2.40371 8.3296 2.2262 8.12511L0.245468 5.84333C-0.248641 5.27412 0.0406899 4.38365 0.775004 4.21358L3.71864 3.53183C3.98245 3.47073 4.21019 3.30526 4.34982 3.07325L5.90784 0.484361Z" fill="#FD4015"/>
    </svg>
  )
}

const Box = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="39" height="39" viewBox="0 0 39 39" fill="none">
  <path d="M10.9748 18.4307L7.93262 23.2878L10.4844 24.4364" stroke="black" strokeWidth="1.06732" strokeLinejoin="bevel"/>
  <path d="M14.9599 26.45C16.3902 27.092 17.5496 26.2197 17.5496 24.5022C17.5496 22.7848 16.3902 20.8695 14.9599 20.2248C13.5295 19.5801 12.3701 20.4551 12.3701 22.1725C12.3701 23.89 13.5295 25.8052 14.9599 26.45Z" stroke="black" strokeWidth="1.06732" strokeLinejoin="round"/>
  <path d="M15.6255 25.9471C16.6874 26.4239 17.5488 25.7765 17.5488 24.5006C17.5488 23.2247 16.6874 21.8025 15.6255 21.3257C14.5636 20.8489 13.7021 21.4964 13.7021 22.7723C13.7021 24.0482 14.5636 25.4704 15.6255 25.9471Z" fill="black"/>
  <path d="M5.34815 21.3241C6.41006 21.8009 7.2715 21.1534 7.2715 19.8775C7.2715 18.6016 6.41006 17.1794 5.34815 16.7026C4.28625 16.2259 3.4248 16.8733 3.4248 18.1492C3.4248 19.4251 4.28625 20.8473 5.34815 21.3241Z" fill="black"/>
  <path d="M4.68252 21.8259C6.11284 22.4679 7.27226 21.5956 7.27226 19.8782C7.27226 18.158 6.11284 16.2455 4.68252 15.6008C3.2522 14.9587 2.09277 15.831 2.09277 17.5485C2.09277 19.266 3.2522 21.1812 4.68252 21.8259Z" stroke="black" strokeWidth="1.06732" strokeLinejoin="round"/>
  <path d="M15.6252 29.259C14.1244 29.9145 12.0087 29.7276 9.8199 28.7443C7.63108 27.7609 5.5154 26.0435 4.01465 24.0361" stroke="black" strokeWidth="1.06732" strokeLinejoin="round"/>
  <path d="M19.1525 17.3063L1.20851 9.24179L0.47168 8.9113" stroke="black" strokeWidth="0.942711"/>
  <path d="M19.1514 37.5172V17.3058" stroke="black" strokeWidth="0.942711"/>
  <path d="M37.518 9.05193L19.1514 17.3061" stroke="black" strokeWidth="0.942711"/>
  <path d="M37.8307 8.91177L19.1525 0.516769L0.47168 8.91177V29.4645L19.1525 37.8595L37.8307 29.4645V8.91177Z" stroke="black" strokeWidth="0.942711"/>
  <path d="M9.81543 12.9469L28.4963 4.55193" stroke="black" strokeWidth="0.942711"/>
</svg>
  )
}

const REVIEW_DURATION_MS = 5000

const ReviewDot = ({ active, onClick, sizeClass, insetClass, animate }: { active: boolean, onClick: () => void, sizeClass: string, insetClass: string, animate: boolean }) => {
  const [runId, setRunId] = useState(0);
  const [prevActive, setPrevActive] = useState(active);
  if (prevActive !== active) {
    setPrevActive(active);
    if (active) setRunId((r) => r + 1);
  }

  return (
    <div className={`relative ${sizeClass}`}>
      <button
        type='button'
        aria-label='Show review'
        aria-current={active}
        onClick={onClick}
        className={`absolute inset-0 block cursor-pointer rounded-full transition-[background-color,transform] duration-250 hover:scale-110 active:scale-95  ${active ? 'bg-brand-orange' : 'bg-[#EBE4D1]'}`}
      />
      <div className={`absolute pointer-events-none ${insetClass}`}>
      <svg className='block w-full h-full -rotate-90' viewBox='0 0 100 100' fill='none'>
        {animate && (
          <circle
            key={runId}
            cx='50'
            cy='50'
            r='46'
            pathLength={1}
            stroke='#FD4015'
            strokeWidth='7'
            strokeLinecap='round'
            strokeDasharray='1'
            strokeDashoffset='1'
            style={{
              opacity: active ? 1 : 0,
              transition: 'opacity 250ms ease-in-out',
              animation: `review-ring-fill ${REVIEW_DURATION_MS}ms linear forwards`,
            }}
          />
        )}
      </svg>
      </div>
    </div>
  )
}

const EnableSavedbyBar = ({ enabled, setEnabled }: { enabled: boolean, setEnabled: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const checkboxRef = useRef<HTMLDivElement>(null);
  const checkmarkRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<ReturnType<typeof confetti.create> | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.width = 800;
    canvasRef.current.height = 800;
    const instance = confetti.create(canvasRef.current, {
      resize: false,
      useWorker: false,
    });
    confettiRef.current = instance;
    return () => {
      instance.reset();
      confettiRef.current = null;
    };
  }, []);

  const MIN_PRESS_MS = 150;
  const pressStartRef = useRef(0);
  const releaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mouseDown = () => {
    gsap.to(buttonRef.current,{
      scale: 0.98,
      duration: 0.15,
      ease: "power1.inOut",
      overwrite: "auto"
    })
    gsap.to(svgContainerRef.current, {
      scale: 0.95,
      duration: 0.15,
      ease: "power1.inOut",
      overwrite: "auto"
    })
    gsap.to(svgRef.current, {
      scale: 0.8,
      duration: 0.15,
      ease: "power1.inOut",
      overwrite: "auto"
    })
    gsap.to(checkboxRef.current, {
      scale: 0.7,
      duration: 0.15,
      ease: "power1.inOut",
      overwrite: "auto"
    })
  }
  const mouseUp = () => {
    gsap.to(buttonRef.current,{
      scale: 1,
      duration: 0.15,
      ease: "power1.inOut",
      overwrite: "auto"
    })
    gsap.to(svgContainerRef.current, {
      scale: 1,
      duration: 0.15,
      ease: "power1.inOut",
      overwrite: "auto"
    })
    gsap.to(svgRef.current, {
      scale: 1,
      duration: 0.15,
      ease: "power1.inOut",
      overwrite: "auto"
    })
    gsap.to(checkboxRef.current, {
      scale: 1,
      duration: 0.15,
      ease: "power1.inOut",
      overwrite: "auto"
    })
  }

  const handlePress = () => {
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    pressStartRef.current = Date.now();
    mouseDown();
  };

  const handleRelease = () => {
    if (!pressStartRef.current) return;
    const elapsed = Date.now() - pressStartRef.current;
    pressStartRef.current = 0;
    const remaining = Math.max(0, MIN_PRESS_MS - elapsed);
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    releaseTimerRef.current = setTimeout(mouseUp, remaining);
  };

  useEffect(() => () => {
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
  }, []);

  useGSAP(() => {
    if (!enabled) {
      gsap.to(checkmarkRef.current, {
        scale: 1,
        opacity: 0,
        duration: 0.3,
        ease: "back.inOut(3.5)"
      })
    } else {
      gsap.to(checkmarkRef.current, {
        scale: 2,
        opacity: 1,
        duration: 0.3,
        ease: "back.inOut(3.5)"
      })

      if (confettiRef.current) {
        confettiRef.current({
          particleCount: 20,
          spread: 150,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#FD4015', '#0095EC', '#110F0B'],
          zIndex: 1,
          gravity: 1,
          startVelocity: 20,
          ticks: 150,
        });
      }
    }
  },[enabled])

  return (
    <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-[100%] sm:w-[90%] max-w-[520px] z-10'>
      <canvas 
        ref={canvasRef} 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none" 
      />
      <button 
      onClick={(e) => {
        setEnabled(prev => !prev)
        // keyboard activation has no pointer events
        if (e.detail === 0) {
          handlePress();
          handleRelease();
        }
      }}
      onPointerDown={handlePress}
      onPointerUp={handleRelease}
      onPointerLeave={handleRelease}
      onPointerCancel={handleRelease}
      ref={buttonRef}
      className='relative w-full rounded-[18px] border-[2px] border-[#D2D2D2] bg-white active:bg-gray-200 hover:bg-gray-200 transition-colors duration-150 flex justify-between items-center p-[10px] cursor-pointer'>

        <div className='flex gap-[20px] items-center select-none '>
          <div ref={svgContainerRef} className='w-[60px] h-[60px] bg-brand-orange rounded-[8px] pointer-events-none'>
            <div ref={svgRef} className='w-full h-full flex justify-center items-center'>
              <Box />
            </div>
          </div>
          <p className='font-riforma-regular text-mobile-p2 sm:text-desktop-p1 tracking-[-2%] leading-[100%] pointer-events-none text-left'>Enable <span className='font-riforma-bold'>SavedBy</span><br></br>Package Protection</p>
        </div>

        <div ref={checkboxRef} className='flex items-center justify-center w-[20px] h-[20px] border-[1px] border-brand-orange mr-[15px] xs:mr-[30px]'>
          <svg ref={checkmarkRef} className='scale-200' xmlns="http://www.w3.org/2000/svg" width="35" height="26" viewBox="0 0 35 26" fill="none">
            <path d="M34.1221 0.5L19.292 25.5H13.6855L1.1582 12.2031H11.6543L15.168 17.6143L15.8115 18.6064L16.0742 17.4531L19.9346 0.5H34.1221Z" fill="#FD4015" stroke="#FD4015"/>
          </svg>
        </div>
      </button>
    </div>
  )
}

export default function MerchantReviewSlide({ block }: MerchantReviewSlideBlockProps) {
  const spacingClasses = getSpacingClasses(block?.spacing);
  const [enabled, setEnabled] = useState(false);
  const reviewTextRef = useRef<any>(null);
  const nameRef = useRef<any>(null);
  const titleRef = useRef<any>(null);
  const [currentReview,setCurrentReview] = useState(0);
  const lockRef = useRef<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [displayReview,setDisplayReview] = useState({
    quote: "",
    name: "",
    title: ""
  })

  const riveFile = useRivFile();
  const { rive, canvas, container, RiveComponent } = useRive(riveFile ? {
    riveFile,
    artboard: 'Box Stack',
    stateMachines: 'State Machine 1',
    autoplay: true,
    autoBind: true,
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
  } : undefined, RIVE_GATED);
  useRiveResize(rive, canvas, container);
  useRiveRenderGate(rive, canvas);

  const toggleOnProp = useViewModelInstanceBoolean('toggleOn', rive?.viewModelInstance);

  useEffect(() => {
    if (toggleOnProp && toggleOnProp.setValue) {
      toggleOnProp.setValue(enabled);
    }
  }, [enabled, toggleOnProp]);

  const changeReview = (index: number) => {
    if (lockRef.current) return;
    const ratings = block?.ratings;
    if (!ratings || ratings.length <= 0 || currentReview === index) return;
    if (intervalRef.current) clearInterval(intervalRef.current as any);
    setCurrentReview(index);
    lockRef.current = true;
    gsap.set(reviewTextRef.current, {
      "--gradient-size": "120%",
      "--gradient-position": "110% 110%",            
    })
    gsap.to(reviewTextRef.current,{
      "--gradient-size": "0%",
      duration: 0.4,
    })
    gsap.to(reviewTextRef.current,{
      "--gradient-color" :  "#0095EC",
      duration: 0.2,
    })
    gsap.to([nameRef.current,titleRef.current], {
      opacity: 0,
      duration: 0.2
    })
    setTimeout(() => {
      setDisplayReview(ratings[index])
      lockRef.current = false;
    }, 500);
    gsap.set(reviewTextRef.current,{
      "--gradient-color" :  "#FD4015",
      "--gradient-size": "0%",
      "--gradient-position": "-15% -15%",
      delay: 0.5
    })
    gsap.to(reviewTextRef.current,{
      "--gradient-size": "120%",
      "--gradient-color": "#110F0B",
      delay: 0.5,
      duration: 0.4,
    })
    gsap.to([nameRef.current,titleRef.current], {
      opacity: 1,
      duration: 0.2,
      delay: 0.5
    })
  }
  
  useEffect(() => {
    if (!block?.ratings) return;
    setDisplayReview(block.ratings[0]);
  }, [block?.ratings]);
  
  useEffect(() => {
    if (!block?.ratings || block.ratings.length <= 1) return;
    
    intervalRef.current = setInterval(() => {
      changeReview((currentReview + 1) % (block?.ratings?.length || 1));
    }, 5000);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [block?.ratings, currentReview]);
  
  if (!block?.ratings?.length) return null;

  return (
    <section className={`${spacingClasses} relative w-full lg:min-h-[clamp(400px,50vh,1000px)] flex flex-col-reverse gap-[120px] lg:gap-0 lg:grid lg:grid-cols-[50%_50%] pl-[20px] pr-[20px] sm:pl-[40px] sm:pr-[40px] lg:pl-[60px] lg:pr-0! xl:pl-[110px]`}>

      <style>{`@keyframes review-ring-fill { to { stroke-dashoffset: 0; } }`}</style>
      <div className='hidden xl:flex flex-col gap-[25px] absolute top-1/2 -translate-y-1/2 left-[45px]'>
        {Array.from({length: block?.ratings?.length}).map((_, index) => (
          <ReviewDot
            key={index}
            active={currentReview === index}
            animate={(block?.ratings?.length ?? 0) > 1}
            onClick={() => changeReview(index)}
            sizeClass='w-[20px] h-[20px]'
            insetClass='-inset-[7px]'
          />
        ))}
      </div>

      <div className='flex flex-col justify-between gap-[50px] sm:gap-[50px] lg:h-full'>

        <p className='text-mobile-p2 sm:text-desktop-h5 text-black font-riforma-regular tracking-[-4%]'>{block?.topText}</p>

        <div className='flex flex-col w-full lg:w-[70%]'>
          <GradientRevealText ref={reviewTextRef} className='text-black font-riforma-regular text-mobile-h2 sm:text-desktop-h4 xl:text-desktop-h3 tracking-[-6%] leading-[85%] mb-[60px] sm:mb-[75px]'>{'"' + displayReview.quote + '"'}</GradientRevealText>
          <p ref={nameRef} className='text-mobile-h4 sm:text-desktop-h6 text-black font-riforma-bold tracking-[-4%] leading-[85%]'>{'— ' + displayReview.name}</p>
          <p ref={titleRef} className='text-mobile-h4 sm:text-desktop-h6 text-black font-riforma-regular tracking-[-4%] leading-[85%] mb-[40px]'>{displayReview.title}</p>
          <div className='flex gap-[24px] sm:gap-[30px] pl-[8px] xl:hidden'>
          {Array.from({length: block?.ratings?.length}).map((_, index) => (
            <ReviewDot
              key={index}
              active={currentReview === index}
              animate={(block?.ratings?.length ?? 0) > 1}
              onClick={() => changeReview(index)}
              sizeClass='w-[12px] h-[12px] sm:w-[20px] sm:h-[20px]'
              insetClass='-inset-[4px] sm:-inset-[7px]'
            />
          ))}
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-[15px] sm:gap-[30px] items-center justify-center lg:justify-start mt-[20px]'>
          <SavedByLogo className='w-[146px] h-[46px]' color='#0095EC' />
          <div className='flex flex-col gap-[5px] items-center sm:items-start'>
            <p className='text-desktop-p2 font-riforma-bold leading-[110%] tracking-[-3%]'>IS RATED 5 STARS ON SHOPIFY</p>
            <p className='flex items-center text-desktop-p2 font-riforma-regular leading-[110%] tracking-[-3%]'>5.0&nbsp;<span><Star/></span>&nbsp;&nbsp;across 55 reviews</p>
          </div>
        </div>

      </div>

      <div className='relative w-full h-full pb-[20vw] xs:pb-[15vw] md:pb-[5vw] lg:pb-0 lg:max-w-[1199px] lg:justify-self-end'>
        <div className="w-[calc(100%+80px)] -translate-x-[40px] xs:w-[calc(100%+40px)] xs:-translate-x-[20px] sm:w-[calc(100%+80px)] sm:-translate-x-[40px] lg:translate-x-0 lg:w-full h-full aspect-[1019/850]"
        style={{
          WebkitMask: "linear-gradient(to top, transparent 0%, black 10%)",
          WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 10%)",

        }}>
          <RiveComponent className="w-full h-full " />
        </div>
        <EnableSavedbyBar enabled={enabled} setEnabled={setEnabled} />
      </div>

    </section>
  )
}
