export type GalleryPoint = {
  x: number;
  z: number;
};

export type GalleryWallSegment = {
  id: string;
  start: GalleryPoint;
  end: GalleryPoint;
  normal: GalleryPoint;
  height: number;
};

export type GalleryFloorSegment = {
  id: string;
  position: [number, number, number];
  size: [number, number];
  rotation: [number, number, number];
};

export type GalleryZone = {
  minZ: number;
  maxZ: number;
  minX: number;
  maxX: number;
};

export type GalleryBounds = {
  zones: GalleryZone[];
  minZ: number;
  maxZ: number;
};

export type GalleryMap = {
  seed: string;
  walls: GalleryWallSegment[];
  floors: GalleryFloorSegment[];
  bounds: GalleryBounds;
};

// ─── Seeded PRNG ────────────────────────────────────────────────────────────

/** FNV-1a hash: string → unsigned 32-bit int */
const hashString = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
};

/** Mulberry32: returns a PRNG that yields floats in [0, 1) */
const makePrng = (seed: string) => {
  let a = hashString(seed);
  return (): number => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const randFloat = (prng: () => number, min: number, max: number): number =>
  min + prng() * (max - min);

/** Random float snapped to nearest `step` */
const randSnap = (
  prng: () => number,
  min: number,
  max: number,
  step: number,
): number => Math.round(randFloat(prng, min, max) / step) * step;

// ─── Layout generation ───────────────────────────────────────────────────────

const FLOOR_Y = 0;

export const createGalleryMap = (seed: string): GalleryMap => {
  const prng = makePrng(seed);

  // ── Common dimensions ──────────────────────────────────────────────────────
  const wallHeight     = randSnap(prng, 5, 7.5, 0.5);
  const ceilingY       = wallHeight;

  const corridorHalfX  = randSnap(prng, 3, 5, 0.5);
  const corridorLength = randSnap(prng, 18, 32, 2);
  const corridorStartZ = 6;
  const corridorEndZ   = corridorStartZ - corridorLength;

  const galleryExtraHalf = randSnap(prng, 5, 12, 1);
  const galleryHalfX     = corridorHalfX + galleryExtraHalf;
  const galleryDepth     = randSnap(prng, 18, 30, 2);
  const galleryEndZ      = corridorEndZ - galleryDepth;

  const corridorCenterZ = (corridorStartZ + corridorEndZ) / 2;
  const galleryCenterZ  = (corridorEndZ + galleryEndZ) / 2;
  const corridorWidth   = corridorHalfX * 2;
  const galleryWidth    = galleryHalfX * 2;

  // ── Layout variant (0=simple, 1=left-wing, 2=right-wing, 3=both-wings) ─────
  const wingFlags    = Math.floor(prng() * 4);
  const hasLeftWing  = wingFlags === 1 || wingFlags === 3;
  const hasRightWing = wingFlags === 2 || wingFlags === 3;

  const walls:  GalleryWallSegment[]  = [];
  const floors: GalleryFloorSegment[] = [];
  const zones:  GalleryZone[]         = [];

  // ── Entry corridor ─────────────────────────────────────────────────────────
  walls.push(
    { id: "corridor-left",  start: { x: -corridorHalfX, z: corridorStartZ }, end: { x: -corridorHalfX, z: corridorEndZ }, normal: { x:  1, z: 0 }, height: wallHeight },
    { id: "corridor-right", start: { x:  corridorHalfX, z: corridorStartZ }, end: { x:  corridorHalfX, z: corridorEndZ }, normal: { x: -1, z: 0 }, height: wallHeight },
  );
  floors.push(
    { id: "corridor-floor",   position: [0, FLOOR_Y,   corridorCenterZ], size: [corridorWidth, corridorLength], rotation: [-Math.PI / 2, 0, 0] },
    { id: "corridor-ceiling", position: [0, ceilingY, corridorCenterZ], size: [corridorWidth, corridorLength], rotation: [ Math.PI / 2, 0, 0] },
  );
  zones.push({ minZ: corridorEndZ + 1, maxZ: corridorStartZ - 1, minX: -(corridorHalfX - 0.5), maxX: corridorHalfX - 0.5 });

  // ── Shoulder walls (corridor → gallery transition) ─────────────────────────
  walls.push(
    { id: "shoulder-left",  start: { x: -galleryHalfX, z: corridorEndZ }, end: { x: -corridorHalfX, z: corridorEndZ }, normal: { x: 0, z: 1 }, height: wallHeight },
    { id: "shoulder-right", start: { x:  corridorHalfX, z: corridorEndZ }, end: { x:  galleryHalfX, z: corridorEndZ }, normal: { x: 0, z: 1 }, height: wallHeight },
  );

  // ── Gallery floor / ceiling ────────────────────────────────────────────────
  floors.push(
    { id: "gallery-floor",   position: [0, FLOOR_Y,  galleryCenterZ], size: [galleryWidth, galleryDepth], rotation: [-Math.PI / 2, 0, 0] },
    { id: "gallery-ceiling", position: [0, ceilingY, galleryCenterZ], size: [galleryWidth, galleryDepth], rotation: [ Math.PI / 2, 0, 0] },
  );

  // ── Main gallery zone ──────────────────────────────────────────────────────
  zones.push({ minZ: galleryEndZ + 1, maxZ: corridorEndZ, minX: -(galleryHalfX - 0.5), maxX: galleryHalfX - 0.5 });

  // ── Gallery back wall ──────────────────────────────────────────────────────
  walls.push({ id: "gallery-back", start: { x: -galleryHalfX, z: galleryEndZ }, end: { x: galleryHalfX, z: galleryEndZ }, normal: { x: 0, z: 1 }, height: wallHeight });

  // ── Left wall (split if left wing) ────────────────────────────────────────
  if (hasLeftWing) {
    const wingDepth      = randSnap(prng, 4, 8, 1);
    const maxWingLength  = Math.max(6, galleryDepth - 6);
    const wingLength     = randSnap(prng, 6, maxWingLength, 2);
    const wingHalfLen    = wingLength / 2;
    const wingStartZ     = Math.min(corridorEndZ - 1, galleryCenterZ + wingHalfLen);
    const wingEndZ       = Math.max(galleryEndZ  + 1, galleryCenterZ - wingHalfLen);
    const wingOuterX     = galleryHalfX + wingDepth;
    const wingCenterX    = -(galleryHalfX + wingDepth / 2);
    const wingCenterZVal = (wingStartZ + wingEndZ) / 2;
    const wingSpan       = wingStartZ - wingEndZ;

    // Gallery left wall — two segments around the opening
    walls.push(
      { id: "gallery-left-near", start: { x: -galleryHalfX, z: corridorEndZ }, end: { x: -galleryHalfX, z: wingStartZ }, normal: { x: 1, z: 0 }, height: wallHeight },
      { id: "gallery-left-far",  start: { x: -galleryHalfX, z: wingEndZ     }, end: { x: -galleryHalfX, z: galleryEndZ }, normal: { x: 1, z: 0 }, height: wallHeight },
    );
    // Wing walls
    walls.push(
      { id: "left-wing-near", start: { x: -wingOuterX,   z: wingStartZ }, end: { x: -galleryHalfX, z: wingStartZ }, normal: { x: 0, z: -1 }, height: wallHeight },
      { id: "left-wing-side", start: { x: -wingOuterX,   z: wingStartZ }, end: { x: -wingOuterX,   z: wingEndZ   }, normal: { x: 1, z:  0 }, height: wallHeight },
      { id: "left-wing-far",  start: { x: -galleryHalfX, z: wingEndZ   }, end: { x: -wingOuterX,   z: wingEndZ   }, normal: { x: 0, z:  1 }, height: wallHeight },
    );
    floors.push(
      { id: "left-wing-floor",   position: [wingCenterX, FLOOR_Y,  wingCenterZVal], size: [wingDepth, wingSpan], rotation: [-Math.PI / 2, 0, 0] },
      { id: "left-wing-ceiling", position: [wingCenterX, ceilingY, wingCenterZVal], size: [wingDepth, wingSpan], rotation: [ Math.PI / 2, 0, 0] },
    );
    zones.push({ minZ: wingEndZ, maxZ: wingStartZ, minX: -(wingOuterX - 0.5), maxX: galleryHalfX - 0.5 });
  } else {
    walls.push({ id: "gallery-left", start: { x: -galleryHalfX, z: corridorEndZ }, end: { x: -galleryHalfX, z: galleryEndZ }, normal: { x: 1, z: 0 }, height: wallHeight });
  }

  // ── Right wall (split if right wing) ──────────────────────────────────────
  if (hasRightWing) {
    const wingDepth      = randSnap(prng, 4, 8, 1);
    const maxWingLength  = Math.max(6, galleryDepth - 6);
    const wingLength     = randSnap(prng, 6, maxWingLength, 2);
    const wingHalfLen    = wingLength / 2;
    // Offset right wing slightly when both wings exist for visual asymmetry
    const centerOffset   = hasLeftWing ? randFloat(prng, -galleryDepth * 0.15, galleryDepth * 0.15) : 0;
    const wingStartZ     = Math.min(corridorEndZ - 1, galleryCenterZ + centerOffset + wingHalfLen);
    const wingEndZ       = Math.max(galleryEndZ  + 1, galleryCenterZ + centerOffset - wingHalfLen);
    const wingOuterX     = galleryHalfX + wingDepth;
    const wingCenterX    = galleryHalfX + wingDepth / 2;
    const wingCenterZVal = (wingStartZ + wingEndZ) / 2;
    const wingSpan       = wingStartZ - wingEndZ;

    walls.push(
      { id: "gallery-right-near", start: { x: galleryHalfX, z: corridorEndZ }, end: { x: galleryHalfX, z: wingStartZ }, normal: { x: -1, z: 0 }, height: wallHeight },
      { id: "gallery-right-far",  start: { x: galleryHalfX, z: wingEndZ     }, end: { x: galleryHalfX, z: galleryEndZ }, normal: { x: -1, z: 0 }, height: wallHeight },
    );
    walls.push(
      { id: "right-wing-near", start: { x: galleryHalfX, z: wingStartZ }, end: { x: wingOuterX,   z: wingStartZ }, normal: { x: 0, z: -1 }, height: wallHeight },
      { id: "right-wing-side", start: { x: wingOuterX,   z: wingStartZ }, end: { x: wingOuterX,   z: wingEndZ   }, normal: { x: -1, z: 0 }, height: wallHeight },
      { id: "right-wing-far",  start: { x: wingOuterX,   z: wingEndZ   }, end: { x: galleryHalfX, z: wingEndZ   }, normal: { x: 0, z:  1 }, height: wallHeight },
    );
    floors.push(
      { id: "right-wing-floor",   position: [wingCenterX, FLOOR_Y,  wingCenterZVal], size: [wingDepth, wingSpan], rotation: [-Math.PI / 2, 0, 0] },
      { id: "right-wing-ceiling", position: [wingCenterX, ceilingY, wingCenterZVal], size: [wingDepth, wingSpan], rotation: [ Math.PI / 2, 0, 0] },
    );
    zones.push({ minZ: wingEndZ, maxZ: wingStartZ, minX: -(galleryHalfX - 0.5), maxX: wingOuterX - 0.5 });
  } else {
    walls.push({ id: "gallery-right", start: { x: galleryHalfX, z: corridorEndZ }, end: { x: galleryHalfX, z: galleryEndZ }, normal: { x: -1, z: 0 }, height: wallHeight });
  }

  const bounds: GalleryBounds = {
    zones,
    minZ: galleryEndZ + 1,
    maxZ: corridorStartZ - 1,
  };

  return { seed, floors, walls, bounds };
};