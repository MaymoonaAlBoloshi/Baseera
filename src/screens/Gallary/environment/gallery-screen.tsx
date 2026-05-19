import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

import { galleryConfig } from "../configs";

type GalleryScreenProps = {
  backWallZ: number;
  iframeRef: MutableRefObject<HTMLIFrameElement | null>;
};

const RADIO_MODEL_PATH = "/models/player.glb";
const CHARACTER_MODEL_PATH = "/models/man.fbx";
const PLINTH_WIDTH = 0.9;
const PLINTH_DEPTH = 0.9;
const PLINTH_HEIGHT = 0.9;

const pickBestClip = (clips: THREE.AnimationClip[]) => {
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

  // Prefer clips with more motion data, then longer duration.
  viable.sort((a, b) => {
    const trackDiff = b.tracks.length - a.tracks.length;
    if (trackDiff !== 0) {
      return trackDiff;
    }
    return b.duration - a.duration;
  });

  return viable[0];
};

export const GalleryScreen = ({ backWallZ, iframeRef }: GalleryScreenProps) => {
  const { camera } = useThree();
  const spotRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  const characterMixerRef = useRef<THREE.AnimationMixer | null>(null);
  const hologramMaterialsRef = useRef<THREE.ShaderMaterial[]>([]);
  const lastVol = useRef(-1);
  const { scene: radioScene } = useGLTF(RADIO_MODEL_PATH);
  const characterScene = useLoader(FBXLoader, CHARACTER_MODEL_PATH);

  const normalizedRadioScene = useMemo(() => {
    const clone = radioScene.clone(true);

    clone.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(clone);
    if (box.isEmpty()) {
      return clone;
    }

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    if (size.y > 0) {
      const targetHeight = 0.35;
      const scale = targetHeight / size.y;
      clone.scale.setScalar(scale);
    }

    box.setFromObject(clone);
    box.getCenter(center);

    clone.position.x -= center.x;
    clone.position.z -= center.z;
    clone.position.y -= box.min.y;

    return clone;
  }, [radioScene]);

  const createGhostCharacter = (
    sourceScene: THREE.Object3D,
    resetList = false,
  ) => {
    const clone = cloneSkeleton(sourceScene);
    let meshCount = 0;

    if (resetList) {
      hologramMaterialsRef.current = [];
    }

    clone.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        meshCount += 1;
        obj.castShadow = false;
        obj.receiveShadow = false;
        obj.frustumCulled = false;

        const hologramMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
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
              vec3 color = base + edge + (uEdgeColor * shimmer * 0.24);

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
        (
          hologramMaterial as THREE.ShaderMaterial & { skinning: boolean }
        ).skinning = obj instanceof THREE.SkinnedMesh;
        hologramMaterialsRef.current.push(hologramMaterial);
        obj.material = hologramMaterial;
      }
    });

    const box = new THREE.Box3().setFromObject(clone);
    if (box.isEmpty()) {
      return { object: clone, hasVisibleMesh: meshCount > 0 };
    }

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);

    if (size.y > 0) {
      const targetHeight = 1.7;
      const scale = targetHeight / size.y;
      clone.scale.setScalar(scale);
    }

    box.setFromObject(clone);
    box.getCenter(center);

    clone.position.x -= center.x;
    clone.position.z -= center.z;
    clone.position.y -= box.min.y;

    return { object: clone, hasVisibleMesh: meshCount > 0 };
  };

  const normalizedCharacterScene = useMemo(() => {
    return createGhostCharacter(characterScene, true);
  }, [characterScene]);

  useEffect(() => {
    return () => {
      hologramMaterialsRef.current.forEach((material) => material.dispose());
    };
  }, []);

  const cfg = galleryConfig.galleryScreen;
  const posZ = backWallZ + cfg.wallOffset;

  const stageVec = useRef(new THREE.Vector3(0, 0, posZ));

  // Wire spotlight → target after mount
  useEffect(() => {
    if (spotRef.current && targetRef.current) {
      spotRef.current.target = targetRef.current;
    }
  }, []);

  useEffect(() => {
    const tellerClips = characterScene.animations ?? [];

    if (!tellerClips.length) {
      characterMixerRef.current = null;
      return;
    }

    const mixer = new THREE.AnimationMixer(normalizedCharacterScene.object);
    characterMixerRef.current = mixer;

    const tellerClip = pickBestClip(tellerClips);
    if (!tellerClip) {
      characterMixerRef.current = null;
      return;
    }

    const action = mixer.clipAction(tellerClip);
    action.setLoop(THREE.LoopPingPong, Infinity);
    action.clampWhenFinished = false;
    action.enabled = true;
    action.zeroSlopeAtStart = true;
    action.zeroSlopeAtEnd = true;
    action.setEffectiveWeight(1);
    action.setEffectiveTimeScale(1);
    action.reset();
    action.fadeIn(0.2);
    action.play();

    return () => {
      action.fadeOut(0.15);
      mixer.stopAllAction();
      characterMixerRef.current = null;
    };
  }, [characterScene, normalizedCharacterScene]);

  useFrame((state, delta) => {
    if (characterMixerRef.current) {
      characterMixerRef.current.update(delta);
    }

    const elapsed = state.clock.elapsedTime;
    hologramMaterialsRef.current.forEach((material, index) => {
      const timeUniform = material.uniforms.uTime;
      const opacityUniform = material.uniforms.uOpacity;
      const warpUniform = material.uniforms.uWarpAmount;
      const sliceUniform = material.uniforms.uSliceAmount;
      const geoUniform = material.uniforms.uGeoDistort;
      const patternUniform = material.uniforms.uPatternDistort;
      const glitchUniform = material.uniforms.uGlitchStrength;

      if (timeUniform) {
        timeUniform.value = elapsed + index * 0.06;
      }
      if (opacityUniform) {
        // Two beating frequencies → irregular rapid in-out strobe effect
        const a = Math.abs(Math.sin(elapsed * 22.0 + index * 1.3));
        const b = Math.abs(Math.sin(elapsed * 7.5 + index * 0.9));
        opacityUniform.value = Math.min(
          0.95,
          Math.max(0.05, a * b * 0.88 + 0.08),
        );
      }
      if (warpUniform) {
        warpUniform.value =
          0.012 + 0.008 * Math.sin(elapsed * 4.2 + index * 0.7);
      }
      if (sliceUniform) {
        const glitchBurst = Math.max(0, Math.sin(elapsed * 8.5 + index * 1.1));
        sliceUniform.value = 0.02 + glitchBurst * 0.055;
      }
      if (geoUniform) {
        geoUniform.value =
          0.035 + 0.018 * Math.sin(elapsed * 3.2 + index * 0.4);
      }
      if (patternUniform) {
        patternUniform.value =
          0.22 + 0.1 * Math.sin(elapsed * 1.7 + index * 0.35);
      }
      if (glitchUniform) {
        const burst = Math.max(0, Math.sin(elapsed * 6.2 + index * 0.9));
        glitchUniform.value = 0.85 + burst * 0.5;
      }
    });

    const dist = camera.position.distanceTo(stageVec.current);
    const t =
      1 -
      Math.max(
        0,
        Math.min(
          1,
          (dist - cfg.proximityMinDistance) /
            (cfg.proximityMaxDistance - cfg.proximityMinDistance),
        ),
      );

    // Spotlight fade
    if (spotRef.current) {
      spotRef.current.intensity += (t * 14 - spotRef.current.intensity) * 0.04;
    }

    // Proximity audio via YouTube postMessage
    const vol = Math.round(t * 100);
    if (vol !== lastVol.current) {
      lastVol.current = vol;
      const win = iframeRef.current?.contentWindow;
      if (win) {
        try {
          if (vol === 0) {
            win.postMessage(
              JSON.stringify({ event: "command", func: "mute", args: [] }),
              "*",
            );
          } else {
            win.postMessage(
              JSON.stringify({ event: "command", func: "unMute", args: [] }),
              "*",
            );
            win.postMessage(
              JSON.stringify({
                event: "command",
                func: "setVolume",
                args: [vol],
              }),
              "*",
            );
          }
        } catch (_) {}
      }
    }
  });

  return (
    <>
      <group position={[0, 0, posZ]}>
        {/* ── Museum plinth ── */}
        <mesh position={[0, PLINTH_HEIGHT / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[PLINTH_WIDTH, PLINTH_HEIGHT, PLINTH_DEPTH]} />
          <meshStandardMaterial
            color="#1a1714"
            roughness={0.88}
            metalness={0.04}
          />
        </mesh>
        {/* Plinth top cap */}
        <mesh position={[0, PLINTH_HEIGHT + 0.005, 0]}>
          <boxGeometry
            args={[PLINTH_WIDTH + 0.05, 0.015, PLINTH_DEPTH + 0.05]}
          />
          <meshStandardMaterial
            color="#c8b07a"
            metalness={0.25}
            roughness={0.6}
          />
        </mesh>

        {/* ── Radio model ── */}
        <primitive object={normalizedRadioScene} position={[0, 1.1, 0.2]} />

        {/* ── Character near radio ── */}
        <primitive
          object={normalizedCharacterScene.object}
          position={[0.95, 0, 0.95]}
          rotation={[0, -Math.PI * 0.86, 0]}
        />

        {!normalizedCharacterScene.hasVisibleMesh && (
          <mesh position={[0.95, 0.16, 0.95]} castShadow>
            <boxGeometry args={[0.14, 0.32, 0.14]} />
            <meshStandardMaterial
              color="#ff4d4d"
              emissive="#5a0f0f"
              metalness={0.1}
              roughness={0.45}
            />
          </mesh>
        )}

        {/* ── Spotlight ── */}
        <spotLight
          ref={spotRef}
          position={[0, 7.5, -1]}
          angle={0.22}
          penumbra={0.5}
          intensity={0}
          color="#fff8e8"
          castShadow
          distance={12}
          decay={2}
        />
        <object3D ref={targetRef} position={[0, 1.2, 0]} />

        {/* Dim ambient fill */}
        <pointLight
          position={[0.2, 1.7, 1.1]}
          intensity={0.28}
          color="#ffe0b0"
          distance={7}
          decay={2}
        />
      </group>
    </>
  );
};

useGLTF.preload(RADIO_MODEL_PATH);
