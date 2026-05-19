import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

import {
  createGhostMaterial,
  pickBestClip,
  updateGhostMaterialUniforms,
} from "../ghost-utils";
import type { PositionedArtwork } from "./artwork-layout";
import {
  CHARACTER_MODEL_PATH,
  ENTRY_DURATION,
  getProximityEmissionGain,
  getProximityFigureTransform,
} from "./proximity-figure-utils";

type ArtworkProximityFigureProps = {
  target: PositionedArtwork | null;
};

export const ArtworkProximityFigure = ({
  target,
}: ArtworkProximityFigureProps) => {
  const sourceScene = useLoader(FBXLoader, CHARACTER_MODEL_PATH);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionRef = useRef<THREE.AnimationAction | null>(null);
  const hologramMaterialsRef = useRef<THREE.ShaderMaterial[]>([]);
  const figureProbeRef = useRef(new THREE.Vector3());
  const entryStartRef = useRef<number>(-1);

  const normalizedFigure = useMemo(() => {
    const clone = cloneSkeleton(sourceScene);
    hologramMaterialsRef.current = [];

    clone.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = false;
        obj.receiveShadow = false;
        obj.frustumCulled = false;
        obj.material = createGhostMaterial({
          isSkinned: obj instanceof THREE.SkinnedMesh,
          registry: hologramMaterialsRef.current,
          enableEntryBurst: true,
        });
      }
    });

    const box = new THREE.Box3().setFromObject(clone);
    if (box.isEmpty()) {
      return clone;
    }

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);

    if (size.y > 0) {
      const targetHeight = 1.7;
      clone.scale.setScalar(targetHeight / size.y);
    }

    box.setFromObject(clone);
    box.getCenter(center);

    clone.position.x -= center.x;
    clone.position.z -= center.z;
    clone.position.y -= box.min.y;

    return clone;
  }, [sourceScene]);

  useEffect(() => {
    const clip = pickBestClip(sourceScene.animations ?? []);
    if (!clip) {
      mixerRef.current = null;
      actionRef.current = null;
      return;
    }

    const mixer = new THREE.AnimationMixer(normalizedFigure);
    const action = mixer.clipAction(clip);
    action.enabled = true;
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = false;
    action.play();

    mixerRef.current = mixer;
    actionRef.current = action;

    return () => {
      action.stop();
      mixer.stopAllAction();
      mixerRef.current = null;
      actionRef.current = null;
    };
  }, [normalizedFigure, sourceScene]);

  useEffect(() => {
    return () => {
      hologramMaterialsRef.current.forEach((material) => material.dispose());
    };
  }, []);

  useFrame((state) => {
    if (!target) {
      return;
    }

    const elapsed = state.clock.elapsedTime;

    // Capture entry start on the first frame after a target change
    if (entryStartRef.current === -1) {
      entryStartRef.current = elapsed;
    }
    const entryAge = elapsed - entryStartRef.current;
    const entryProgress = Math.min(1, entryAge / ENTRY_DURATION); // 0→1

    const emissionGain = getProximityEmissionGain({
      target,
      camera: state.camera,
      probe: figureProbeRef.current,
    });

    const materials = hologramMaterialsRef.current;
    for (let index = 0; index < materials.length; index += 1) {
      updateGhostMaterialUniforms(materials[index], index, elapsed, {
        entryProgress,
        emissionGain,
        pulseEmission: true,
      });
    }
  });

  useEffect(() => {
    const action = actionRef.current;
    const mixer = mixerRef.current;
    if (!target || !action || !mixer) {
      return;
    }

    const duration = action.getClip().duration;
    const randomTime = Math.random() * Math.max(duration, 0.0001);

    action.paused = false;
    action.time = randomTime;
    mixer.update(0);
    action.paused = true;

    // Trigger entry materialization effect
    entryStartRef.current = -1;
  }, [target?.artwork.id]);

  if (!target) {
    return null;
  }

  const { px, pz, rotationY } = getProximityFigureTransform(target);

  return (
    <primitive
      object={normalizedFigure}
      position={[px, 0, pz]}
      rotation={[0, rotationY, 0]}
    />
  );
};
