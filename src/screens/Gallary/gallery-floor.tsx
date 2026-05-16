import type { GalleryFloorSegment } from "./map-generator";

type GalleryFloorProps = {
  floor: GalleryFloorSegment;
};

export const GalleryFloor = ({ floor }: GalleryFloorProps) => {
  return (
    <mesh rotation={floor.rotation} position={floor.position}>
      <planeGeometry args={floor.size} />
      <meshStandardMaterial color="#12110f" roughness={1} />
    </mesh>
  );
};
