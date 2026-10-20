"use client"
import React, { useState, useEffect, useRef, useSyncExternalStore } from 'react'
import { getSpacingClasses } from '@/app/utils/spacing'
import type { CustomerStoryBlockProps } from '@/types/sanity'
import { PortableText, PortableTextComponents } from 'next-sanity'

const ArrowDown = ({className} : {className: string}) => {
  return (
    <svg data-gsap='customerstory-arrowdown' xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 57 72" fill="none">
    <path d="M2.44727 41.2031L28.319 66.5L54.1908 41.2031" stroke="black" strokeWidth="7" strokeMiterlimit="10"/>
    <path d="M28.4473 65L28.4473 0" stroke="black" strokeWidth="7"/>
  </svg>
  )
}

const SlideIndicator = ({
  activeIndex,
  count,
  activeBoxClass,
  trackClass,
  activeTextClass,
  textClass,
}: {
  activeIndex: number
  count: number
  activeBoxClass: string
  trackClass: string
  activeTextClass: string
  textClass: string
}) => {
  return (
    <div className='flex h-[33px] relative'>
      <div className={`absolute left-0 top-0 w-[33px] h-[33px] ${activeBoxClass} z-5 transition-transform duration-300 ease-in-out`} style={{transform: `translateX(${activeIndex*33}px)`}} />
      <div className={`absolute left-0 top-0 w-[99px] h-[33px] ${trackClass} transition-colors duration-300 ease-in-out`} style={{width: count*33}}/>
      {Array.from({length: count}).map((_, i) => {
        return (
          <div key={i} className={`w-[33px] h-[33px] transition-colors duration-500 flex items-center justify-center z-10`}>
            <p className={`text-desktop-h6 font-riforma-regular transition-colors duration-300 ease-in-out ${activeIndex === i ? activeTextClass : textClass}`}>{i+1}</p>
          </div>
        )
      })}
    </div>
  )
}

const getHeadingPortableTextComponents = (isOrange: boolean, heightAware = false): PortableTextComponents => ({
  block: {
    normal: ({ children }) => (
      <span 
        className={`text-mobile-h2 sm:text-desktop-h3 ${heightAware ? 'max-h-lg:text-[48px] max-h-md:text-[42px] max-h-sm:text-[36px]' : ''} leading-[85%] font-riforma-regular tracking-[-4%] transition-colors duration-500 ${isOrange ? 'text-background' : 'text-black'}`}
        style={{ paddingTop: '0.2em', paddingBottom: '0.2em' }}
      >
        {children}
      </span>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-riforma-bold font-bold transition-colors duration-500">
        {children}
      </strong>
    ),
  },
})

const getCardTextPortableTextComponents = (isOrange: boolean): PortableTextComponents => ({
  block: {
    normal: ({ children }) => (
      <span className={`text-desktop-h6 max-h-lg:text-[24px] max-h-md:text-[22px] max-h-sm:text-[20px] leading-[85%] font-riforma-regular tracking-[-4%] transition-colors duration-500 ${isOrange ? 'text-background' : 'text-black'}`}>
        {children}
      </span>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-riforma-bold font-bold transition-colors duration-500">
        {children}
      </strong>
    ),
  },
})

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import GradientRevealText from '../common/GradientRevealText'
import { useRive, useViewModelInstanceNumber, useViewModelInstanceTrigger, useViewModelInstanceFont, useViewModelInstanceImage, useViewModelInstanceBoolean, decodeFont, decodeImage } from '@rive-app/react-webgl2'
import { urlForImage } from '@/sanity/lib/image'
import { RIVE_GATED, useRiveResize, useRiveRenderGate } from '@/app/utils/useRiveResize'
import { useRivFile, getRiveFonts } from '@/app/utils/riveAssets';

type RiveGraphicProps = { activeIndex: number, isPinned: boolean, fillHeight?: boolean, storeImage?: any, productImage?: any }

const RiveGraphic = ({ activeIndex, isPinned, fillHeight = false, storeImage, productImage }: RiveGraphicProps) => {
  const riveFile = useRivFile();
  const { rive, canvas, container, RiveComponent } = useRive(riveFile ? {
    riveFile,
    artboard: 'Storytelling Artboard',
    stateMachines: 'State Machine 1',
    autoplay: !fillHeight,
    autoBind: true, 
    shouldDisableRiveListeners: true, 
  } : undefined, RIVE_GATED);
  useRiveResize(rive, canvas, container);
  useRiveRenderGate(rive, canvas);

  const currentSlideProp = useViewModelInstanceNumber('currentSlide', rive?.viewModelInstance);
  
  const introTriggerProp = useViewModelInstanceTrigger('introTrigger', rive?.viewModelInstance);
  
  const fontProp = useViewModelInstanceFont('font', rive?.viewModelInstance);
  const fontBoldProp = useViewModelInstanceFont('boldFont', rive?.viewModelInstance);
  
  const storeImageProp = useViewModelInstanceImage('storeImage', rive?.viewModelInstance);
  const productImageProp = useViewModelInstanceImage('productImage', rive?.viewModelInstance);
  
  const isMobileProp = useViewModelInstanceBoolean('isMobile', rive?.viewModelInstance);
  
  const hasTriggered = useRef(false);
  const fontLoaded = useRef(false);
  const fontBoldLoaded = useRef(false);
  const storeImageLoaded = useRef<string | null>(null);
  const productImageLoaded = useRef<string | null>(null);

  useEffect(() => {
    fontLoaded.current = false;
    fontBoldLoaded.current = false;
    storeImageLoaded.current = null;
    productImageLoaded.current = null;
  }, [rive]);

  useEffect(() => {
    if (fontProp && fontBoldProp && fontProp.setValue && fontBoldProp.setValue && !fontLoaded.current) {
      fontLoaded.current = true;
      fontBoldLoaded.current = true;

      const loadFonts = async () => {
        try {
          const [regular, bold] = await getRiveFonts();
          fontProp.setValue(regular);
          fontBoldProp.setValue(bold);
        } catch (e) {
        }
      };

      loadFonts();
    }
  }, [fontProp, fontBoldProp]);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const storeImageUrl = storeImage?.asset?._ref ? urlForImage(storeImage)?.width(200).url() : storeImage?.asset?.url;
  const productImageUrl = productImage?.asset?._ref ? urlForImage(productImage)?.width(200).url() : productImage?.asset?.url;

  const loadImage = (prop: any, url: string | undefined, loadedUrl: React.MutableRefObject<string | null>, label: string) => {
    if (!prop?.setValue || !url || loadedUrl.current === url) return;
    loadedUrl.current = url;
    fetch(url)
      .then(res => res.arrayBuffer())
      .then(buffer => decodeImage(new Uint8Array(buffer)))
      .then(decoded => { if (mountedRef.current) prop.setValue(decoded); })
      .catch(e => {
        loadedUrl.current = null;
      });
  };

  useEffect(() => loadImage(storeImageProp, storeImageUrl, storeImageLoaded, 'storeImage'), [storeImageProp, storeImageUrl]);
  useEffect(() => loadImage(productImageProp, productImageUrl, productImageLoaded, 'productImage'), [productImageProp, productImageUrl]);

  useEffect(() => {
    if (currentSlideProp && currentSlideProp.setValue) {
      currentSlideProp.setValue(activeIndex + 1);
    }
  }, [activeIndex, currentSlideProp]);

  useEffect(() => {
    if (isMobileProp && isMobileProp.setValue) {
      isMobileProp.setValue(fillHeight);
    }
  }, [isMobileProp, fillHeight]);

  useEffect(() => {
    if (rive && isPinned && introTriggerProp && introTriggerProp.trigger && !hasTriggered.current) {
      if (fillHeight) rive.play();
      introTriggerProp.trigger();
      hasTriggered.current = true;
    }
  }, [rive, isPinned, introTriggerProp]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <RiveComponent className={`w-[100%] object-contain ${fillHeight ? 'h-full' : 'h-[80%]'}`} />
    </div>
  );
}

const CustomerStoryScreen = ({ 
  activeIndex, 
  slides, 
  isPinned,
  brandLogo,
  productImage
}: { 
  activeIndex: number, 
  slides: any[],
  isPinned: boolean,
  brandLogo?: any,
  productImage?: any
}) => {
  const currentSlide = slides[activeIndex] || {};
  
  const [displayHeading, setDisplayHeading] = useState(currentSlide.heading);
  const [displayText, setDisplayText] = useState(currentSlide.text);
  const [displayIsOrange, setDisplayIsOrange] = useState(currentSlide.backgroundColor?.toUpperCase() === '#FD4015');

  const bgRef = useRef<HTMLDivElement>(null);
  const graphicBgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const prevIsOrangeRef = useRef(currentSlide.backgroundColor?.toUpperCase() === '#FD4015');
  const isFirstRun = useRef(true);
  const delaysRef = useRef<gsap.core.Tween[]>([]);

  useGSAP((context, contextSafe) => {
    if (!contextSafe) return;
    if (!slides || slides.length === 0) return;
    const slide = slides[activeIndex];
    const isOrange = slide.backgroundColor?.toUpperCase() === '#FD4015';    
    const firstSlideIsOrange = slides[0]?.backgroundColor?.toUpperCase() === '#FD4015';    
    
    if (isFirstRun.current) {
      gsap.set("[data-gsap='customerstory-heading']",{
        "--gradient-color" : firstSlideIsOrange ? "#FDF6E2" : "#110F0B",
      });
      isFirstRun.current = false;
      return;
    }

    // cancel any scheduled callbacks from a previous fast scroll
    delaysRef.current.forEach(t => t.kill());
    delaysRef.current = [];

    // safety cleanup for any orphaned tweens
    gsap.killTweensOf([bgRef.current, graphicBgRef.current, textRef.current, "[data-gsap='customerstory-heading']"]);

    // swap colors
    gsap.to(bgRef.current, {
      backgroundColor: slide.backgroundColor,
      duration: 0.3,
      delay: 0.5,
      ease: "power2.inOut" 
    })

    gsap.to(graphicBgRef.current, {
      backgroundColor: slide.graphicBackground ? slide.graphicBackground.split(",")[0] : 'transparent',
      duration: 0.3,
      delay: 0.5,
      ease: "power2.inOut",
    });

    // heading exit
    gsap.set("[data-gsap='customerstory-heading']", {
      "--gradient-size": "120%",
      "--gradient-position": "110% 110%",            
    })
    gsap.to("[data-gsap='customerstory-heading']",{
      "--gradient-size": "0%",
      duration: 0.4,
    })
    gsap.to("[data-gsap='customerstory-heading']",{
      "--gradient-color" : prevIsOrangeRef.current ? "#0095EC" : "#FD4015",
      duration: 0.2,
    })


    // swap heading and color
    const safeSwap = contextSafe(() => {
      setDisplayIsOrange(isOrange);
      setDisplayHeading(slide.heading);
    });
    delaysRef.current.push(gsap.delayedCall(0.5, safeSwap));

    // heading enter
    const safeEnter = contextSafe(() => {
      gsap.set("[data-gsap='customerstory-heading']", {
        "--gradient-position" : "-20% -20%",
        "--gradient-color" : prevIsOrangeRef.current ? "#0095EC" : "#FD4015",
      })
      gsap.to("[data-gsap='customerstory-heading']",{
        "--gradient-size": "120%",
        duration: 0.4,
        delay: 0.2
      })
      gsap.to("[data-gsap='customerstory-heading']",{
        "--gradient-color" : isOrange ? "#FDF6E2" : "#110F0B",
        duration: 0.4,
        delay: 0.2
      })
    });
    delaysRef.current.push(gsap.delayedCall(0.5, safeEnter));

    // swap subtext
    gsap.to(textRef.current, {
      opacity: 0,
      y: 10,
      duration: 0.3,
    });

    const safeText = contextSafe(() => {
        setDisplayText(slide.text);
        gsap.to(textRef.current, { opacity: 1, y: 0, duration: 0.3 });
    });
    delaysRef.current.push(gsap.delayedCall(0.6, safeText));

    prevIsOrangeRef.current = isOrange;
  }, { dependencies: [activeIndex, slides.length], revertOnUpdate: false });

  return (
    <div className='w-full h-screen grid grid-cols-[50%_50%] xl:grid-cols-[50%_50%] items-end'>

      <div 
        ref={bgRef} 
        className='flex flex-col gap-[60px] max-h-lg:gap-[40px] max-h-md:gap-[30px] max-h-sm:gap-[20px] items-start h-[calc(100%-120px)] px-[60px] xl:px-[110px] pb-[105px] pt-[105px] max-h-lg:py-[70px] max-h-md:py-[48px] max-h-sm:py-[32px]'
        style={{ backgroundColor: slides[0]?.backgroundColor }}
      >

        <SlideIndicator
          activeIndex={activeIndex}
          count={slides.length}
          activeBoxClass={displayIsOrange ? "bg-background" : "bg-black"}
          trackClass={displayIsOrange ? "bg-[#FD643E]" : "bg-black/20"}
          activeTextClass={displayIsOrange ? "text-brand-orange" : "text-background"}
          textClass="text-background"
        />

        <div ref={titleRef} className='w-full xl:w-[90%] xl:max-w-[800px]!'>
          <GradientRevealText style={{
            "--gradient-size" : "120%",
            "--gradient-position": "0% 0%",            
          } as React.CSSProperties} dataGsap='customerstory-heading' value={displayHeading} components={getHeadingPortableTextComponents(displayIsOrange, true)}/>
        </div>
        <div ref={textRef} className='w-full xl:w-[90%] xl:max-w-[700px]! mt-auto'>
          <PortableText value={displayText} components={getCardTextPortableTextComponents(displayIsOrange)}/>
        </div>

      </div>

      <div 
        ref={graphicBgRef} 
        className='relative flex items-center justify-center w-full h-[calc(100%-120px)] px-[50px] overflow-hidden'
        style={{ backgroundColor: slides[0]?.graphicBackground ? slides[0]?.graphicBackground.split(",")[0] : 'transparent' }}
      >
        <RiveGraphic activeIndex={activeIndex} isPinned={isPinned} storeImage={brandLogo} productImage={productImage} />
      </div>

    </div>
  )
}

const mobileHeadingComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <span className='block text-mobile-h2 sm:text-tablet-h2 leading-[85%] font-riforma-regular tracking-[-4%] text-white'>
        {children}
      </span>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className='font-riforma-bold font-bold'>{children}</strong>
    ),
  },
}

const mobileTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <span className='block text-mobile-p2 sm:text-tablet-h5 leading-[100%] font-riforma-regular tracking-[-4%] text-white'>
        {children}
      </span>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className='font-riforma-bold font-bold'>{children}</strong>
    ),
  },
}

const CustomerStoryMobileSlide = ({ slide, index, count, brandLogo, productImage }: { slide: any, index: number, count: number, brandLogo?: any, productImage?: any }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [activeIndex,setActiveIndex] = useState(0);

  useGSAP(() => {
    gsap.set(`[data-gsap='customerstory-heading-mobile-${index}']`, {
      "--gradient-size": "0%",
      "--gradient-position": "-15% -15%",
      "--gradient-color" : mobileBackground == "#0095EC" ? "#FD4015" : "#0095EC",
    })

    gsap.to(`[data-gsap='customerstory-heading-mobile-${index}']`, {
      "--gradient-size": "120%",
      "--gradient-color": "#FDF6E2",
      scrollTrigger: {
        trigger: ref.current,
        start: "0% 50%",
        
        onEnter: () => {
          setIsInView(true)
          setActiveIndex(index);
        }
      }
    })
  },[])

  const mobileBackground = slide?.mobileBackgroundColor || '#0095EC';
  const isOrange = mobileBackground.toUpperCase() === '#FD4015';

  return (
    <div
      ref={ref}
      className='flex flex-col items-center text-center gap-[40px] w-full px-[30px] sm:px-[60px] py-[60px]'
      data-navcolorlistener='true'
      style={{ backgroundColor: mobileBackground }}
    >
      <SlideIndicator
        activeIndex={activeIndex}
        count={count}
        activeBoxClass={isOrange ? "bg-background" : "bg-black"}
        trackClass={isOrange ? "bg-[#FD643E]" : "bg-black/20"}
        activeTextClass={isOrange ? "text-brand-orange" : "text-background"}
        textClass="text-background"
      />

      {slide?.heading && (
        <div className='w-[90%] max-w-[800px] text-center'>
          <GradientRevealText style={{"--gradient-size" : "0%"} as React.CSSProperties} dataGsap={`customerstory-heading-mobile-${index}`} value={slide.heading} components={mobileHeadingComponents} />
        </div>
      )}

      <div className='relative w-full h-[80vw] md:h-[600px]'>
        <RiveGraphic activeIndex={index} isPinned={isInView} fillHeight storeImage={brandLogo} productImage={productImage} />
      </div>

      {slide?.text && (
        <div className='w-[80%] max-w-[650px] text-center'>
          <PortableText value={slide.text} components={mobileTextComponents} />
        </div>
      )}
    </div>
  );
}

const CustomerStoryMobile = ({ slides, brandLogo, productImage }: { slides: any[], brandLogo?: any, productImage?: any }) => {
  return (
    <div className='flex flex-col w-full'>
      {slides.map((slide, i) => (
        <CustomerStoryMobileSlide
          key={slide?._key ?? i}
          slide={slide}
          index={i}
          count={slides.length}
          brandLogo={brandLogo}
          productImage={productImage}
        />
      ))}
    </div>
  );
}

const subscribeLg = (cb: () => void) => {
  const mql = window.matchMedia('(min-width: 1140px)');
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
};

export default function CustomerStory({ block }: CustomerStoryBlockProps) {
  const spacingClasses = getSpacingClasses(block?.spacing);
  const slides = (block?.slides || []).filter(Boolean);
  
  const isDesktop = useSyncExternalStore(subscribeLg, () => window.matchMedia('(min-width: 1140px)').matches, () => false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  // sticky container
  const containerRef = useRef<HTMLDivElement>(null);
  // wrapper for the section
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      if (!containerRef.current || slides.length === 0 || containerRef.current.offsetParent === null) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrollProgress = -rect.top;
      let index = 0;
      let currentlyPinned = false;

      if (scrollProgress >= 0) {
        currentlyPinned = true;
        const maxScroll = rect.height - window.innerHeight;
        const progress = Math.max(0, Math.min(1, scrollProgress / maxScroll));
        index = Math.max(0, Math.min(Math.floor(progress * slides.length), slides.length - 1));
      }
      
      setActiveIndex(prev => (prev === index ? prev : index));
      setIsPinned(prev => (prev === currentlyPinned ? prev : currentlyPinned));
    };
    const handleScroll = () => {
      if (!raf) raf = requestAnimationFrame(update); // 
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [slides.length]);

  useGSAP(() => {
    const arrow = '[data-gsap="customerstory-arrowdown"]'
    gsap
      .timeline({ repeat: -1, repeatDelay: 1 })
      .to(arrow, { y: -16, duration: 0.35, ease: "power2.inOut" })
      .to(arrow, { y: 0, duration: 0.35, ease: "power2.inOut" })
      .to(arrow, { y: -16, duration: 0.35, ease: "power2.inOut" })
      .to(arrow, { y: 0, duration: 0.35, ease: "power2.inOut" })


    gsap.set("[data-gsap='customerstory-title']", {
      "--gradient-size": "0%",
      "--gradient-position": "-15% -15%",
      "--gradient-color" : "#FD4015",
    })
    gsap.to("[data-gsap='customerstory-title']", {
      "--gradient-size": "120%",
      "--gradient-color": "#110F0B",
      duration: 0.75,
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: "0% 50%",
      }
    })
  }, [])

  return (
    <section ref={wrapperRef} className={`w-full ${spacingClasses}`}>
      
      <div className='flex items-center sm:justify-between flex-col sm:flex-row sm:items-end sm:px-[40px] lg:px-[60px] xl:px-[110px] pb-[80px] lg:pb-0'>
        <div className='w-[300px] sm:w-[450px] text-center sm:text-left'>
          {block?.title && (
            <GradientRevealText dataGsap='customerstory-title' style={{
              "--gradient-size": "0%",
              "--gradient-position": "-15% -15%",
              "--gradient-color" : "#FD4015",
            } as React.CSSProperties} value={block.title as any} components={getHeadingPortableTextComponents(false)} />
          )}
        </div>
        <ArrowDown className='h-[44px] sm:h-[74px] mt-[20px] sm:mt-0'/>
      </div>

      {/* above lg: sticky scroll */}
      {isDesktop && <div>
        <div ref={containerRef} className="relative w-full" style={{ height: `calc(100vh + ${slides.length * 1000}px)` }}>
          <div className="sticky top-0 w-full h-screen overflow-hidden">
            {slides.length > 0 && (
              <CustomerStoryScreen 
                activeIndex={activeIndex} 
                slides={slides}
                isPinned={isPinned}
                brandLogo={block?.brandLogo}
                productImage={block?.productImage}
              />
            )}
          </div>
        </div>
      </div>}

      {/* below lg: stacked slides */}
      {!isDesktop && <div>
        {slides.length > 0 && <CustomerStoryMobile slides={slides} brandLogo={block?.brandLogo} productImage={block?.productImage} />}
      </div>}

    </section>
  )
}
