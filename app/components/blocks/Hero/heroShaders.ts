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
  #define MAX_GUSTS 6
  
  uniform float uTime;
  uniform sampler2D uBurnMap;
  uniform float uWindSpeed;
  uniform float uWindStrength;
  uniform float uWindWidth;
  uniform vec2 uWindDirection;
  uniform float uWindPosition;
  uniform float uAmbientStrength;
  uniform float uWindFrequency;
  uniform float uBendStrength;
  
  uniform vec4 uGusts[MAX_GUSTS];      // x: posX, y: posZ, z: widthX, w: strength
  uniform vec4 uGustsExtra[MAX_GUSTS]; // x: radiusZ, y: angle, z: active (0 or 1), w: unused
  
  attribute vec3 instancePosition;
  attribute float instanceRotation;
  attribute float instanceScale;
  attribute vec3 instanceColor;
  
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vBurn;
  varying vec3 vInstancePos;
  varying vec3 vNormal;
  varying float vWindBend;
  
  // Fast high-quality pseudo-random hash functions
  float hash1(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(39.345, 61.123))) * 23421.631);
  }
  float hash3(vec2 p) {
    return fract(sin(dot(p, vec2(73.156, 19.821))) * 31415.926);
  }
  
  // Rotate around Y axis
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
    
    // 1. Burn map sampling and scaling
    float planeSize = 50.0;
    vec2 mapUv = vec2(
        (instancePosition.x / planeSize) + 0.5,
        1.0 - ((instancePosition.z / planeSize) + 0.5)
    );
    float burnAmount = texture2D(uBurnMap, mapUv).r;
    vBurn = burnAmount;
    float burnScaleFactor = 1.0 - (burnAmount * 0.9);
    
    // Remove grass near pond
    float distToPond = distance(instancePosition.xz, vec2(0.0, -15.0));
    float pondFactor = smoothstep(5.0, 6.0, distToPond);
    
    float heightScale = instanceScale * 2.3 * burnScaleFactor * pondFactor;
    float widthScale = instanceScale * mix(1.0, 0.3, burnAmount) * pondFactor;
    vec3 scaleVec = vec3(widthScale, heightScale, widthScale);
    vec3 pos = position * scaleVec;
    
    // Rotate blade mesh in local coordinates
    mat4 rotMat = rotateY(instanceRotation);
    vec3 localRotPos = (rotMat * vec4(pos, 1.0)).xyz;
    vec3 baseWorldNormal = normalize((rotMat * vec4(normal, 0.0)).xyz);
    
    // 2. Per-blade unique random seeds
    float rand1 = hash1(instancePosition.xz);
    float rand2 = hash2(instancePosition.xz);
    float rand3 = hash3(instancePosition.xz);
    
    // 3. Multi-Gust Dynamic Evaluation (coherent volume of localized wind)
    vec2 accumGustDisp = vec2(0.0);
    vec2 bPos = instancePosition.xz;
    
    for (int i = 0; i < MAX_GUSTS; i++) {
      if (uGustsExtra[i].z < 0.5) continue; // Skip inactive gusts
      
      vec2 gustPos = uGusts[i].xy;
      float gustWidth = max(uGusts[i].z, 14.0);
      float gustStrength = uGusts[i].w;
      float gustRadiusZ = max(uGustsExtra[i].x, 14.0);
      float gustAngle = uGustsExtra[i].y;
      
      // Defined lateral falloff across Z (safe C1 bell curve, zero at boundary)
      float dz = abs(bPos.y - gustPos.y);
      if (dz >= gustRadiusZ) continue;
      float zNorm = clamp(dz / gustRadiusZ, 0.0, 1.0);
      float zFalloff = (1.0 - zNorm * zNorm);
      zFalloff = zFalloff * zFalloff;
      
      // Coordinates along wind direction (rotated by gustAngle)
      vec2 delta = bPos - gustPos;
      float cA = cos(-gustAngle);
      float sA = sin(-gustAngle);
      float alongX = delta.x * cA - delta.y * sA;
      float acrossZ = delta.x * sA + delta.y * cA;
      
      // Coherent wavefront curvature (smooth natural air volume)
      float frontWave = sin(acrossZ * 0.10) * 1.3;
      // Subtle individual blade timing within the wind volume
      float bladeTiming = (rand3 - 0.5) * 0.5;
      float bladeDist = alongX + frontWave + bladeTiming;
      
      // Coherent Wind Volume Profile:
      // - Leading edge: wind approaches → grass gradually and smoothly begins bending
      // - Peak: smooth, natural deformation at strongest point
      // - Trailing edge: slow, gentle physical recovery with subtle, calm overshoot (~4%)
      float wCrest = gustWidth * 0.12;
      float wLead = gustWidth * 0.45;
      float wTrail = gustWidth * 0.85; // Generous distance for a slow, peaceful recovery
      float volumeBend = 0.0;
      
      if (abs(bladeDist) <= wCrest) {
        // Smooth rounded peak with zero discontinuity at boundaries
        float cNorm = abs(bladeDist) / wCrest;
        volumeBend = 1.075 + 0.075 * cos(cNorm * 3.14159265);
      } else if (bladeDist > wCrest && bladeDist < (wCrest + wLead)) {
        // Leading edge: gradual C1-smooth build-up
        float t = (bladeDist - wCrest) / wLead;
        volumeBend = 0.5 + 0.5 * cos(t * 3.14159265);
      } else if (bladeDist < -wCrest && bladeDist > -(wCrest + wTrail)) {
        // Trailing edge: slow, subtle physical recovery
        // The blade slowly unbends, reaches resting, gently overshoots by only ~4%,
        // and softly settles into the resting baseline with zero fast ringing.
        float u = (-bladeDist - wCrest) / wTrail; // 0.0 at peak release, 1.0 at full rest
        // Closed-form damped return with C1 boundary continuity at both u=0 and u=1
        volumeBend = (1.0 - u) * (1.0 - u) * (cos(3.6 * u) + 0.555 * sin(3.6 * u));
      }
      
      if (abs(volumeBend) > 0.0001) {
        // Organic blade nuance within the coherent volume
        float bladeStiffness = mix(0.92, 1.08, rand2);
        float bladeAngle = gustAngle + (rand1 - 0.5) * 0.08;
        
        float rawBend = volumeBend * zFalloff * gustStrength * bladeStiffness;
        // Saturation applied per-gust so that new incoming gusts add linearly to existing state without pulling/jumping back
        float satBend = rawBend / (1.0 + 0.18 * abs(rawBend));
        
        vec2 gustDir = vec2(cos(bladeAngle), sin(bladeAngle));
        accumGustDisp += gustDir * satBend;
      }
    }
    
    // Per-blade wind bend value for responsive lighting
    float rawMag = length(accumGustDisp);
    vWindBend = clamp(rawMag, 0.0, 1.5);
    
    // 4. Natural Ambient Movement Underneath (continuous baseline sway)
    float ambTime = uTime * 0.60;
    vec2 ambCoord = instancePosition.xz * 0.08;
    float amb1 = sin(ambCoord.x * 1.1 + ambCoord.y * 0.6 + ambTime * 0.85 + rand1 * 2.0);
    float amb2 = cos(ambCoord.x * 0.6 - ambCoord.y * 1.1 + ambTime * 0.70 + rand2 * 2.0) * 0.6;
    vec2 ambientDisp = vec2(amb1 + amb2, amb2 * 0.65) * (uAmbientStrength * 0.28);
    
    // 5. Total displacement vector
    vec2 totalHorizDisp = (accumGustDisp * uWindStrength + ambientDisp) * uBendStrength;
    
    // 6. Progressive Bending: base anchored (uv.y=0), tip bends non-linearly
    float heightNorm = clamp(uv.y, 0.0, 1.0);
    float bendCurve = pow(heightNorm, 2.2);
    
    // World space deformation
    vec3 deformedWorldPos = localRotPos + instancePosition;
    deformedWorldPos.x += totalHorizDisp.x * bendCurve * burnScaleFactor * 0.85;
    deformedWorldPos.z += totalHorizDisp.y * bendCurve * burnScaleFactor * 0.85;
    
    // Physical vertical dip: smooth quadratic rod curvature (C-infinity, zero cusp at 0)
    float dispSq = dot(totalHorizDisp, totalHorizDisp);
    deformedWorldPos.y -= dispSq * 0.16 * pow(heightNorm, 2.6) * burnScaleFactor;
    
    // 7. Deform normal according to bend derivative for accurate lighting shift
    // Perfectly smooth and differentiable as displacement passes through 0 (zero twitch/glitch)
    vec3 tiltNormal = baseWorldNormal + vec3(totalHorizDisp.x, -0.38 * totalHorizDisp.x, totalHorizDisp.y) * (1.6 * pow(heightNorm, 1.3));
    vNormal = normalize(tiltNormal);
    
    // Project to screen
    gl_Position = projectionMatrix * modelViewMatrix * vec4(deformedWorldPos, 1.0);
  }
`;

export const grassFragmentShader = `
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vBurn;
  varying vec3 vInstancePos;
  varying vec3 vNormal;
  varying float vWindBend;
  
  void main() {
    // 1. Depth lighting gradient (foreground sunlit, background under house shadowed)
    float depthFactor = smoothstep(-14.0, 10.0, vInstancePos.z);
    
    // 2. House shadow & occlusion
    float houseBehindOcclusion = smoothstep(3.0, -6.0, vInstancePos.z) * (1.0 - smoothstep(8.5, 16.0, abs(vInstancePos.x)));
    float shadowFactor = mix(1.0, 0.78, houseBehindOcclusion);
    
    // 3. Directional sun lighting & translucent subsurface scattering (SSS)
    vec3 sunDir = normalize(vec3(2.5, 7.5, 9.0));
    float diff = max(dot(vNormal, sunDir), 0.0);
    // Translucent SSS back-glow through leaf blade
    float sss = max(dot(-vNormal, sunDir), 0.0) * 0.52;
    // Ambient hemisphere sky light
    float skyLight = mix(0.40, 0.70, vNormal.y * 0.5 + 0.5);
    float lighting = (diff + sss + skyLight) * shadowFactor;
    
    // 4. Ambient occlusion near roots & blade spine highlight
    float rootAO = smoothstep(0.0, 0.28, vUv.y);
    float spineHighlight = (1.0 - abs(vUv.x - 0.5) * 1.8) * 0.12 * vUv.y;
    
    // 5. Specular sheen along blade surface
    vec3 viewDir = normalize(vec3(0.0, 0.45, 1.0));
    vec3 halfVec = normalize(sunDir + viewDir);
    float specAngle = max(dot(vNormal, halfVec), 0.0);
    float baseSpec = pow(specAngle, 24.0) * 0.22 * smoothstep(0.15, 1.0, vUv.y);
    vec3 specColor = vec3(0.65, 0.95, 0.45) * baseSpec;
    
    // 6. Wind-driven sun shimmer wave: flashes along the crest of the traveling gust
    float windShimmer = pow(specAngle, 10.0) * smoothstep(0.08, 0.6, vWindBend) * 0.48 * smoothstep(0.2, 1.0, vUv.y);
    vec3 shimmerColor = vec3(0.98, 0.96, 0.68) * windShimmer * depthFactor;
    
    // 7. Multi-tone color gradient: dark emerald root -> lush vibrant mid -> golden sun-kissed tip
    vec3 darkRoot = vColor * 0.38 * mix(0.70, 1.0, depthFactor) * shadowFactor;
    vec3 midColor = vColor * 0.92 * mix(0.85, 1.15, depthFactor) * shadowFactor;
    vec3 brightTip = mix(vColor * 1.35, vec3(0.75, 0.92, 0.30), 0.35) * depthFactor * shadowFactor;
    vec3 bladeColor = mix(mix(darkRoot, midColor, smoothstep(0.0, 0.45, vUv.y)), brightTip, smoothstep(0.45, 1.0, vUv.y));
    
    // Combine grass lighting components
    vec3 grassColor = ((bladeColor * rootAO) + spineHighlight + specColor + shimmerColor) * lighting;
    
    // 8. Burnt ash & glowing ember interaction
    vec3 ashBottomColor = vec3(0.04, 0.04, 0.04);
    vec3 ashTopColor = vec3(0.12, 0.09, 0.09);
    vec3 ashColor = mix(ashBottomColor, ashTopColor, vUv.y);
    
    float isBurning = smoothstep(0.5, 0.9, vBurn) - smoothstep(0.95, 1.0, vBurn);
    vec3 emberColor = vec3(1.0, 0.3, 0.0) * isBurning * (1.0 - vUv.y);
    vec3 finalColor = mix(grassColor, ashColor, vBurn) + emberColor;
    
    // Natural tone adjustment
    float lum = dot(finalColor, vec3(0.2126, 0.7152, 0.0722));
    finalColor = mix(vec3(lum), finalColor, 0.92);
    
    gl_FragColor = vec4(finalColor * 1.55, 1.0);
  }
`;

