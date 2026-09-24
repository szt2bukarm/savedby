import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { applyBoxDissolveShader } from './heroShaders'

export interface StickerItem {
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

export function useStickers({ scene, wobbleEnabled = true }: { scene: THREE.Group, wobbleEnabled?: boolean }) {
  const boxRef = useRef<THREE.Group>(null)
  const wobbleRef = useRef<THREE.Group>(null)
  const wobbleAmountRef = useRef(0.08)
  const floatDampRef = useRef(0)
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
      if (child.isMesh) {
        if (!/^sticker/i.test(child.name)) {
          child.renderOrder = 0
          if (child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material]
            mats.forEach((mat: any) => {
              applyBoxDissolveShader(mat, dissolveUniforms.current)
              mat.needsUpdate = true
            })
          }
        } else {
          child.renderOrder = 10
          const geom = child.geometry
          if (geom && geom.attributes.position && geom.attributes.normal) {
            const origPositions = Float32Array.from(geom.attributes.position.array)
            const origNormals = Float32Array.from(geom.attributes.normal.array)

            let minU = Infinity
            let maxU = -Infinity
            for (let i = 0; i < origPositions.length; i += 3) {
              const u = origPositions[i] + origPositions[i + 2]
              if (u < minU) minU = u
              if (u > maxU) maxU = u
            }

            const configureStickerMat = (m: any) => {
              const cloned = m.clone()
              applyBoxDissolveShader(cloned, dissolveUniforms.current, {
                depthWrite: false,
                cacheKeySuffix: `sticker_${cloned.uuid}`,
              })
              cloned.transparent = true
              cloned.depthWrite = false
              cloned.alphaTest = 0.05
              cloned.polygonOffset = true
              cloned.polygonOffsetFactor = -2
              cloned.polygonOffsetUnits = -2
              cloned.opacity = 1
              cloned.needsUpdate = true
              return cloned
            }

            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material = child.material.map(configureStickerMat)
              } else {
                child.material = configureStickerMat(child.material)
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
              progress: 0,
              opacity: 0,
            })
          }
        }
      }
    })
    stickersRef.current = items
    setStickersReady(true)
  }, [scene])

  useFrame(({ clock }, delta) => {
    dissolveUniforms.current.uTime.value = clock.getElapsedTime()

    if (boxRef.current) {
      box3Ref.current.setFromObject(boxRef.current)
      dissolveUniforms.current.uMinY.value = box3Ref.current.min.y
      dissolveUniforms.current.uMaxY.value = box3Ref.current.max.y
    }

    const targetWobble = wobbleEnabled ? 0.08 : 0
    wobbleAmountRef.current = THREE.MathUtils.damp(wobbleAmountRef.current, targetWobble, 6, delta)

    const isAtTop = typeof window !== 'undefined' ? window.scrollY < 20 : true
    const targetFloat = isAtTop ? 1 : 0
    floatDampRef.current = THREE.MathUtils.damp(floatDampRef.current, targetFloat, 5, delta)

    if (wobbleRef.current) {
      const t = clock.getElapsedTime() * 1.5
      wobbleRef.current.rotation.x = Math.sin(t) * wobbleAmountRef.current
      wobbleRef.current.rotation.z = Math.cos(t) * wobbleAmountRef.current
      wobbleRef.current.position.y = Math.sin(t * 1.2) * 0.2 * floatDampRef.current
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
          const lift = (Math.pow(d, 1.5) * 0.38 + Math.sin(d * Math.PI) * 0.15) * curlAmount * 1.2 // curlHeight
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
        .addScaledVector(outwardNormal, curlAmount * 0.45) // floatDistance
    })
  })

  return { boxRef, wobbleRef, stickersRef, stickersReady, dissolveUniforms }
}
