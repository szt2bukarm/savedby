"use client"
import { useState, useEffect, useMemo, Suspense, useRef } from 'react'
import type { SanityImageData } from '@/types/sanity'
import SanityImage from '../common/SanityImage'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, OrbitControls, useGLTF, useTexture } from '@react-three/drei'
import type { PerspectiveCamera } from 'three'
import * as THREE from 'three'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Button from '../common/Button'
import { applyBoxDissolveShader, createDoorTransitionMaterial, createFakeShadowMaterial } from './heroShaders'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

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

interface StickerItem {
  name: string
  mesh: THREE.Mesh
  origPositions: Float32Array
  origNormals: Float32Array
  minU: number
  maxU: number
  basePos: THREE.Vector3
  outwardNormal: THREE.Vector3
  progress: number
  opacity: number
}

const Hero3DBox = ({
  stickersApplied = true,
  wobbleEnabled = true,
}: {
  stickersApplied?: boolean
  wobbleEnabled?: boolean
}) => {
  const { scene } = useGLTF('/gltf/box.glb')
  const boxRef = useRef<THREE.Group>(null)
  const wobbleRef = useRef<THREE.Group>(null)
  const wobbleAmountRef = useRef(0.08)
  const stickersRef = useRef<StickerItem[]>([])
  const box3Ref = useRef(new THREE.Box3())

  const [stickersReady, setStickersReady] = useState(false)

  const dissolveUniforms = useRef({
    uDissolveProgress: { value: 0 },
    uDissolveColor: { value: new THREE.Color('#1583fd') },
    uCoreColor: { value: new THREE.Color('#59a2ff') },
    uGlowWidth: { value: 0.28 }, // Radiant glow width
    uWaveAmount: { value: 0.09 }, // Organic wave curvature across the sweep
    uWaveFrequency: { value: 1.0 }, // Harmonic scale
    uWaveSpeed: { value: 1.1 }, // Living fluid animation speed
    uTime: { value: 0 },
    uDirection: { value: 1.0 }, // 1.0 = top-to-bottom, 0.0 = bottom-to-top
    uMinY: { value: -1.3 },
    uMaxY: { value: 0.8 },
  })

  const floatDistance = 0.45
  const curlHeight = 1.2

  useEffect(() => {
    const items: StickerItem[] = []
    scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach((mat: any) => {
          applyBoxDissolveShader(mat, dissolveUniforms.current)
          mat.needsUpdate = true
        })
      }

      if (child.isMesh && /^sticker/i.test(child.name)) {
        const geom = child.geometry
        if (!geom || !geom.attributes.position || !geom.attributes.normal) return

        const origPositions = Float32Array.from(geom.attributes.position.array)
        const origNormals = Float32Array.from(geom.attributes.normal.array)

        let minU = Infinity
        let maxU = -Infinity
        for (let i = 0; i < origPositions.length; i += 3) {
          const u = origPositions[i] + origPositions[i + 2]
          if (u < minU) minU = u
          if (u > maxU) maxU = u
        }

        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map((m: any) => {
              const cloned = m.clone()
              cloned.transparent = true
              cloned.opacity = 1
              return cloned
            })
          } else {
            const cloned = child.material.clone()
            cloned.transparent = true
            cloned.opacity = 1
            child.material = cloned
          }
        }
        child.visible = true

        const outwardNormal = new THREE.Vector3(0, 1, 0)
          .applyQuaternion(child.quaternion)
          .normalize()

        items.push({
          name: child.name,
          mesh: child,
          origPositions,
          origNormals,
          minU,
          maxU,
          basePos: child.position.clone(),
          outwardNormal,
          progress: 1,
          opacity: 1,
        })
      }
    })
    stickersRef.current = items
    setStickersReady(true)
  }, [scene])

  useGSAP(() => {
    if (!stickersReady || stickersRef.current.length === 0) return

    // Sticker Peel
    const tlPeel = gsap.timeline({
      scrollTrigger: {
        trigger: "[data-gsap='hero']",
        start: "18% 50%",
        end: "35% 50%",
        scrub: true,
        
      },
    })

    stickersRef.current.forEach((sticker, i) => {
      const staggerOffset = i * 0.08
      tlPeel.fromTo(
        sticker,
        { progress: 1 },
        { progress: 0, ease: "none", duration: 1 },
        staggerOffset
      )
      tlPeel.fromTo(
        sticker,
        { opacity: 1 },
        { opacity: 0, ease: "none", duration: 0.35 },
        staggerOffset + 0.65
      )
    })

    // Reapply
    const tlReapply = gsap.timeline({
      scrollTrigger: {
        trigger: "[data-gsap='hero']",
        start: "70% 50%",
        end: "80% 50%",
        scrub: true,
        
      },
    })

    stickersRef.current.forEach((sticker, i) => {
      const staggerOffset = i * 0.08
      tlReapply.fromTo(
        sticker,
        { opacity: 0 },
        { opacity: 1, ease: "none", duration: 0.35, immediateRender: false },
        staggerOffset
      )
      tlReapply.fromTo(
        sticker,
        { progress: 0 },
        { progress: 1, ease: "none", duration: 1, immediateRender: false },
        staggerOffset
      )
    })
  }, [stickersReady])

  useGSAP(() => {
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
  }, [])

  useGSAP(() => {
    if (!boxRef.current) return

    gsap.fromTo(
      boxRef.current.rotation,
      { x: 0.29, y: -0.7, z: -0.2 },
      {
        x: 0.1,
        y: -1.3,
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
      { x: 0.1, y: -1.3, z: -0.2 },
      {
        x: 0.1,
        y: -1,
        z: 0,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: "[data-gsap='hero']",
          start: "85% bottom",
          end: "100% bottom",
          scrub: true,
        },
      }
    )

    gsap.fromTo(
      boxRef.current.position,
      { x: 0, y: 2, z: 0 },
      {
        y: -1.8,
        z: 2.2,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: "[data-gsap='hero']",
          start: "75% bottom",
          end: "100% bottom",
          scrub: true,
          onLeaveBack: () => {
            if (!boxRef.current) return;
           gsap.set(boxRef.current?.position, { y: -0.5, z: 0 }) 
          }
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
  }, [boxRef.current])

  useFrame(({ clock }, delta) => {
    dissolveUniforms.current.uTime.value = clock.getElapsedTime()

    if (boxRef.current) {
      box3Ref.current.setFromObject(boxRef.current)
      dissolveUniforms.current.uMinY.value = box3Ref.current.min.y
      dissolveUniforms.current.uMaxY.value = box3Ref.current.max.y
    }

    const targetWobble = wobbleEnabled ? 0.08 : 0
    wobbleAmountRef.current = THREE.MathUtils.damp(wobbleAmountRef.current, targetWobble, 6, delta)

    if (wobbleRef.current) {
      const t = clock.getElapsedTime() * 1.5
      wobbleRef.current.rotation.x = Math.sin(t) * wobbleAmountRef.current
      wobbleRef.current.rotation.z = Math.cos(t) * wobbleAmountRef.current
    }
    

    stickersRef.current.forEach(sticker => {
      const mat = sticker.mesh.material
      if (Array.isArray(mat)) {
        mat.forEach((m: any) => {
          m.opacity = sticker.opacity
        })
      } else if (mat) {
        ;(mat as any).opacity = sticker.opacity
      }
      sticker.mesh.visible = sticker.opacity > 0.001

      if (!sticker.mesh.visible) return

      const geom = sticker.mesh.geometry
      if (!geom || !geom.attributes.position) return

      const pos = geom.attributes.position.array as Float32Array
      const { origPositions, origNormals, minU, maxU, basePos, outwardNormal } = sticker
      const p = sticker.progress
      const curlAmount = 1 - p
      const rangeU = maxU - minU || 1

      if (curlAmount <= 0.0001) {
        for (let i = 0; i < pos.length; i++) {
          pos[i] = origPositions[i]
        }
        sticker.mesh.position.copy(basePos)
        geom.attributes.position.needsUpdate = true
        return
      }

      for (let i = 0; i < pos.length; i += 3) {
        const ox = origPositions[i]
        const oy = origPositions[i + 1]
        const oz = origPositions[i + 2]
        const nx = origNormals[i]
        const ny = origNormals[i + 1]
        const nz = origNormals[i + 2]

        const u = ox + oz
        const uNorm = (u - minU) / rangeU

        if (uNorm > p) {
          const d = (uNorm - p) / (1 - p + 0.0001)
          const lift = (Math.pow(d, 1.5) * 0.38 + Math.sin(d * Math.PI) * 0.15) * curlAmount * curlHeight
          const pull = Math.pow(d, 2) * 0.17 * curlAmount

          pos[i] = ox + nx * lift - 0.707 * pull
          pos[i + 1] = oy + ny * lift
          pos[i + 2] = oz + nz * lift - 0.707 * pull
        } else {
          pos[i] = ox
          pos[i + 1] = oy
          pos[i + 2] = oz
        }
      }

      geom.attributes.position.needsUpdate = true
      geom.computeVertexNormals()

      sticker.mesh.position
        .copy(basePos)
        .addScaledVector(outwardNormal, curlAmount * floatDistance)
    })
  })

  return (
    <group
      ref={boxRef}
      position={[0, -0.5, 0]}
      rotation={[0.29, -0.7, -0.2]}
    >
      <group ref={wobbleRef}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

const Hero3DBase = () => {
  const { scene } = useGLTF("/gltf/base.glb")
  const [doorTexture, doorBlueTexture] = useTexture([
    '/assets/door.png',
    '/assets/door_blue.png',
  ])

  useEffect(() => {
    doorTexture.flipY = false
    doorTexture.colorSpace = THREE.SRGBColorSpace
    doorTexture.needsUpdate = true

    doorBlueTexture.flipY = false
    doorBlueTexture.colorSpace = THREE.SRGBColorSpace
    doorBlueTexture.needsUpdate = true
  }, [doorTexture, doorBlueTexture])

  const baseRef = useRef<THREE.Mesh>(null!)
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
    gsap.to(baseRef.current.rotation, {
      x: 0.1,
      ease: "none",
      scrollTrigger: {
        trigger: "[data-gsap='hero']",
        start: "50% bottom",
        end: "bottom bottom",
        scrub: true,
      }
    })
    gsap.to(baseRef.current.position, {
      y: -6.5,
      ease: "none",
      scrollTrigger: {
        trigger: "[data-gsap='hero']",
        start: "50% bottom",
        end: "bottom bottom",
        scrub: true,
      }
    })

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
  }, [])

  return (
    <>
    <primitive ref={baseRef} object={scene} position={[0, -25, -13]} rotation={[0.5,0,0]} />
    </>
  )
}

const BaseLights = () => {
  return (
    <>
      <ambientLight intensity={1} color="#ffffff" />
      <directionalLight
        position={[0, 10, 5]}
        intensity={6}
        color="#ffffff"
      />
    </>
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
        intensity={10}
        color={"#ffffff"}
      />
    </>
  )
}

const CameraController = () => {
  const camera = useThree(state => state.camera as PerspectiveCamera)

  useEffect(() => {
    if (!camera) return
    const verticalFov = 2 * Math.atan(24 / (2 * 110)) * (180 / Math.PI)
    camera.fov = verticalFov
    camera.updateProjectionMatrix()
  }, [camera])

  return null
}

const LogoMarquee = ({ logos }: { logos: any[] }) => {
  const marqueeRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!marqueeRef.current || !trackRef.current || logos.length === 0) return

    const trackWidth = trackRef.current.offsetWidth

    gsap.fromTo(
      marqueeRef.current,
      { x: 0 },
      {
        x: -trackWidth,
        duration: logos.length * 2,
        repeat: -1,
        ease: 'none',
      }
    )
  }, [logos.length])

  if (!logos.length) return null

  const renderLogos = (duplicate = false) =>
    logos.map((logo, i) => {
      const imageSource = logo.image || logo
      const altText = duplicate ? '' : logo.alt || imageSource?.alt || ''

      return (
        <div
          className="w-fit h-[40px] flex items-center justify-center shrink-0 "
          key={`${duplicate ? 'dup' : 'original'}-${logo._key || i}`}
        >
          <SanityImage
            image={imageSource}
            alt={altText}
            className="w-full h-full object-contain"
          />
        </div>
      )
    })

  return (
    <div className="w-screen ">
      <div
        ref={marqueeRef}
        className="flex w-fit will-change-transform"
      >
        {/* Track 1 */}
        <div
          ref={trackRef}
          className="flex gap-[80px] items-center shrink-0 pr-[80px]"
        >
          {renderLogos()}
        </div>

        {/* Track 2 */}
        <div
          className="flex gap-[80px] items-center shrink-0 pr-[80px]"
          aria-hidden="true"
        >
          {renderLogos(true)}
        </div>

        {/* Track 3 */}
        <div
          className="flex gap-[80px] items-center shrink-0 pr-[80px]"
          aria-hidden="true"
        >
          {renderLogos(true)}
        </div>
      </div>
    </div>
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
              "--gradient-position": "-10% -10%",
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
        "--gradient-color": "rgb(0, 0, 0)",
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
        "--gradient-color": "rgb(0, 0, 0)",
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
              "--gradient-position": "-10% -10%",
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
          id: "heading-color"
        },
      }
    )


  }, [firstText, secondText])

  return (
    <div data-gsap="heading-wrapper" className='sticky top-0 w-screen h-[100vh] -mb-[100vh] z-[51] pointer-events-none'>
      <div className='relative w-full h-full'>
        <p
          data-gsap="first-heading"
          className='absolute top-[30vh] left-1/2 -translate-x-1/2 -translate-y-1/2 text-black text-[84px] font-riforma-bold leading-[85%] tracking-[-6px] text-balance text-center select-none'
          style={{
            '--gradient-size': '0%',
            '--gradient-position': '-10% -10%',
            '--gradient-x': '50%',
            '--gradient-y': '50%',
            '--gradient-color': 'rgb(0, 149, 236)',
            backgroundImage:
              'radial-gradient(circle at var(--gradient-position, var(--gradient-x, 50%) var(--gradient-y, 50%)), var(--gradient-color, rgb(0, 0, 0)) 0%, var(--gradient-color, rgb(0, 0, 0)) var(--gradient-size, 0%), transparent calc(var(--gradient-size, 0%) + 15%))',
            backgroundSize: '100% 100%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
          } as React.CSSProperties}
        >
          {text}
        </p>
      </div>
    </div>
  )
}


export default function Hero({ block }: HeroProps) {
  const [mounted, setMounted] = useState(false)
  const [stickersApplied, setStickersApplied] = useState(true)
  const [wobbleEnabled, setWobbleEnabled] = useState(true)

  useEffect(() => {
    setMounted(true)
    useGLTF.preload('/gltf/box.glb')
    useGLTF.preload('/gltf/base.glb')
    useTexture.preload('/assets/door.png')
    useTexture.preload('/assets/door_blue.png')
  }, [])


  useGSAP(() => {
    gsap.to("[data-gsap='left-cloud']", {
      y: 25,
      duration: 3,
      yoyo: true,
      repeat: -1,
      delay: 1.5,
      ease: "power1.inOut"
    })
    gsap.to("[data-gsap='right-cloud']", {
      y: 25,
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut"
    })

    gsap.to("[data-gsap='left-cloud'],[data-gsap='right-cloud']", {
      yPercent: -45,
      ease: "none",
      scrollTrigger: {
        trigger: "[data-gsap='hero']",
        start: "17% 50%",
        end: "50% 50%",
        scrub: true,
        
      }
    })

    gsap.fromTo("[data-gsap='hero-dim']",{
      opacity: 0
    },{
      opacity: 1,
      scrollTrigger: {
        trigger: "[data-gsap='hero']",
        start: "40% 50%",
        end: "60% 50%",
        scrub: true,
      }
    }    
  )    
  })

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: "[data-gsap='hero']",
      start: "90% bottom",
      
      onEnter: () => setWobbleEnabled(false),
      onLeaveBack: () => setWobbleEnabled(true),
    })
  }, [])


  return (
    <div data-gsap="hero" className="w-full h-[280vh] relative bg-background overflow-x-clip">
      {block?.firstText && (
          <HeroTexts firstText={block?.firstText} secondText={block?.secondText} />
      )}
      {/* Behind the box (z-0) */}
      <div className='flex items-center justify-center flex-col gap-[25px] absolute top-0 left-0 w-full h-[70vh] z-0 pointer-events-none bg-linear-to-t from-[#FDF6E2] to-[#0095EC] '>
        <img
          src="/assets/cloud_l.png"
          alt=""
          data-gsap="left-cloud"
          className='absolute bottom-[-150px] left-[-25vw] w-[70vw] h-fit scale-x-[-1] rotate-[-20deg] pointer-events-none select-none'
        />

        <div className='flex gap-[30px] items-center justify-center'>
          <p className='font-riforma-bold tracking-[3px] leading-[110%] text-[18px] text-background text-center'>RATED 5 STARS ON SHOPIFY</p>
          <p className='flex items-center justify-center gap-[6px] font-riforma-regular leading-[110%] text-[18px] text-background text-center'>
            <span>5.0</span>
            <span className='inline-flex items-center justify-center'>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
                <path d="M5.90796 0.484368C6.29662 -0.161452 7.23292 -0.161453 7.62158 0.484367L9.1796 3.07326C9.31922 3.30527 9.54697 3.47074 9.81078 3.53184L12.7544 4.21359C13.4887 4.38366 13.7781 5.27413 13.284 5.84334L11.3032 8.12511C11.1257 8.3296 11.0387 8.59734 11.0621 8.86711L11.3234 11.8773C11.3886 12.6283 10.6311 13.1786 9.93704 12.8846L7.15486 11.7059C6.90553 11.6003 6.62401 11.6003 6.37468 11.7059L3.5925 12.8846C2.89847 13.1786 2.14099 12.6283 2.20616 11.8773L2.46741 8.86711C2.49082 8.59734 2.40383 8.3296 2.22632 8.12511L0.24559 5.84334C-0.248518 5.27413 0.040812 4.38366 0.775126 4.21359L3.71876 3.53184C3.98257 3.47074 4.21032 3.30527 4.34994 3.07326L5.90796 0.484368Z" fill="#FDDE15"/>
              </svg>
            </span>
            <span>across 55 reviews</span>
          </p>
        </div>

        <div className='flex flex-col'>
          <h2 className='font-riforma-bold tracking-[-6px] leading-[85%] text-[84px] text-background w-[800px] text-balance text-center mb-[185px]'>{block?.heading}</h2>
        </div>
      </div>

      {/* Base Canvas (z-[5]) */}
      <div
        data-canvas="base"
        className="sticky top-0 w-full h-screen z-[5] pointer-events-none"
      >
        <div className="relative w-full h-screen pointer-events-none">
          {mounted && (
            <Canvas
              camera={{ fov: 18.18, position: [0, 0, 35] }}
              style={{ pointerEvents: 'none' }}
              className='pointer-events-none w-full h-screen'>
              <CameraController />
              <BaseLights />
              <Suspense fallback={null}>
                <Hero3DBase />
              </Suspense>
            </Canvas>
          )}
        </div>
      </div>

      

      {/* Box Canvas (z-10) */}
      <div
        data-canvas="box"
        className="sticky top-0 w-full h-screen z-10 pointer-events-none -mt-[100vh]"
      >
        <div className="relative w-full h-screen pointer-events-none">
          {mounted && (
            <Canvas
              camera={{ fov: 18.18, position: [0, 0, 35] }}
              style={{ pointerEvents: 'none' }}
              className='pointer-events-none w-full h-screen'>
              <CameraController />
              {/* <Environment preset='forest' environmentIntensity={1} /> */}
              <DirectionalLightWithControls />
              <Suspense fallback={null}>
                <Hero3DBox stickersApplied={stickersApplied} wobbleEnabled={wobbleEnabled} />
              </Suspense>
            </Canvas>
          )}
        </div>
      </div>

      {/* Above the box (z-20) */}
      <div className='absolute top-0 left-0 w-full h-[70vh] z-20 pointer-events-none '>
        <img
          src="/assets/cloud_r.png"
          alt=""
          data-gsap="right-cloud"
          className='absolute bottom-[-150px] right-[-5vw] w-[50vw] h-fit pointer-events-none select-none'
        />
      </div>

      {/* Bottom part */}
      <div className='absolute top-[81vh] z-[2] pointer-events-auto flex flex-col items-center gap-[50px] w-screen '>

          <div className='flex gap-[35px] items-center'>
            <p className='text-black font-riforma-bold text-[28px] leading-[110%]'>{block?.bottomText}</p>
            {block?.button?.text && block?.button?.href && (
              <Button text={block?.button?.text} href={block?.button?.href} />
            )}
          </div>

            {block?.logoMarquee && (
          <LogoMarquee logos={block?.logoMarquee} />
            )}
      </div>


      {/* Hero dim */}
      <div data-gsap="hero-dim" className='opacity-0 w-screen h-[50vh] bg-linear-to-b from-[#110F0B]/75 to-[#110F0B00] sticky top-0 left-0 -mt-[100vh] z-50' />
      
    </div>
  )
}