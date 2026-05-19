import * as THREE from "three";

type CreateGhostMaterialOptions = {
  isSkinned: boolean;
  registry?: THREE.ShaderMaterial[];
  enableEntryBurst?: boolean;
};

type GhostUniformUpdateOptions = {
  entryProgress?: number;
  emissionGain?: number;
  pulseEmission?: boolean;
};

export const pickBestClip = (clips: THREE.AnimationClip[]) => {
  if (!clips.length) {
    return null;
  }

  const preferredByName = ["Scared", "scared", "Idle", "idle"];
  for (const name of preferredByName) {
    const found = THREE.AnimationClip.findByName(clips, name);
    if (found && found.duration > 0.2 && found.tracks.length > 0) {
      return found;
    }
  }

  const viable = clips.filter(
    (clip) => clip.duration > 0.2 && clip.tracks.length > 0,
  );
  if (!viable.length) {
    return clips[0];
  }

  viable.sort((a, b) => {
    const trackDiff = b.tracks.length - a.tracks.length;
    if (trackDiff !== 0) {
      return trackDiff;
    }
    return b.duration - a.duration;
  });

  return viable[0];
};

export const createGhostMaterial = ({
  isSkinned,
  registry,
  enableEntryBurst = false,
}: CreateGhostMaterialOptions) => {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uEntry: { value: 1 },
      uEmissionGain: { value: 1 },
      uEntryBurstEnabled: { value: enableEntryBurst ? 1 : 0 },
      uColor: { value: new THREE.Color("#58f4ff") },
      uEdgeColor: { value: new THREE.Color("#ecffff") },
      uOpacity: { value: 0.62 },
      uScanDensity: { value: 30.0 },
      uScanSpeed: { value: 2.1 },
      uWarpAmount: { value: 0.016 },
      uFresnelPower: { value: 2.5 },
      uSliceAmount: { value: 0.038 },
      uSliceSpeed: { value: 3.4 },
      uNoiseScale: { value: 1.35 },
      uGeoDistort: { value: 0.045 },
      uPatternScale: { value: 1.9 },
      uPatternDistort: { value: 0.28 },
      uGlitchStrength: { value: 1.0 },
    },
    vertexShader: `
      #include <common>
      #include <skinning_pars_vertex>

      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying float vLocalY;

      uniform float uTime;
      uniform float uEntry;
      uniform float uEntryBurstEnabled;
      uniform float uWarpAmount;
      uniform float uSliceAmount;
      uniform float uSliceSpeed;
      uniform float uNoiseScale;
      uniform float uGeoDistort;
      uniform float uGlitchStrength;

      float hash21(vec2 p) {
        p = fract(p * vec2(234.34, 435.345));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
      }

      float noise2(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * noise2(p);
          p = p * 2.03 + vec2(11.4, -7.3);
          a *= 0.5;
        }
        return v;
      }

      void main() {
        #include <beginnormal_vertex>
        vec3 transformed = vec3(position);

        float entryBurst = (1.0 - smoothstep(0.0, 1.0, uEntry)) * uEntryBurstEnabled;
        float entryNoise = fbm(position.xy * 3.8 + vec2(uTime * 2.4, -uTime * 2.0)) - 0.5;
        float strip = fract(position.y * 6.0 + uTime * 18.0);
        transformed += objectNormal * (entryNoise * 0.34 * entryBurst);
        transformed.y += (strip - 0.5) * (0.42 * entryBurst);
        transformed.x += sin(position.y * 34.0 + uTime * 22.0) * (0.06 * entryBurst);

        float band = sin(position.y * 18.0 - uTime * 9.0);
        float drift = sin((position.y + position.x) * 5.5 + uTime * 2.2);
        float n = fbm(position.xz * uNoiseScale + vec2(uTime * 0.35, -uTime * 0.2));

        float sliceWave = sin(position.y * 22.0 + uTime * uSliceSpeed) * 0.5 + 0.5;
        float sliceMask = smoothstep(0.72, 0.98, sliceWave);
        float sliceDir = sign(sin(position.y * 9.0 + uTime * 3.4));

        transformed += objectNormal * ((n - 0.5) * uGeoDistort * uGlitchStrength);
        transformed.x += band * (uWarpAmount * 0.65);
        transformed.x += drift * (uWarpAmount * 0.5);
        transformed.z += sin(position.x * 7.5 + uTime * 2.8) * (uWarpAmount * 0.35);
        transformed.x += sliceMask * uSliceAmount * sliceDir * uGlitchStrength;

        #include <skinbase_vertex>
        #include <skinning_vertex>

        vec4 worldPos = modelMatrix * vec4(transformed, 1.0);
        vWorldPos = worldPos.xyz;
        vNormalW = normalize(normalMatrix * objectNormal);
        vLocalY = transformed.y;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uEmissionGain;
      uniform vec3 uColor;
      uniform vec3 uEdgeColor;
      uniform float uOpacity;
      uniform float uScanDensity;
      uniform float uScanSpeed;
      uniform float uFresnelPower;
      uniform float uPatternScale;
      uniform float uPatternDistort;
      uniform float uGlitchStrength;

      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying float vLocalY;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise2(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise2(p);
          p = p * 2.04 + vec2(8.4, -5.9);
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float fresnel = pow(1.0 - max(dot(normalize(vNormalW), viewDir), 0.0), uFresnelPower);

        float scan = sin((vWorldPos.y * uScanDensity) - (uTime * 12.0 * uScanSpeed));
        scan = smoothstep(0.2, 0.9, scan * 0.5 + 0.5);

        vec2 uv = vWorldPos.xz * uPatternScale;
        vec2 warp = vec2(
          fbm(uv + vec2(uTime * 0.3, -uTime * 0.15)),
          fbm(uv * 1.6 + vec2(-uTime * 0.22, uTime * 0.27))
        );
        uv += (warp - 0.5) * (uPatternDistort * uGlitchStrength);

        float plasma = fbm(uv * 2.4 + vec2(uTime * 0.7, -uTime * 0.35));
        float shimmer = fbm(uv * 5.5 + vec2(-uTime * 1.2, uTime * 1.1));
        shimmer = smoothstep(0.8, 1.0, shimmer);

        float bodyNoise = hash(vWorldPos.xy * 3.8 + uTime * 0.65);
        float fadeBands = smoothstep(0.1, 0.9, sin(vLocalY * 1.45 + uTime * 0.9) * 0.5 + 0.5);
        float dropout = smoothstep(0.08, 0.75, bodyNoise + fadeBands * 0.42);

        float softPattern = mix(scan, plasma, 0.62);
        vec3 base = mix(uColor * 0.25, uColor * 1.05, softPattern);
        vec3 edge = uEdgeColor * fresnel * 1.9;
        vec3 color = (base + edge + (uEdgeColor * shimmer * 0.24)) * uEmissionGain;

        float alpha = uOpacity * (0.2 + 0.62 * softPattern) * dropout + fresnel * 0.21 + shimmer * 0.06;
        alpha = clamp(alpha, 0.08, 0.95);

        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
  });

  (material as THREE.ShaderMaterial & { skinning: boolean }).skinning =
    isSkinned;
  if (registry) {
    registry.push(material);
  }

  return material;
};

export const updateGhostMaterialUniforms = (
  material: THREE.ShaderMaterial,
  index: number,
  elapsed: number,
  {
    entryProgress = 1,
    emissionGain = 1,
    pulseEmission = false,
  }: GhostUniformUpdateOptions = {},
) => {
  const timeUniform = material.uniforms.uTime;
  const entryUniform = material.uniforms.uEntry;
  const emissionUniform = material.uniforms.uEmissionGain;
  const opacityUniform = material.uniforms.uOpacity;
  const warpUniform = material.uniforms.uWarpAmount;
  const sliceUniform = material.uniforms.uSliceAmount;
  const geoUniform = material.uniforms.uGeoDistort;
  const patternUniform = material.uniforms.uPatternDistort;
  const glitchUniform = material.uniforms.uGlitchStrength;

  if (timeUniform) {
    timeUniform.value = elapsed + index * 0.06;
  }
  if (entryUniform) {
    entryUniform.value = entryProgress;
  }
  if (emissionUniform) {
    const pulse = pulseEmission
      ? 0.96 + 0.08 * Math.sin(elapsed * 3.3 + index * 0.5)
      : 1;
    emissionUniform.value = emissionGain * pulse;
  }
  if (opacityUniform) {
    const a = Math.abs(Math.sin(elapsed * 22.0 + index * 1.3));
    const b = Math.abs(Math.sin(elapsed * 7.5 + index * 0.9));
    opacityUniform.value = Math.min(0.95, Math.max(0.05, a * b * 0.88 + 0.08));
  }
  if (warpUniform) {
    warpUniform.value = 0.012 + 0.008 * Math.sin(elapsed * 4.2 + index * 0.7);
  }
  if (sliceUniform) {
    const glitchBurst = Math.max(0, Math.sin(elapsed * 8.5 + index * 1.1));
    sliceUniform.value = 0.02 + glitchBurst * 0.055;
  }
  if (geoUniform) {
    geoUniform.value = 0.035 + 0.018 * Math.sin(elapsed * 3.2 + index * 0.4);
  }
  if (patternUniform) {
    patternUniform.value = 0.22 + 0.1 * Math.sin(elapsed * 1.7 + index * 0.35);
  }
  if (glitchUniform) {
    const burst = Math.max(0, Math.sin(elapsed * 6.2 + index * 0.9));
    glitchUniform.value = 0.85 + burst * 0.5;
  }
};
