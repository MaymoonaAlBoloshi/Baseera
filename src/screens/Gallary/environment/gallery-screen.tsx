import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";

import { galleryConfig } from "../configs";

type GalleryScreenProps = {
  backWallZ: number;
  iframeRef: MutableRefObject<HTMLIFrameElement | null>;
};

export const GalleryScreen = ({ backWallZ, iframeRef }: GalleryScreenProps) => {
  const { camera } = useThree();
  const spotRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  const lastVol = useRef(-1);

  const cfg = galleryConfig.galleryScreen;
  const posZ = backWallZ + cfg.wallOffset;

  const stageVec = useRef(new THREE.Vector3(0, 0, posZ));

  // Wire spotlight → target after mount
  useEffect(() => {
    if (spotRef.current && targetRef.current) {
      spotRef.current.target = targetRef.current;
    }
  }, []);

  useFrame(() => {
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
        <mesh position={[0, 0.45, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.62, 0.9, 0.62]} />
          <meshStandardMaterial
            color="#1a1714"
            roughness={0.88}
            metalness={0.04}
          />
        </mesh>
        {/* Plinth top cap */}
        <mesh position={[0, 0.905, 0]}>
          <boxGeometry args={[0.65, 0.015, 0.65]} />
          <meshStandardMaterial
            color="#c8b07a"
            metalness={0.25}
            roughness={0.6}
          />
        </mesh>

        {/* ── Radio body ── */}
        <mesh position={[0, 1.19, 0]} castShadow>
          <boxGeometry args={[0.78, 0.44, 0.34]} />
          <meshStandardMaterial
            color="#2c2318"
            roughness={0.75}
            metalness={0.08}
          />
        </mesh>

        {/* Speaker grille (left 55% of front face) */}
        <mesh position={[-0.14, 1.19, 0.172]}>
          <boxGeometry args={[0.42, 0.32, 0.01]} />
          <meshStandardMaterial
            color="#1a1208"
            roughness={0.9}
            metalness={0.05}
            wireframe
          />
        </mesh>
        {/* Speaker grille backing */}
        <mesh position={[-0.14, 1.19, 0.168]}>
          <boxGeometry args={[0.42, 0.32, 0.005]} />
          <meshStandardMaterial color="#100e08" roughness={1} />
        </mesh>

        {/* Volume knob */}
        <mesh
          position={[0.24, 1.24, 0.175]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.038, 0.038, 0.02, 14]} />
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
        {/* Knob indicator line */}
        <mesh position={[0.24, 1.274, 0.175]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.004, 0.028, 0.001]} />
          <meshStandardMaterial color="#c8b07a" />
        </mesh>

        {/* Tuning knob (slightly larger) */}
        <mesh
          position={[0.24, 1.13, 0.175]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.05, 0.05, 0.02, 14]} />
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>

        {/* Tuning dial strip */}
        <mesh position={[0, 1.3, 0.172]}>
          <boxGeometry args={[0.36, 0.04, 0.004]} />
          <meshStandardMaterial color="#e8d89a" roughness={0.5} />
        </mesh>

        {/* LED indicator (warm amber glow) */}
        <mesh position={[0.24, 1.19, 0.176]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshStandardMaterial
            color="#ff9900"
            emissive="#ff6600"
            emissiveIntensity={1.5}
          />
        </mesh>

        {/* Antenna — angled back from right-rear top */}
        <mesh
          position={[0.32, 1.72, -0.06]}
          rotation={[0.22, 0, 0.12]}
          castShadow
        >
          <cylinderGeometry args={[0.006, 0.003, 1.0, 6]} />
          <meshStandardMaterial
            color="#3a3028"
            metalness={0.7}
            roughness={0.35}
          />
        </mesh>

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
          position={[0, 1.5, 0.8]}
          intensity={0.05}
          color="#ffe0b0"
          distance={4}
          decay={2}
        />
      </group>
    </>
  );
};
