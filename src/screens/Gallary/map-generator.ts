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

export type GalleryMap = {
  walls: GalleryWallSegment[];
  floors: GalleryFloorSegment[];
};

// Layout (top-down, X is horizontal, Z is depth going negative):
//
//        x: -4        x: 4
//            |          |
//  z=6   ┌──┴──────────┴──┐
//        │   entry corridor │   x[-4,4], z[6,-18]
//  z=-18 └──┬──────────┬──┘
//           │          │
//  z=-18 ┌──┴──────────┴──────────────────────┐
//        │       gallery room                   │   x[-14,14], z[-18,-40]
//  z=-40 └─────────────────────────────────────┘

const WALL_HEIGHT = 6;
const FLOOR_Y = 0;
const CEILING_Y = WALL_HEIGHT;

export const createGalleryMap = (): GalleryMap => {
  return {
    floors: [
      // Entry corridor floor
      {
        id: "corridor-floor",
        position: [0, FLOOR_Y, -6],
        size: [8, 24],
        rotation: [-Math.PI / 2, 0, 0],
      },
      // Entry corridor ceiling
      {
        id: "corridor-ceiling",
        position: [0, CEILING_Y, -6],
        size: [8, 24],
        rotation: [Math.PI / 2, 0, 0],
      },
      // Gallery room floor
      {
        id: "gallery-floor",
        position: [0, FLOOR_Y, -29],
        size: [28, 22],
        rotation: [-Math.PI / 2, 0, 0],
      },
      // Gallery room ceiling
      {
        id: "gallery-ceiling",
        position: [0, CEILING_Y, -29],
        size: [28, 22],
        rotation: [Math.PI / 2, 0, 0],
      },
    ],

    walls: [
      // Entry corridor — left wall
      {
        id: "corridor-left",
        start: { x: -4, z: 6 },
        end: { x: -4, z: -18 },
        normal: { x: 1, z: 0 },
        height: WALL_HEIGHT,
      },
      // Entry corridor — right wall
      {
        id: "corridor-right",
        start: { x: 4, z: 6 },
        end: { x: 4, z: -18 },
        normal: { x: -1, z: 0 },
        height: WALL_HEIGHT,
      },
      // Gallery room — left wall
      {
        id: "gallery-left",
        start: { x: -14, z: -18 },
        end: { x: -14, z: -40 },
        normal: { x: 1, z: 0 },
        height: WALL_HEIGHT,
      },
      // Gallery room — right wall
      {
        id: "gallery-right",
        start: { x: 14, z: -18 },
        end: { x: 14, z: -40 },
        normal: { x: -1, z: 0 },
        height: WALL_HEIGHT,
      },
      // Gallery room — back wall
      {
        id: "gallery-back",
        start: { x: -14, z: -40 },
        end: { x: 14, z: -40 },
        normal: { x: 0, z: 1 },
        height: WALL_HEIGHT,
      },
      // Left shoulder (transition from corridor to room, faces player coming from +Z)
      {
        id: "shoulder-left",
        start: { x: -14, z: -18 },
        end: { x: -4, z: -18 },
        normal: { x: 0, z: 1 },
        height: WALL_HEIGHT,
      },
      // Right shoulder
      {
        id: "shoulder-right",
        start: { x: 4, z: -18 },
        end: { x: 14, z: -18 },
        normal: { x: 0, z: 1 },
        height: WALL_HEIGHT,
      },
    ],
  };
};