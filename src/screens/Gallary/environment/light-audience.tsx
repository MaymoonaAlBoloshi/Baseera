import { Sparkles } from "@react-three/drei";
import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { AdditiveBlending, Vector3, type Group, type PointLight } from "three";

const COLORS = [
  "#ffaa20",
  "#ff7090",
  "#50e8c0",
  "#c890ff",
  "#ff6840",
  "#40c8ff",
  "#a0e030",
  "#ff9050",
  "#e040a0",
  "#30d0b0",
  "#9060ff",
  "#d8e040",
];

// Each waypoint carries how many frames to dwell once arrived
type Waypoint = {
  pos: [number, number, number];
  dwell: number; // frames (~60fps)
};

type WanderingOrbProps = {
  color: string;
  scale: number;
  sparkCount: number;
  speed: number;
  waypoints: Waypoint[];
  startIndex: number;
};

const WanderingOrb = ({
  color,
  scale,
  sparkCount,
  speed,
  waypoints,
  startIndex,
}: WanderingOrbProps) => {
  const ref = useRef<Group>(null);
  const idx = useRef(startIndex % waypoints.length);
  const tgt = useRef(
    new Vector3(...waypoints[startIndex % waypoints.length].pos),
  );
  const dwellLeft = useRef(0);
  const dwelling = useRef(false);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const wp = waypoints[idx.current];

    if (dwelling.current) {
      // Stay at waypoint — gentle bob only
      ref.current.position.y =
        wp.pos[1] + Math.sin(t * 0.45 + startIndex) * 0.08;
      dwellLeft.current -= 1;
      if (dwellLeft.current <= 0) {
        dwelling.current = false;
        idx.current = (idx.current + 1) % waypoints.length;
      }
      return;
    }

    // Glide toward current waypoint
    tgt.current.set(
      wp.pos[0],
      wp.pos[1] + Math.sin(t * 0.45 + startIndex) * 0.08,
      wp.pos[2],
    );
    ref.current.position.lerp(tgt.current, speed);

    // Arrive check
    const dx = ref.current.position.x - wp.pos[0];
    const dz = ref.current.position.z - wp.pos[2];
    if (Math.sqrt(dx * dx + dz * dz) < 0.5) {
      dwelling.current = true;
      dwellLeft.current = wp.dwell;
    }
  });

  return (
    <group ref={ref} position={waypoints[startIndex % waypoints.length].pos}>
      <pointLight intensity={2 * scale} distance={9} color={color} decay={2} />
      <mesh>
        <sphereGeometry args={[0.05 * scale, 10, 10]} />
        <meshBasicMaterial color="#fffaf0" />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.13 * scale, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.16}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <Sparkles
        count={sparkCount}
        scale={0.6 * scale}
        size={2.5}
        speed={0.1}
        opacity={0.75}
        color={color}
        noise={0.2}
      />
    </group>
  );
};

// Soft light above the player — lights the path
const PlayerLight = () => {
  const ref = useRef<PointLight>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (!ref.current) return;
    ref.current.position.set(
      camera.position.x,
      camera.position.y + 0.9,
      camera.position.z,
    );
  });

  return (
    <pointLight
      ref={ref}
      intensity={5}
      distance={7}
      color="#f8f0e0"
      decay={2}
    />
  );
};

type LightAudienceProps = {
  artworkPositions: [number, number, number][];
};

export const LightAudience = ({ artworkPositions }: LightAudienceProps) => {
  const orbCount = 12;

  const orbConfigs = useMemo<WanderingOrbProps[]>(() => {
    return Array.from({ length: orbCount }, (_, i) => {
      // Per-orb lateral offset so orbs spread around a painting instead of stacking
      const orbAngle = (i / orbCount) * Math.PI * 2;
      const orbRadius = 0.4 + (i % 3) * 0.25; // 0.4 / 0.65 / 0.9 m spread
      const ox = Math.cos(orbAngle) * orbRadius;
      const oz = Math.sin(orbAngle) * orbRadius;

      const positions = artworkPositions.map(
        (p) => [p[0] + ox, 1.5, p[2] + oz] as [number, number, number],
      );

      // Each orb cycles through ALL artworks, starting at a different offset
      // — no radio/home waypoints, pure artwork-to-artwork wandering
      const dwell = 300 + (i % 6) * 40; // ~5–8 s per painting

      const waypoints: Waypoint[] =
        positions.length > 0
          ? positions.map((pos) => ({ pos, dwell }))
          : [{ pos: [0, 1.5, -6] as [number, number, number], dwell: 300 }];

      return {
        color: COLORS[i % COLORS.length],
        scale: 0.7 + (i % 5) * 0.12,
        sparkCount: 16 + (i % 4) * 6,
        speed: 0.002 + (i % 4) * 0.0003,
        waypoints,
        startIndex: i, // stagger starting artwork
      };
    });
  }, [artworkPositions]);

  return (
    <>
      {orbConfigs.map((props, i) => (
        <WanderingOrb key={i} {...props} />
      ))}
      <PlayerLight />
    </>
  );
};
