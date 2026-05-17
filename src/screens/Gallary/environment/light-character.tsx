import { Sparkles } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, type Group } from "three";

export const LightCharacter = () => {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y =
      2.4 + Math.sin(state.clock.elapsedTime * 0.65) * 0.12;
  });

  return (
    <group ref={groupRef} position={[0, 2.4, 0]}>
      {/* Warm point light casting on walls and floor */}
      <pointLight intensity={6} distance={20} color="#f4dfa0" decay={2} />

      {/* Core bright orb */}
      <mesh>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color="#fff8d0" />
      </mesh>

      {/* Inner halo */}
      <mesh>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshBasicMaterial
          color="#f8d878"
          transparent
          opacity={0.18}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer corona */}
      <mesh>
        <sphereGeometry args={[0.42, 10, 10]} />
        <meshBasicMaterial
          color="#e8b840"
          transparent
          opacity={0.05}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Sparkles */}
      <Sparkles
        count={60}
        scale={1.4}
        size={3.5}
        speed={0.18}
        opacity={0.8}
        color="#ffe09a"
        noise={0.5}
      />
    </group>
  );
};
