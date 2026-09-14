import * as THREE from 'three'

/**
 * Injects the multi-harmonic wavy dissolve shader with glowing edge falloff
 * into a Three.js material's compilation pipeline.
 */
export function applyBoxDissolveShader(
  material: THREE.Material,
  dissolveUniforms: Record<string, { value: any }>
) {
  material.transparent = true
  material.depthWrite = true
  material.side = THREE.DoubleSide
  ;(material as any).customProgramCacheKey = () => 'box_wavy_dissolve_shader_v2'

  ;(material as any).onBeforeCompile = (shader: any) => {
    shader.uniforms.uDissolveProgress = dissolveUniforms.uDissolveProgress
    shader.uniforms.uDissolveColor = dissolveUniforms.uDissolveColor
    shader.uniforms.uCoreColor = dissolveUniforms.uCoreColor
    shader.uniforms.uGlowWidth = dissolveUniforms.uGlowWidth
    shader.uniforms.uWaveAmount = dissolveUniforms.uWaveAmount
    shader.uniforms.uWaveFrequency = dissolveUniforms.uWaveFrequency
    shader.uniforms.uWaveSpeed = dissolveUniforms.uWaveSpeed
    shader.uniforms.uTime = dissolveUniforms.uTime
    shader.uniforms.uDirection = dissolveUniforms.uDirection
    shader.uniforms.uMinY = dissolveUniforms.uMinY
    shader.uniforms.uMaxY = dissolveUniforms.uMaxY

    shader.vertexShader = `
      varying vec3 vWorldPos;
      varying float vWorldY;
      ${shader.vertexShader}
    `.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vec4 customWorldPos = modelMatrix * vec4(position, 1.0);
      vWorldPos = customWorldPos.xyz;
      vWorldY = customWorldPos.y;
      `
    )

    shader.fragmentShader = `
      uniform float uDissolveProgress;
      uniform vec3 uDissolveColor;
      uniform vec3 uCoreColor;
      uniform float uGlowWidth;
      uniform float uWaveAmount;
      uniform float uWaveFrequency;
      uniform float uWaveSpeed;
      uniform float uTime;
      uniform float uDirection;
      uniform float uMinY;
      uniform float uMaxY;
      varying vec3 vWorldPos;
      varying float vWorldY;

      ${shader.fragmentShader}
    `.replace(
      '#include <dithering_fragment>',
      `
      #include <dithering_fragment>

      if (uDissolveProgress > 0.0001) {
        float normY = clamp((vWorldY - uMinY) / (uMaxY - uMinY + 0.0001), 0.0, 1.0);
        float h = (uDirection > 0.5) ? (1.0 - normY) : normY;
        
        // Time-driven organic undulation
        float t = uTime * uWaveSpeed;
        
        // Base 2D planar coordinates along the box's horizontal footprint
        vec2 p = vWorldPos.xz * uWaveFrequency;

        // Domain warping: distortion coordinates creating fluid, swirling tongues instead of rigid lines
        vec2 warp = vec2(
          sin(p.x * 1.25 + p.y * 0.85 + t * 0.85),
          cos(p.x * 0.75 - p.y * 1.15 - t * 0.65)
        ) * 0.55;

        vec2 wp = p + warp;

        // Multi-harmonic wave components for rich organic silhouette
        float waveHarmonic1 = sin(wp.x * 1.4 + wp.y * 1.1 + t * 0.55);
        float waveHarmonic2 = cos(wp.x * 2.3 - wp.y * 1.6 - t * 0.75) * 0.45;
        float waveHarmonic3 = sin((wp.x + wp.y) * 3.2 + t * 1.1) * 0.22;
        
        float totalWave = (waveHarmonic1 + waveHarmonic2 + waveHarmonic3) * uWaveAmount;
        float front = h + totalWave;

        // Full clearance margins so wave enters cleanly above highest peak and exits completely below lowest point
        float maxWaveReach = uWaveAmount * 2.0;
        float startMargin = maxWaveReach + uGlowWidth + 0.06;
        float endMargin = maxWaveReach + uGlowWidth + 0.06;
        float progress = mix(-startMargin, 1.0 + endMargin, uDissolveProgress);
        float dist = front - progress;

        // Smooth feather edge fade (anti-aliased dissolve boundary)
        float alpha = smoothstep(-0.025, 0.035, dist);
        if (alpha < 0.001) {
          discard;
        }
        gl_FragColor.a *= alpha;

        // Smooth glow fade in at start and out at end to eliminate popping
        float glowEnvelope = smoothstep(0.0, 0.08, uDissolveProgress) * (1.0 - smoothstep(0.92, 1.0, uDissolveProgress));

        if (dist < uGlowWidth) {
          float glowT = clamp(1.0 - (dist / uGlowWidth), 0.0, 1.0);
          float glowAura = pow(glowT, 1.6);
          float glowCore = pow(glowT, 5.0);

          float crestGlow = 1.0 + clamp(waveHarmonic1, 0.0, 1.0) * 0.35;

          vec3 auraCol = uDissolveColor * (2.4 * crestGlow);
          vec3 coreCol = uCoreColor * (4.2 * crestGlow);
          vec3 combinedGlow = mix(auraCol, coreCol, glowCore);

          gl_FragColor.rgb = mix(gl_FragColor.rgb, combinedGlow, glowAura * 0.94 * glowEnvelope);
        }
      }
      `
    )
  }
}

/**
 * Creates the custom ShaderMaterial for the door transition from door.png to door_blue.png
 * with an energetic diagonal wave sweep and glowing electric-blue wavefront.
 */
export function createDoorTransitionMaterial(
  doorUniforms: Record<string, { value: any }>
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: doorUniforms,
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTextureA;
      uniform sampler2D uTextureB;
      uniform float uProgress;
      uniform float uTime;

      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        // Normalized height (-1.15 to 1.25) and width (-0.48 to 0.48) of door mesh
        float normY = clamp((vPosition.y - (-1.15)) / 2.40, 0.0, 1.0);
        float normX = clamp((vPosition.x - (-0.48)) / 0.96, 0.0, 1.0);

        // Top-to-bottom sweep with subtle organic diagonal tilt
        float sweepCoord = (1.0 - normY) + (normX - 0.5) * 0.16;

        // Living micro-wave ripple along the wavefront
        float wave = sin(vPosition.y * 14.0 + uTime * 3.0) * 0.022 +
                     cos(vPosition.x * 20.0 + uTime * 2.2) * 0.016;

        // Remap progress to guarantee clean start (pure Texture A) and finish (pure Texture B)
        float edgeWidth = 0.08;
        float sweepProgress = mix(-edgeWidth * 2.2, 1.22 + edgeWidth * 2.2, uProgress);
        float dist = sweepProgress - (sweepCoord + wave);

        // Smooth transition mask
        float mask = smoothstep(-edgeWidth, edgeWidth, dist);

        vec4 colorA = texture2D(uTextureA, vUv);
        vec4 colorB = texture2D(uTextureB, vUv);

        vec3 color = mix(colorA.rgb, colorB.rgb, mask);

        // Luminous energy edge at the wavefront during transition
        float transitionActivity = smoothstep(0.005, 0.07, uProgress) * smoothstep(0.995, 0.93, uProgress);
        float glowIntensity = exp(-abs(dist) * 32.0) * transitionActivity;

        // Electric blue to cyan glow matching brand aesthetics
        vec3 glowColor = mix(vec3(0.0, 0.58, 0.93), vec3(0.35, 0.88, 1.0), glowIntensity);
        color += glowColor * glowIntensity * 2.5;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.DoubleSide,
  })
}

/**
 * Creates a soft fake contact shadow material for the box_shadow mesh.
 * Renders a natural dual-falloff (core ambient occlusion + soft penumbra)
 * that darkens smoothly as uOpacity increases when the box approaches.
 */
export function createFakeShadowMaterial(
  uniforms: Record<string, { value: any }>
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uOpacity;
      uniform vec3 uShadowColor;

      varying vec2 vUv;

      void main() {
        // Map UVs from [0, 1] to centered [-1, 1] coordinates
        vec2 p = vUv * 2.0 - 1.0;

        // Rounded rectangular box distance function matching the landing box profile
        vec2 b = vec2(0.52, 0.52);
        vec2 d = abs(p) - b;
        float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);

        // Core contact occlusion (darker under box center)
        float core = smoothstep(0.3, -0.32, dist);

        // Soft outer penumbra falloff
        float penumbra = smoothstep(0.72, -0.18, dist);

        // Subtle radial drop shadow component
        float radial = exp(-dot(p, p) * 2.6);

        // Composite shadow density
        float density = mix(penumbra * 0.45 + core * 0.55, radial, 0.22);

        // Smooth fade-out well before the geometry boundary to avoid any hard edge
        float edgeFade = smoothstep(1.0, 0.72, max(abs(p.x), abs(p.y)));
        float alpha = density * edgeFade * uOpacity;

        if (alpha < 0.001) discard;

        gl_FragColor = vec4(uShadowColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    side: THREE.DoubleSide,
  })
}
