"use client"
import { useState, useEffect, useLayoutEffect, useMemo, Suspense, useRef } from 'react'
import type { SanityImageData } from '@/types/sanity'
import SanityImage from '../common/SanityImage'
import { Canvas, useFrame, useThree, createPortal } from '@react-three/fiber'
import { Environment, OrbitControls, useGLTF, useTexture, Preload } from '@react-three/drei'
import type { PerspectiveCamera } from 'three'
import * as THREE from 'three'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'
import Button from '../common/Button'
import LogoMarquee from '../common/LogoMarquee'
import GradientRevealText from '../common/GradientRevealText'
import {
  applyBoxDissolveShader,
  createDoorTransitionMaterial,
  createFakeShadowMaterial,
} from './Hero/heroShaders'
import { useLenis } from 'lenis/react'
import { useHeroScene } from './Hero/HeroSceneContext'
import InstancedGrass from './Hero/InstancedGrass'
import { useStickers } from './Hero/useStickers'
gsap.registerPlugin(ScrollTrigger, CustomEase)

// Linear for ~85%, then smoothly and gradually feathers to 0 velocity at the end
CustomEase.create(
  "linearSmoothEnd",
  "M0,0 L0.85,0.895 C0.9,0.947 0.94,1 1,1"
)

interface HeroData {
  heading?: string
  bottomText?: string
  button?: {
    text?: string
    href?: string
  }
  logoMarquee?: {
    _key?: string
    alt?: string
    image?: SanityImageData
  }[]
  firstText: string;
  secondText: string;
}

interface HeroProps {
  block?: HeroData
}

const Hero3DBox = ({
  stickersApplied = true,
  wobbleEnabled = true,
  mountToken,
}: {
  stickersApplied?: boolean
  wobbleEnabled?: boolean
  /** > 0 while a Hero is mounted. Intro + scroll animations are rebuilt for each mount. */
  mountToken: number
}) => {
  const { scene } = useGLTF('/gltf/box.glb')
  const { boxRef, wobbleRef, stickersRef, stickersReady, dissolveUniforms } = useStickers({ scene, wobbleEnabled })

  useGSAP(() => {
    if (!mountToken) return
    if (!stickersReady || stickersRef.current.length === 0) return
    if (!stickersApplied) return

    // Intro sticker
    const tlIntro = gsap.timeline({
      delay: 1.25,
    })

    stickersRef.current.forEach((sticker, i) => {
      const staggerOffset = i * 0.12
      tlIntro.fromTo(
        sticker,
        { opacity: 0 },
        { opacity: 1, ease: "power1.out", duration: 0.35 },
        staggerOffset
      )
      tlIntro.fromTo(
        sticker,
        { progress: 0 },
        { progress: 1, ease: "power2.out", duration: 1.5 },
        staggerOffset
      )
    })

    // Guarantee the end state even if a tween was skipped (long frame, tab throttling)
    tlIntro.call(() => {
      stickersRef.current.forEach((sticker) => {
        sticker.opacity = 1
        sticker.progress = 1
      })
    })
  }, { dependencies: [stickersReady, stickersApplied, mountToken], revertOnUpdate: true })

  useGSAP(() => {
    if (!mountToken) return
    dissolveUniforms.current.uDissolveProgress.value = 0
    dissolveUniforms.current.uDirection.value = 1.0

    // Dissolve
    gsap.fromTo(
      dissolveUniforms.current.uDissolveProgress,
      { value: 0 },
      {
        value: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-gsap='hero']",
          start: "35% 50%",
          end: "50% 50%",
          scrub: true,
          onEnter: () => {
            dissolveUniforms.current.uDirection.value = 1.0
          },
          onLeaveBack: () => {
            dissolveUniforms.current.uDirection.value = 1.0
          },
        },
      }
    )

    // Undo Dissolve
    gsap.fromTo(
      dissolveUniforms.current.uDissolveProgress,
      { value: 1 },
      {
        value: 0,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: "[data-gsap='hero']",
          start: "70% 50%",
          end: "80% 50%",
          scrub: true,
          onEnter: () => {
            dissolveUniforms.current.uDirection.value = 0.0
          },
          onLeaveBack: () => {
            dissolveUniforms.current.uDirection.value = 1.0
          },
        },
      }
    )
  }, { dependencies: [mountToken], revertOnUpdate: true })

  useGSAP(() => {
    if (!mountToken || !stickersReady || !boxRef.current) return

    gsap.fromTo(
      boxRef.current.rotation,
      { x: 1, y: -0.7, z: -1 },
      {
        x: 0.29,
        y: -0.7,
        z: -0.2,
        ease: "back.out(0.5)",
        duration: 2,
        delay: 0.25
      }
    )

     gsap.fromTo(
      boxRef.current.position,
      { x: 0, y: 7, z: 0 },
      {
        y: -0.5,
        ease: "back.out(0.5)",
        duration: 2,
        delay: 0.25
      }
    )


    gsap.fromTo(
      boxRef.current.rotation,
      { x: 0.29, y: -0.7, z: -0.2 },
      {
        x: 0.1,
        y: -2.5,
        z: -0.2,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-gsap='hero']",
          start: "18% 50%",
          end: "45% 50%",
          scrub: true,
        },
      }
    )

    gsap.fromTo(
      boxRef.current.rotation,
      { x: 0.1, y: -1.5, z: -0.35 },
      {
        x: 0.1,
        y: -1,
        z: 0,
        ease: "linearSmoothEnd",
        immediateRender: false,
        scrollTrigger: {
          trigger: "[data-gsap='hero']",
          start: "90% bottom",
          end: "100% bottom",
          scrub: true,
        },
      }
    )

     const posProxy = { y: 2, z: 0 };
    gsap.fromTo(
      posProxy,
      { y: 2, z: 0 },
      {
        y: () => window.innerWidth < 768 ? -1.9 : -1.8,
        z: 1.5,
        ease: "linearSmoothEnd",
        immediateRender: false,
        scrollTrigger: {
          trigger: "[data-gsap='hero']",
          start: "75% bottom",
          end: "100% bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: () => {
            if (boxRef.current) {
              boxRef.current.position.y = posProxy.y;
              boxRef.current.position.z = posProxy.z;
            }
          },
          onLeaveBack: () => {
            if (!boxRef.current) return;
           gsap.set(boxRef.current?.position, { y: -0.5, z: 0 }) 
          }
        },
      }
    )

    gsap.fromTo(
      posProxy,
      { y: () => window.innerWidth < 768 ? -1.9 : -1.8, z: 1.5 },
      {
        y: () => window.innerWidth < 768 ? -4.9 : -4.8,
        z: 1.5,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: "[data-gsap='hero-outer']",
          start: "102% bottom",
          end: "150% bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: () => {
            if (boxRef.current) {
              boxRef.current.position.y = posProxy.y;
              boxRef.current.position.z = posProxy.z;
            }
          },
        },
      }
    )

    gsap.fromTo(
      boxRef.current.scale,
      { x: 1, y: 1, z: 1 },
      {
        x: 0.8,
        y: 0.8,
        z: 0.8,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: "[data-gsap='hero']",
          start: "75% bottom",
          end: "100% bottom",
          scrub: true,
        },
      }
    )
  }, { dependencies: [stickersReady, mountToken], revertOnUpdate: true })

  // While no hero is on the page, park the box in its intro start pose so the next
  // visit never shows a stale pose for a frame (runs after the reverts above).
  useEffect(() => {
    if (mountToken || !boxRef.current) return
    boxRef.current.position.set(0, 7, 0)
    boxRef.current.rotation.set(1, -0.7, -1)
    boxRef.current.scale.set(1, 1, 1)
    stickersRef.current.forEach((s) => {
      s.opacity = 0
      s.progress = 0
    })
  }, [mountToken, stickersReady])



  return (
    <group
      ref={boxRef}
      position={[0, 7, 0]}
      rotation={[1, -0.7, -1]}
    >
      <group ref={wobbleRef}>
        <primitive object={scene} />
      </group>
    </group>
  )
}



const HighResModel = ({ url, onLoad }: { url: string, onLoad: (scene: THREE.Group) => void }) => {
  const { scene } = useGLTF(url)
  useEffect(() => {
    if (scene) onLoad(scene.clone() as THREE.Group)
  }, [scene, onLoad])
  return null
}

const Hero3DBase = ({ mountToken }: { mountToken: number }) => {
  const { scene: lowResScene } = useGLTF("/gltf/base.glb")
  const [highResScene, setHighResScene] = useState<THREE.Group | null>(null)
  const scene = highResScene || lowResScene

  const [doorTexture, doorBlueTexture] = useTexture([
    '/assets/door.png',
    '/assets/door_blue.png',
  ])

  const grassPlaneMesh = useMemo(() => {
    let found: THREE.Mesh | null = null
    scene.traverse((child: any) => {
      // Look for a mesh specifically named GrassPlane to use as the spawn area
      if (child.isMesh && child.name.toLowerCase().includes('grass')) {
        found = child
        child.visible = false // Hide the spawn mesh so it doesn't render
      }
    })
    return found
  }, [scene])

  useEffect(() => {
    doorTexture.flipY = false
    doorTexture.colorSpace = THREE.SRGBColorSpace
    doorTexture.needsUpdate = true

    doorBlueTexture.flipY = false
    doorBlueTexture.colorSpace = THREE.SRGBColorSpace
    doorBlueTexture.needsUpdate = true
  }, [doorTexture, doorBlueTexture])

  const baseRef = useRef<THREE.Group>(null!)
  const doorUniforms = useRef({
    uTextureA: { value: doorTexture },
    uTextureB: { value: doorBlueTexture },
    uProgress: { value: 0 },
    uTime: { value: 0 },
  })

  doorUniforms.current.uTextureA.value = doorTexture
  doorUniforms.current.uTextureB.value = doorBlueTexture

  const shadowUniforms = useRef({
    uOpacity: { value: 0 },
    uShadowColor: { value: new THREE.Color('#0c0a08') },
  })

  useFrame((_, delta) => {
    doorUniforms.current.uTime.value += delta
  })

  const doorMaterial = useMemo(() => {
    return createDoorTransitionMaterial(doorUniforms.current)
  }, [])

  const shadowMaterial = useMemo(() => {
    return createFakeShadowMaterial(shadowUniforms.current)
  }, [])

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.name === 'Mesh030' || child.material?.name === 'palermo') {
          child.material = doorMaterial
        }
        if (child.name === 'box_shadow' || child.name.toLowerCase().includes('shadow')) {
          child.material = shadowMaterial
        }
      }
    })
  }, [scene, doorMaterial, shadowMaterial])

  useGSAP(() => {
    if (!mountToken) return
    doorUniforms.current.uProgress.value = 0
    shadowUniforms.current.uOpacity.value = 0

    gsap.to(baseRef.current.rotation, {
      x: 0.1,
      ease: "linearSmoothEnd",
      scrollTrigger: {
        trigger: "[data-gsap='hero']",
        start: "50% bottom",
        end: "bottom bottom",
        scrub: true,
      }
    })
    gsap.to(baseRef.current.position, {
      y: -6.5,
      ease: "linearSmoothEnd",
      scrollTrigger: {
        trigger: "[data-gsap='hero']",
        start: "50% bottom",
        end: "bottom bottom",
        scrub: true,
      },
    })

    const basePosProxy = { y: -6.5 }
    gsap.fromTo(
      basePosProxy,
      { y: -6.5 },
      {
        y: -10.5,
        ease: "linear",
        immediateRender: false,
        scrollTrigger: {
          trigger: "[data-gsap='hero-outer']",
          start: "102% bottom",
          end: "150% bottom",
          scrub: true,
          onUpdate: () => {
            if (baseRef.current) {
              baseRef.current.position.y = basePosProxy.y
            }
          },
        },
      }
    )

    // Door texture transition
    gsap.fromTo(
      doorUniforms.current.uProgress,
      { value: 0 },
      {
        value: 1,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: "[data-gsap='hero']",
          start: "55% 50%",
          end: "85% 50%",
          scrub: true,
          onLeaveBack: () => {
            doorUniforms.current.uProgress.value = 0
          },
        },
      }
    )

    // Fake shadow
    gsap.fromTo(
      shadowUniforms.current.uOpacity,
      { value: 0 },
      {
        value: 0.8,
        ease: "power1.in",
        immediateRender: false,
        scrollTrigger: {
          trigger: "[data-gsap='hero']",
          start: "55% 50%",
          end: "80% 50%",
          scrub: true,
          onLeaveBack: () => {
            shadowUniforms.current.uOpacity.value = 0
          },
        },
      }
    )
  }, { dependencies: [mountToken], revertOnUpdate: true })

  return (
    <group ref={baseRef} position={[0, -25, -13]} rotation={[0.5, 0, 0]}>
      <primitive object={scene} />
      <InstancedGrass samplerMesh={grassPlaneMesh} />
      <Suspense fallback={null}>
        {!highResScene && (
          <HighResModel
            url="/gltf/base_high.glb"
            onLoad={setHighResScene}
          />
        )}
      </Suspense>
    </group>
  )
}

const DirectionalLightWithControls = () => {
  return (
    <>
      <directionalLight
        position={[4.5, 1.5, 0.0]}
        intensity={5}
        color={"#ffdea4"}
      />
      <directionalLight
        position={[-20, 5, 5]}
        intensity={5}
        color={"#ffffff"}
      />
    </>
  )
}

const CameraController = () => {
  const camera = useThree(state => state.camera as PerspectiveCamera)

  useEffect(() => {
    if (!camera) return
    
    const handleResize = () => {
      const verticalFov = 2 * Math.atan(24 / (2 * 110)) * (180 / Math.PI)
      camera.fov = verticalFov
      
      const isMobile = window.innerWidth < 768
      camera.position.z = isMobile ? 40 : 35
      
      camera.updateProjectionMatrix()
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [camera])

  return null
}



const SceneWarmup = ({ target, onReady }: { target: THREE.Scene; onReady: () => void }) => {
  const gl = useThree((s) => s.gl)
  const camera = useThree((s) => s.camera)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        await gl.compileAsync(target, camera)
      } catch {
        gl.compile(target, camera)
      }
      // force one real draw of everything with frustum culling off.
      const culled: THREE.Object3D[] = []
      target.traverse((o) => {
        if (o.frustumCulled) {
          culled.push(o)
          o.frustumCulled = false
        }
      })
      target.updateMatrixWorld(true)
      try {
        gl.render(target, camera)
      } finally {
        culled.forEach((o) => (o.frustumCulled = true))
      }
      // let the render loop settle for a few frames
      for (let i = 0; i < 2; i++) {
        await new Promise((r) => requestAnimationFrame(r))
      }
      if (!cancelled) onReady()
    }
    run()
    return () => {
      cancelled = true
    }
  }, [gl, camera, target, onReady])

  return null
}

export const HeroScenes = ({
  wobbleEnabled,
  mountToken,
  onReady,
}: {
  wobbleEnabled: boolean
  mountToken: number
  onReady: () => void
}) => {
  const baseScene = useMemo(() => new THREE.Scene(), [])
  const boxScene = useMemo(() => new THREE.Scene(), [])

  const readyCount = useRef(0)
  const handleReady = useMemo(
    () => () => {
      readyCount.current += 1
      if (readyCount.current === 2) onReady()
    },
    [onReady],
  )

  // a positive priority takes over R3F's automatic render
  useFrame(({ gl, camera }) => {
    const autoClear = gl.autoClear
    gl.autoClear = false
    gl.clear()
    gl.render(baseScene, camera)
    gl.clearDepth()
    gl.render(boxScene, camera)
    gl.autoClear = autoClear
  }, 1)

  return (
    <>
      <CameraController />
      {createPortal(
        <Suspense fallback={null}>
          <Hero3DBase mountToken={mountToken} />
          <SceneWarmup target={baseScene} onReady={handleReady} />
        </Suspense>,
        baseScene,
      )}
      {createPortal(
        <>
          <Environment preset='forest' environmentIntensity={1} />
          <DirectionalLightWithControls />
          <Suspense fallback={null}>
            <Hero3DBox wobbleEnabled={wobbleEnabled} mountToken={mountToken} />
            <SceneWarmup target={boxScene} onReady={handleReady} />
          </Suspense>
        </>,
        boxScene,
      )}
    </>
  )
}

const HeroTexts = ({ firstText, secondText }: { firstText: string, secondText: string }) => {
  const [text, setText] = useState(firstText)

  useEffect(() => {
    if (!firstText) return
    setText(firstText)
  }, [firstText])

  useGSAP(() => {
    gsap.fromTo(
      "[data-gsap='first-heading']",
      {
        "--gradient-size": "0%",
      },
      {
        "--gradient-size": "120%",
        ease: "none",
        scrollTrigger: {
          trigger: "[data-gsap='hero']",
          start: "60% bottom",
          end: "75% bottom",
          scrub: true,
          id: "heading-reveal",
          onEnterBack: () => {
            gsap.set("[data-gsap='first-heading']", {
              "--gradient-position": "-14% -14%",
            })
          }
        },
      }
    )

    gsap.fromTo(
      "[data-gsap='first-heading']",
      {
        "--gradient-color": "rgb(0, 149, 236)",
      },
      {
        "--gradient-color": "#FDF6E2",
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: "[data-gsap='hero']",
          start: "68% bottom",
          end: "75% bottom",
          scrub: true,
          id: "heading-color",
          onLeave: () => {
            gsap.set("[data-gsap='first-heading']", {
              "--gradient-position": "110% 110%",
            })
          }
        },
      }
    )

    gsap.fromTo(
      "[data-gsap='first-heading']",
      {
        "--gradient-size": "120%",
        "--gradient-color": "#FDF6E2",
      },
      {
        "--gradient-size": "0%",
        "--gradient-color": "rgb(0, 149, 236)",
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: "[data-gsap='hero']",
          start: "78% bottom",
          end: "83% bottom",
          scrub: true,
          id: "heading-color",
        },
      }
    )

    gsap.fromTo(
      "[data-gsap='first-heading']",
      {
        "--gradient-size": "0%",
      },
      {
        "--gradient-size": "120%",
        ease: "none",
        scrollTrigger: {
          trigger: "[data-gsap='hero']",
          start: "83% bottom",
          end: "98% bottom",
          scrub: true,
          id: "heading-reveal",
          onEnter: () => {
            gsap.set("[data-gsap='first-heading']", {
              "--gradient-position": "-14% -14%",
            })
            setText(secondText)
          },
          onLeaveBack: () => {
            gsap.set("[data-gsap='first-heading']", {
              "--gradient-position": "110% 110%",
            })
            setText(firstText)

          },
        },
      }
    )

    gsap.fromTo(
      "[data-gsap='first-heading']",
      {
        "--gradient-color": "rgb(0, 149, 236)",
      },
      {
        "--gradient-color": "#FDF6E2",
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: "[data-gsap='hero']",
          start: "90% bottom",
          end: "98% bottom",
          scrub: true,
          id: "heading-color",
          onLeave: () => {
            gsap.set("[data-gsap='first-heading']", {
              "--gradient-position": "115% 115%",
            })
          },
          onEnterBack: () => {
            gsap.set("[data-gsap='first-heading']", {
              "--gradient-position": "-14% -14%",
            })
          }
        },
      }
    )


    gsap.fromTo(
      "[data-gsap='first-heading']",
      {
        "--gradient-size": "120%",
        "--gradient-color": "#FDF6E2",
      },
      {
        "--gradient-size": "0%",
        "--gradient-color": "rgb(0, 149, 236)",
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: "[data-gsap='hero']",
          start: "110% bottom",
          end: "120% bottom",
          scrub: true,
          id: "heading-color",
        },
      }
    )


  }, [firstText, secondText])

  return (
    <div data-gsap="heading-wrapper" className='sticky top-0 w-full h-[100dvh] -mb-[100dvh] z-[51] pointer-events-none'>
      <div className='relative w-full h-full'>
        <GradientRevealText
          dataGsap="first-heading"
          text={text}
          fixFirefox={true}
          className='absolute top-[30dvh] left-1/2 -translate-x-1/2 -translate-y-1/2 text-black font-riforma-bold leading-[85%] tracking-[-6%] sm:whitespace-pre-line text-balance text-center select-none pb-[20px] px-[40px] w-full md:w-[865px]
          [--tw:9vw] md:[--tw:67px] lg:[--tw:84px] 
          max-h-lg:[--th:74px] max-h-md:[--th:64px] max-h-sm:[--th:54px] 
          text-[length:min(var(--tw),var(--th,var(--tw)))]'
        />
      </div>
    </div>
  )
}


const HeroTitle = ({ heading }: { heading: string }) => {

  useGSAP(() => {
    gsap.fromTo(
      "[data-gsap='hero-heading']",
      {
        "--gradient-size": "0%",
      },
      {
        "--gradient-size": "120%",
        ease: "power1.out",
        duration: 1.25,
        delay: 1.25
      }
    )

    gsap.fromTo(
      "[data-gsap='hero-heading']",
      {
        "--gradient-color": "rgb(0, 149, 236)",
      },
      {
        "--gradient-color": "#FDF6E2",
        ease: "power1.out",
        duration: 0.75,
        delay: 1.35
      }
    )



  }, [heading])

  return (
      <div className='relative w-full h-full'>
        <GradientRevealText
          dataGsap="hero-heading"
          text={heading}
          fixFirefox={false}
          className='font-riforma-bold tracking-[-6%] leading-[85%] text-background w-full md:w-[750px] lg:w-[865px] lg:whitespace-pre-line text-center px-[40px] pb-[20px] 
          [--tw:9vw] md:[--tw:67px] lg:[--tw:84px]
          max-h-lg:[--th:74px] max-h-md:[--th:64px] max-h-sm:[--th:54px]
          text-[length:min(var(--tw),var(--th,var(--tw)))] 
          [--mb-w:135px] md:[--mb-w:125px]
          md:max-h-lg:[--mb-h:125px] md:max-h-md:[--mb-h:90px] md:max-h-sm:[--mb-h:50px] 
          mb-[min(var(--mb-w),var(--mb-h,var(--mb-w)))]'
          style={{
            '--gradient-position': '-12% -12%'
          } as React.CSSProperties}
        />
      </div>
  )
}


export default function Hero({ block }: HeroProps) {
  const [heroMounted,setHeroMounted] = useState(false);
  const lenis = useLenis();
  // The WebGL scene is built once by HeroSceneProvider
  const { attach, setHeroInView, setWobbleEnabled } = useHeroScene()
  const slotRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!slotRef.current) return
    return attach(slotRef.current)
  }, [attach])

  useEffect(() => {
    if (!lenis) return;
    setTimeout(() => {
    lenis?.stop();
    }, 0);
    setTimeout(() => {
      setHeroMounted(true)
    }, 1);
    gsap.delayedCall(2.6,() => lenis.start())
  },[lenis])


  useGSAP(() => {
    
    gsap.fromTo("[data-gsap='left-cloud-wrapper-1'],[data-gsap='right-cloud-wrapper-1'],[data-gsap='left-cloud-wrapper-2'],[data-gsap='right-cloud-wrapper-2']", {yPercent: 130}, {
      yPercent: 0,
      duration: 1.75,
      ease: "back.out(0.5)",
      stagger: 0.15,
      delay: 0.25
    })

      gsap.fromTo("[data-gsap='left-cloud-wrapper-1'],[data-gsap='right-cloud-wrapper-1'],[data-gsap='left-cloud-wrapper-2'],[data-gsap='right-cloud-wrapper-2']",{y:0}, {
      y: 25,
      duration: 3,
      yoyo: true,
      repeat: -1,
      delay: 1,
      stagger: 0.15,
      ease: "power1.inOut"
    })

    gsap.to("[data-gsap='left-cloud-1'],[data-gsap='right-cloud-2'],[data-gsap='left-cloud-2'],[data-gsap='right-cloud-1']", {
      yPercent: -45,
      ease: "none",
      scrollTrigger: {
        trigger: "[data-gsap='hero']",
        start: "17% 50%",
        end: "60% 50%",
        scrub: true,
        
      }
    })

    gsap.fromTo("[data-gsap='hero-init']",{
      opacity: 0
    },{
      opacity: 1,
      duration: 1,
      delay: 1,
      ease: "power1.out"
    })

    gsap.fromTo("[data-gsap='hero-dim']",{
      opacity: 0
    },{
      opacity: 1,
      scrollTrigger: {
        trigger: "[data-gsap='hero']",
        start: "17% 50%",
        end: "45% 50%",
        scrub: true,
      }
    }    
  )    



    gsap.fromTo("[data-gsap='hero-cover']",{
      opacity: 0
    },{
      opacity: 0.90,
      scrollTrigger: {
        trigger: "[data-gsap='hero-outer']",
        start: "100% bottom",
        end: "150% bottom",
        scrub: true,
      }
    }    
  )    
  })

  useGSAP(() => {
    const duration = 10
          const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'none' } })

    gsap.set("[data-gsap='left-cloud-1']", { xPercent: 0, opacity: 1 })
    gsap.set("[data-gsap='left-cloud-2']", { xPercent: 30, opacity: 0 })

    tl.to("[data-gsap='left-cloud-1']", { xPercent: -30, opacity: 0, duration: duration })
      .to("[data-gsap='left-cloud-2']", { xPercent: 0, opacity: 1, duration: duration }, 0)
      .set("[data-gsap='left-cloud-1']", { xPercent: 30, opacity: 0 })
      .to("[data-gsap='left-cloud-2']", { xPercent: -30, opacity: 0, duration: duration })
      .to("[data-gsap='left-cloud-1']", { xPercent: 0, opacity: 1, duration: duration }, "<")

    const tl2 = gsap.timeline({ repeat: -1, defaults: { ease: 'none' } })

    gsap.set("[data-gsap='right-cloud-1']", { xPercent: 0, opacity: 1 })
    gsap.set("[data-gsap='right-cloud-2']", { xPercent: 30, opacity: 0 })

    tl2.to("[data-gsap='right-cloud-1']", { xPercent: -30, opacity: 0, duration: duration })
      .to("[data-gsap='right-cloud-2']", { xPercent: 0, opacity: 1, duration: duration }, 0)
      .set("[data-gsap='right-cloud-1']", { xPercent: 30, opacity: 0 })
      .to("[data-gsap='right-cloud-2']", { xPercent: -30, opacity: 0, duration: duration })
      .to("[data-gsap='right-cloud-1']", { xPercent: 0, opacity: 1, duration: duration }, "<")
  }, [])

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: "[data-gsap='hero']",
      start: "90% bottom",
      
      onEnter: () => setWobbleEnabled(false),
      onLeaveBack: () => setWobbleEnabled(true),
    })
  }, [])

  // stop webgl render loop outside of hero
  const outerRef = useRef<HTMLDivElement>(null)
  const [heroInView, setLocalInView] = useState(true)
  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setLocalInView(entry.isIntersecting)
        setHeroInView(entry.isIntersecting)
      },
      { rootMargin: '100px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const clouds = gsap.getTweensOf(
      "[data-gsap='left-cloud-wrapper-1'],[data-gsap='right-cloud-wrapper-1'],[data-gsap='left-cloud-wrapper-2'],[data-gsap='right-cloud-wrapper-2']"
    )
    clouds.forEach(t => (t.repeat() === -1 ? (heroInView ? t.resume() : t.pause()) : null))
  }, [heroInView])

  //

  if (!setHeroMounted) return;

  return (
    <div ref={outerRef} data-gsap='hero-outer' className="w-full max-h-[280dvh] min-h-[280dvh] relative bg-background overflow-x-clip">
      <div data-gsap="hero" className="absolute top-0 left-0 w-full max-h-[280dvh] min-h-[280dvh] pointer-events-none" />
      <div data-gsap='hero-cover' className='absolute top-0 left-0 w-full h-full bg-black z-50 opacity-0 pointer-events-none select-none' />
      {block?.firstText && (
          <HeroTexts firstText={block?.firstText} secondText={block?.secondText} />
      )}

      {/* Behind the box (z-0) */}
      <div className='flex items-center justify-center flex-col gap-[15px] max-h-md:gap-[10px] max-h-sm:gap-[5px] absolute top-0 left-0 w-full h-[70dvh] z-0 pointer-events-none bg-linear-to-t from-[#FDF6E2] to-[#0095EC]'>

        <div data-gsap="hero-init" className='flex flex-col md:flex-row gap-[5px] md:gap-[15px] items-center justify-center min-h-xl:-translate-y-[6dvh]'>
          <p className='font-riforma-bold tracking-[3px] leading-[110%] text-[14px] text-background text-center'>RATED 5 STARS ON SHOPIFY</p>
          <p className='flex items-center justify-center gap-[6px] font-riforma-regular leading-[110%] text-[16px] text-background text-center'>
            <span>5.0</span>
            <span className='inline-flex items-center justify-center'>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
                <path d="M5.90796 0.484368C6.29662 -0.161452 7.23292 -0.161453 7.62158 0.484367L9.1796 3.07326C9.31922 3.30527 9.54697 3.47074 9.81078 3.53184L12.7544 4.21359C13.4887 4.38366 13.7781 5.27413 13.284 5.84334L11.3032 8.12511C11.1257 8.3296 11.0387 8.59734 11.0621 8.86711L11.3234 11.8773C11.3886 12.6283 10.6311 13.1786 9.93704 12.8846L7.15486 11.7059C6.90553 11.6003 6.62401 11.6003 6.37468 11.7059L3.5925 12.8846C2.89847 13.1786 2.14099 12.6283 2.20616 11.8773L2.46741 8.86711C2.49082 8.59734 2.40383 8.3296 2.22632 8.12511L0.24559 5.84334C-0.248518 5.27413 0.040812 4.38366 0.775126 4.21359L3.71876 3.53184C3.98257 3.47074 4.21032 3.30527 4.34994 3.07326L5.90796 0.484368Z" fill="#FDDE15"/>
              </svg>
            </span>
            <span>across 55 reviews</span>
          </p>
        </div>

        {block?.heading && (
          <div className='min-h-xl:-translate-y-[6dvh]'>
            <HeroTitle heading={block?.heading}/>
          </div>
        )}
      </div>

      <div
        data-canvas="scene"
        className="sticky top-0 w-full h-[100dvh] z-10 pointer-events-none mb-[calc(100dvh-100dvh)]"
      >
        {/* the persistent canvas from HeroSceneProvider is moved in here */}
        <div ref={slotRef} className="relative w-full h-[100dvh] pointer-events-none" />
      </div>

      {/* Left cloud (behind box, z-0) */}
      <div data-gsap="left-cloud-wrapper-1" className='absolute top-0 left-0 w-full h-[70dvh] z-0 pointer-events-none mix-blend-screen'>
        <div className='absolute bottom-[-150px] left-1/2 
        w-[1000px] ml-[-700px] md:ml-[-1000px]  lg:ml-[-1500px] lg:w-[1500px] h-fit'>
          <img
            src="/assets/c3.jpg"
            alt=""
            data-gsap="left-cloud-1"
            className='w-full h-full pointer-events-none select-none object-contain'
          />
        </div>
      </div>
      <div data-gsap="left-cloud-wrapper-2" className='absolute top-0 left-0 w-full h-[70dvh] z-0 pointer-events-none mix-blend-screen'>
        <div className='absolute bottom-[-150px] left-1/2 
        ml-[-700px] md:ml-[-1000px] w-[1000px] lg:ml-[-1500px] lg:w-[1500px]  h-fit'>
          <img
            src="/assets/c2.jpg"
            alt=""
            data-gsap="left-cloud-2"
            className='w-full h-full pointer-events-none select-none object-contain opacity-0'
          />
        </div>
      </div>

      {/* Right cloud (z-20) */}
      <div data-gsap="right-cloud-wrapper-1" className='absolute top-0 left-0 w-full h-[70dvh] z-20 pointer-events-none mix-blend-screen'>
       
        <div className='absolute bottom-[-150px] left-1/2 
        w-[1000px] ml-[0px] md:w-[1000px] md:ml-[155px] lg:ml-[100px] lg:w-[1500px] h-fit'>
          <img
          src="/assets/c4.jpg"
          alt=""
          data-gsap="right-cloud-1"
          className=' w-full h-full pointer-events-none select-none object-contain '
        />
        </div>
      </div>
      <div data-gsap="right-cloud-wrapper-2" className='absolute top-0 left-0 w-full h-[70dvh] z-20 pointer-events-none mix-blend-screen'>
        <div className='absolute bottom-[-150px] left-1/2 
        w-[1000px] ml-[0px] md:w-[1000px] md:ml-[155px] lg:ml-[100px] lg:w-[1500px] h-fit'>
          <img
          src="/assets/c1.jpg"
          alt=""
          data-gsap="right-cloud-2"
          className=' w-full h-full pointer-events-none select-none object-contain opacity-0'
        />
        </div>
      </div>

      {/* Bottom part */}
      <div data-gsap="hero-init" className='absolute z-[2] pointer-events-auto flex flex-col items-center w-full
      top-[calc(100dvh-180px)]
      md:top-[calc(100dvh-220px)] md:max-h-lg:top-[calc(100dvh-180px)] md:max-h-md:top-[calc(100dvh-140px)] md:max-h-sm:top-[calc(100dvh-130px)] 
      gap-[40px] md:gap-[50px] 
      md:max-h-md:gap-[40px] md:max-h-sm:gap-[20px]
      min-h-xl:top-[calc(95dvh-180px)]'>

          <div className='flex flex-col md:flex-row gap-[15px] md:gap-[35px] items-center'>
            <p className='text-black font-riforma-bold text-[22px] md:text-[28px] leading-[110%]'>{block?.bottomText}</p>
            {block?.button?.text && block?.button?.href && (
              <Button className='px-[17px] py-[10px] md:px-[30px] md:py-[13px]' text={block?.button?.text} href={block?.button?.href} />
            )}
          </div>

            {block?.logoMarquee && (
          <LogoMarquee direction="right" logos={block?.logoMarquee} />
            )}
      </div>


      {/* Hero dim */}
      <div data-gsap="hero-dim" className='opacity-0 w-full h-[50dvh] bg-linear-to-b from-[#110F0B]/90 to-[#110F0B00] sticky top-0 left-0 -mt-[100dvh] z-50 pointer-events-none select-none' />
      
    </div>
  )
}