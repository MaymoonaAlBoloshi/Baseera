import { Sparkles } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, type Mesh } from "three";

export const LightCharacter = () => {
  const groupRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y =
      1.35 + Math.sin(state.clock.elapsedTime * 0.65) * 0.08;
  });

  return (
    // Close to camera so it's clearly visible
    <group ref={groupRef} position={[0, 1.35, 3.5]}>
      {/* Warm point light that falls on walls */}
      <pointLight intensity={6} distance={18} color="#f4dfa0" decay={2} />

      {/* Core bright orb */}
      <mesh>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#fff8d0" />
      </mesh>

      {/* Inner halo — additive so it glows */}
      <mesh>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshBasicMaterial
          color="#f8d878"
          transparent
          opacity={0.18}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer diffuse corona */}
      <mesh>
        <sphereGeometry args={[0.32, 10, 10]} />
        <meshBasicMaterial
          color="#e8b840"
          transparent
          opacity={0.06}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Sparkle particles */}
      <Sparkles
        count={55}
        scale={0.9}
        size={3}
        speed={0.22}
        opacity={0.85}
        color="#ffe09a"
        noise={0.4}
      />
    </group>
  );
};
