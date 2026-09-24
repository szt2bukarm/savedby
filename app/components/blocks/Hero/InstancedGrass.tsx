import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js'
import { grassVertexShader, grassFragmentShader } from './heroShaders'

const MAX_GUSTS = 8

interface GustData {
  active: boolean
  x: number
  z: number
  speed: number
  strength: number
  width: number
  radiusZ: number
  angle: number
}

const InstancedGrass = ({
  count = 40000,
  width = 44,
  depth = 32,
  position = [0, 0.5, 0] as [number, number, number],
  samplerMesh,
}: {
  count?: number
  width?: number
  depth?: number
  position?: [number, number, number]
  samplerMesh?: THREE.Mesh | null
}) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    
    // 4-segment tapered blade: 9 vertices, 7 triangles (21 indices)
    // Heights: 0.0 (base), 0.22, 0.48, 0.75, 1.0 (tip)
    // Widths taper smoothly from base to tip with slight cross-sectional curvature
    const bladeHeight = 0.85
    const positions = new Float32Array([
      // Row 0: base (y = 0.0)
      -0.11, 0.00 * bladeHeight, 0.0,
       0.11, 0.00 * bladeHeight, 0.0,
      // Row 1: lower (y = 0.22)
      -0.10, 0.22 * bladeHeight, 0.004,
       0.10, 0.22 * bladeHeight, 0.004,
      // Row 2: mid (y = 0.48)
      -0.08, 0.48 * bladeHeight, 0.008,
       0.08, 0.48 * bladeHeight, 0.008,
      // Row 3: upper (y = 0.75)
      -0.05, 0.75 * bladeHeight, 0.005,
       0.05, 0.75 * bladeHeight, 0.005,
      // Row 4: tip (y = 1.0)
       0.00, 1.00 * bladeHeight, 0.0,
    ])

    const uvs = new Float32Array([
      0.0, 0.00,
      1.0, 0.00,
      0.05, 0.22,
      0.95, 0.22,
      0.12, 0.48,
      0.88, 0.48,
      0.22, 0.75,
      0.78, 0.75,
      0.50, 1.00,
    ])

    // Normals with subtle curved spine (+Z forward, left tilts -X, right tilts +X)
    const normals = new Float32Array([
      -0.15, 0.0, 0.98,
       0.15, 0.0, 0.98,
      -0.20, 0.0, 0.97,
       0.20, 0.0, 0.97,
      -0.22, 0.0, 0.97,
       0.22, 0.0, 0.97,
      -0.18, 0.0, 0.98,
       0.18, 0.0, 0.98,
       0.00, 0.1, 0.99,
    ])

    const indices = [
      // Segment 0
      0, 1, 2,
      2, 1, 3,
      // Segment 1
      2, 3, 4,
      4, 3, 5,
      // Segment 2
      4, 5, 6,
      6, 5, 7,
      // Segment 3 (tip)
      6, 7, 8,
    ]

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
    geo.setIndex(indices)
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 100)

    return geo
  }, [])

  const [positions, rotations, scales, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const rotations = new Float32Array(count)
    const scales = new Float32Array(count)
    const colors = new Float32Array(count * 3)

    const baseColor = new THREE.Color('#43a328')
    const colorVariance = 0.05
    
    let sampler: any = null
    const tempPosition = new THREE.Vector3()
    if (samplerMesh) {
      samplerMesh.updateMatrixWorld(true)
      sampler = new MeshSurfaceSampler(samplerMesh).build()
    }

    for (let i = 0; i < count; i++) {
      let rx = 0, rz = 0, ry = 0;
      
      if (sampler) {
        sampler.sample(tempPosition)
        tempPosition.applyMatrix4(samplerMesh!.matrixWorld)
        rx = tempPosition.x
        ry = tempPosition.y
        rz = tempPosition.z
      } else {
        rx = (Math.random() - 0.5) * width
        rz = (Math.random() - 0.5) * depth

        // Exclude only the central porch steps & welcome mat walkway (from X = -3.5 to +3.5)
        if (Math.abs(rx) < 3.5 && rz > -5.0 && rz < 7.0) {
          if (Math.random() < 0.5) {
            rx = -3.5 - Math.random() * (width * 0.5 - 3.5)
          } else {
            rx = 3.5 + Math.random() * (width * 0.5 - 3.5)
          }
        }
      }

      positions[i * 3 + 0] = rx
      positions[i * 3 + 1] = ry
      positions[i * 3 + 2] = rz

      rotations[i] = Math.random() * Math.PI * 2
      scales[i] = 0.5 + Math.random() * 0.8

      const c = baseColor.clone()
      c.offsetHSL(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * colorVariance,
        (Math.random() - 0.5) * colorVariance
      )
      colors[i * 3 + 0] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    return [
      new THREE.InstancedBufferAttribute(positions, 3),
      new THREE.InstancedBufferAttribute(rotations, 1),
      new THREE.InstancedBufferAttribute(scales, 1),
      new THREE.InstancedBufferAttribute(colors, 3),
    ]
  }, [count, width, depth, samplerMesh])

  const gustsRef = useRef<GustData[]>([
    { active: true, x: 8.0, z: -2.0, speed: 4.8, strength: 1.05, width: 17.0, radiusZ: 18.0, angle: 0.03 },
    { active: true, x: -16.0, z: 3.0, speed: 5.0, strength: 1.10, width: 17.0, radiusZ: 20.0, angle: -0.02 },
    { active: false, x: -50.0, z: 0, speed: 4.8, strength: 1.0, width: 17.0, radiusZ: 18.0, angle: 0 },
    { active: false, x: -50.0, z: 0, speed: 4.8, strength: 1.0, width: 17.0, radiusZ: 18.0, angle: 0 },
    { active: false, x: -50.0, z: 0, speed: 4.8, strength: 1.0, width: 17.0, radiusZ: 18.0, angle: 0 },
    { active: false, x: -50.0, z: 0, speed: 4.8, strength: 1.0, width: 17.0, radiusZ: 18.0, angle: 0 },
    { active: false, x: -50.0, z: 0, speed: 4.8, strength: 1.0, width: 17.0, radiusZ: 18.0, angle: 0 },
    { active: false, x: -50.0, z: 0, speed: 4.8, strength: 1.0, width: 17.0, radiusZ: 18.0, angle: 0 },
  ])

  const nextSpawnTimeRef = useRef(1.5)

  const gustVectors = useMemo(
    () => Array.from({ length: MAX_GUSTS }, () => new THREE.Vector4()),
    []
  )
  const gustExtraVectors = useMemo(
    () => Array.from({ length: MAX_GUSTS }, () => new THREE.Vector4()),
    []
  )

  const defaultBurnTexture = useMemo(() => {
    const data = new Uint8Array([0, 0, 0, 255])
    const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat)
    texture.needsUpdate = true
    return texture
  }, [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBurnMap: { value: defaultBurnTexture },
      uWindSpeed: { value: 5.0 },
      uWindStrength: { value: 1.10 },
      uWindWidth: { value: 17.0 },
      uWindDirection: { value: new THREE.Vector2(1.0, 0.10) },
      uWindPosition: { value: 0.0 },
      uAmbientStrength: { value: 0.20 },
      uWindFrequency: { value: 0.024 },
      uBendStrength: { value: 1.0 },
      uGusts: { value: gustVectors },
      uGustsExtra: { value: gustExtraVectors },
    }),
    [defaultBurnTexture, gustVectors, gustExtraVectors]
  )

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const gusts = gustsRef.current

    // 1. Advance existing active gusts from Left to Right
    for (let i = 0; i < MAX_GUSTS; i++) {
      const g = gusts[i]
      if (g.active) {
        g.x += g.speed * dt
        // Deactivate only after the full trailing recovery zone has completely cleared all grass on the right (+54)
        if (g.x > 54.0) {
          g.active = false
        }
      }
    }

    // 2. Spawn new localized gusts at natural randomized intervals
    nextSpawnTimeRef.current -= dt
    if (nextSpawnTimeRef.current <= 0) {
      // Find an available inactive slot
      const slot = gusts.find((g) => !g.active)
      if (slot) {
        slot.active = true
        // Starts with leading edge completely outside the grass boundary (no pops on entry)
        slot.x = -38.0 - Math.random() * 4.0
        // Starts anywhere along the left side
        slot.z = (Math.random() - 0.5) * 24.0
        slot.speed = 9 + Math.random() * 3.0 // Doubled speed (9.2 - 12.2 units/s)
        slot.strength = 0.90 + Math.random() * 0.30 // Visible, natural bending strength
        slot.width = 32.0 + Math.random() * 8.0 // Doubled width (32 - 40 units) to sync left/right
        slot.radiusZ = 12.0 + Math.random() * 10.0 // Larger lane across depth (24 - 34 units)
        slot.angle = (Math.random() - 0.5) * 0.10
      }

      // Schedule next gust with varied, non-predictable timing:
      // occasional quick succession, medium gap, or calm lull
      const r = Math.random()
      if (r < 0.20) {
        nextSpawnTimeRef.current = 1.8 + Math.random() * 1.5 // 1.8s - 3.3s (close trailing wave)
      } else if (r < 0.70) {
        nextSpawnTimeRef.current = 3.5 + Math.random() * 2.5 // 3.5s - 6.0s (medium gap)
      } else {
        nextSpawnTimeRef.current = 6.5 + Math.random() * 3.5 // 6.5s - 10.0s (calm pause)
      }
    }

    // 3. Update uniform vector values in-place (zero allocations per frame)
    for (let i = 0; i < MAX_GUSTS; i++) {
      const g = gusts[i]
      gustVectors[i].set(g.x, g.z, g.width, g.strength)
      gustExtraVectors[i].set(g.radiusZ, g.angle, g.active ? 1.0 : 0.0, 0.0)
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh position={position} frustumCulled={false}>
      <instancedBufferGeometry
        index={geometry.index}
        attributes={geometry.attributes}
        instanceCount={count}
      >
        <primitive object={positions} attach="attributes-instancePosition" />
        <primitive object={rotations} attach="attributes-instanceRotation" />
        <primitive object={scales} attach="attributes-instanceScale" />
        <primitive object={colors} attach="attributes-instanceColor" />
      </instancedBufferGeometry>

      <shaderMaterial
        ref={materialRef}
        vertexShader={grassVertexShader}
        fragmentShader={grassFragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default InstancedGrass
