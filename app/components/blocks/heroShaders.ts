import * as THREE from 'three'

/**
 * Injects the multi-harmonic wavy dissolve shader with glowing edge falloff
 * into a Three.js material's compilation pipeline.
 */
export function applyBoxDissolveShader(
  material: THREE.Material,
  dissolveUniforms: Record<string, { value: any }>,
  options?: { depthWrite?: boolean; cacheKeySuffix?: string }
) {
  material.transparent = true
  material.depthWrite = options?.depthWrite !== undefined ? options.depthWrite : true
  material.side = THREE.DoubleSide
  const suffix = options?.cacheKeySuffix ? `_${options.cacheKeySuffix}` : `_${(material as any).id ?? material.uuid}`
  ;(material as any).customProgramCacheKey = () => `box_wavy_dissolve_shader_v2${suffix}`

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

// --- FBO Burn Simulation Material ---
export const BurnSimMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTexture: { value: null }, // Previous frame's burn map
    uInteractPos: { value: new THREE.Vector2(-1, -1) }, // Player UV position (0-1)
    uDelta: { value: 0.016 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform vec2 uInteractPos;
    uniform float uDelta;
    varying vec2 vUv;

    void main() {
      float currentBurn = texture2D(uTexture, vUv).r;
      float dist = distance(vUv, uInteractPos);
      float radius = 0.04;
      
      float newBurn = 0.0;
      if (dist < radius) {
          newBurn = 1.0 - smoothstep(0.0, radius, dist);
          newBurn *= uDelta * 50.0; 
      }

      float finalBurn = clamp(currentBurn + newBurn, 0.0, 1.0);
      gl_FragColor = vec4(finalBurn, 0.0, 0.0, 1.0);
    }
  `
});

// --- Grass Display Materials ---
export const grassVertexShader = `
  uniform float uTime;
  uniform sampler2D uBurnMap;
  
  attribute vec3 instancePosition;
  attribute float instanceRotation;
  attribute float instanceScale;
  attribute vec3 instanceColor;
  
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vBurn;
  varying vec3 vInstancePos;
  varying vec3 vNormal;
  
  // rotate around Y axis
  mat4 rotateY(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat4(
      c, 0.0, s, 0.0,
      0.0, 1.0, 0.0, 0.0,
      -s, 0.0, c, 0.0,
      0.0, 0.0, 0.0, 1.0
    );
  }
  
  void main() {
    vUv = uv;
    vColor = instanceColor;
    vInstancePos = instancePosition;
    
    // 1. Calculate the UV coordinate for this specific instance within the burn map
    float planeSize = 50.0;
    vec2 mapUv = vec2(
        (instancePosition.x / planeSize) + 0.5,
        1.0 - ((instancePosition.z / planeSize) + 0.5)
    );

    // 2. Sample the burn map at this instance's position
    float burnAmount = texture2D(uBurnMap, mapUv).r;
    vBurn = burnAmount;

    // 3. Scale the base blade. If burned, scale down heavily
    float burnScaleFactor = 1.0 - (burnAmount * 0.9); 
    
    // Remove grass near pond (if applicable)
    float distToPond = distance(instancePosition.xz, vec2(0.0, -15.0));
    float pondFactor = smoothstep(5.0, 6.0, distToPond);
    
    float heightScale = instanceScale * 2.5 * burnScaleFactor * pondFactor;
    float widthScale = instanceScale * mix(1.0, 0.3, burnAmount) * pondFactor;

    vec3 scaleVec = vec3(widthScale, heightScale, widthScale);
    vec3 pos = position * scaleVec;
    
    // 4. Apply wind (slow, gentle sway without high frequency vibration)
    float noiseFreq = 0.2;
    float noiseSpeed = 0.35;
    vec2 noisePos = instancePosition.xz * noiseFreq + vec2(uTime * noiseSpeed, uTime * noiseSpeed * 0.75);
    
    float windX = sin(noisePos.x) * cos(noisePos.y);
    float windZ = cos(noisePos.x * 0.8) * sin(noisePos.y * 1.1);
    
    float bend = pow(uv.y, 2.0) * 0.28 * burnScaleFactor; 
    
    pos.x += windX * bend;
    pos.z += windZ * bend;
    
    // Apply local rotation
    mat4 rotMat = rotateY(instanceRotation);
    vec4 rotatedPos = rotMat * vec4(pos, 1.0);
    vec4 rotatedNorm = rotMat * vec4(normal, 0.0);
    vNormal = normalize(rotatedNorm.xyz);
    
    // Position instances in world space relative to object matrix
    vec3 worldOffset = instancePosition;
    vec4 finalPos = vec4(rotatedPos.xyz + worldOffset, 1.0);
    
    // Project to screen
    gl_Position = projectionMatrix * modelViewMatrix * finalPos;
  }
`;

export const grassFragmentShader = `
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vBurn;
  varying vec3 vInstancePos;
  varying vec3 vNormal;
  
  void main() {
    // 1. Front-to-back depth lighting gradient
    // Z > 0 is front foreground (sunlit), Z < 0 is back (shadowed under/behind house)
    float depthFactor = smoothstep(-14.0, 10.0, vInstancePos.z);
    
    // 2. House shadow & occlusion (soft 22% falloff in back)
    float houseBehindOcclusion = smoothstep(3.0, -6.0, vInstancePos.z) * (1.0 - smoothstep(8.5, 16.0, abs(vInstancePos.x)));
    float shadowFactor = mix(1.0, 0.78, houseBehindOcclusion);

    // 3. Directional sun lighting from front-above
    vec3 lightDir = normalize(vec3(2.0, 8.0, 10.0));
    float diff = max(dot(vNormal, lightDir), 0.0);
    // Translucent subsurface glow
    float sss = max(dot(-vNormal, lightDir), 0.0) * 0.45;
    float lighting = mix(0.85, 1.25, diff + sss) * shadowFactor;

    // 4. Color Gradient (soft, light shading in the back)
    vec3 darkRoot = vColor * mix(0.44, 0.55, depthFactor) * shadowFactor;
    vec3 brightTip = vColor * mix(0.92, 1.40, depthFactor) * shadowFactor;
    
    // Soft sunny tip highlight
    vec3 tipHighlight = vec3(0.05, 0.07, 0.01) * depthFactor * pow(vUv.y, 1.3);
    
    // Subtle specular sheen along blade surface
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfVector = normalize(lightDir + viewDir);
    float spec = pow(max(dot(vNormal, halfVector), 0.0), 16.0) * 0.15 * vUv.y;
    vec3 specColor = vec3(0.5, 0.8, 0.4) * spec;

    vec3 grassColor = (mix(darkRoot, brightTip + tipHighlight, vUv.y) + specColor) * lighting;

    // Burnt ash colors
    vec3 ashBottomColor = vec3(0.04, 0.04, 0.04);
    vec3 ashTopColor = vec3(0.12, 0.09, 0.09);
    vec3 ashColor = mix(ashBottomColor, ashTopColor, vUv.y);

    // Add glowing ember effect based on burn level
    float isBurning = smoothstep(0.5, 0.9, vBurn) - smoothstep(0.95, 1.0, vBurn);
    vec3 emberColor = vec3(1.0, 0.3, 0.0) * isBurning * (1.0 - vUv.y);

    // Mix between lush grass and ash based on burn amount
    vec3 finalColor = mix(grassColor, ashColor, vBurn) + emberColor;

    // Desaturate slightly to prevent overly vivid tones
    float luminance = dot(finalColor, vec3(0.2126, 0.7152, 0.0722));
    finalColor = mix(vec3(luminance), finalColor, 0.88);

    // 20% brightness boost
    gl_FragColor = vec4(finalColor * 1.60, 1.0);
  }
`;
