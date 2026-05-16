import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Euler, Vector3 } from "three";

import { galleryConfig } from "./configs";
import type { GalleryBounds } from "./map-generator";

const pressedKeys = new Set<string>();

type MovementControllerProps = {
  isDisabled: boolean;
  bounds: GalleryBounds;
};

export const MovementController = ({
  isDisabled,
  bounds,
}: MovementControllerProps) => {
  const { camera, gl } = useThree();

  const yaw = useRef(0);
  const pitch = useRef(0);

  const targetPosition = useRef(
    new Vector3(
      galleryConfig.camera.position[0],
      galleryConfig.movement.cameraHeight,
      galleryConfig.camera.position[2],
    ),
  );

  const movementVector = useMemo(() => new Vector3(), []);
  const forwardDirection = useMemo(() => new Vector3(), []);
  const rightDirection = useMemo(() => new Vector3(), []);
  const cameraRotation = useMemo(() => new Euler(0, 0, 0, "YXZ"), []);

  useEffect(() => {
    camera.position.set(
      galleryConfig.camera.position[0],
      galleryConfig.movement.cameraHeight,
      galleryConfig.camera.position[2],
    );

    targetPosition.current.set(
      galleryConfig.camera.position[0],
      galleryConfig.movement.cameraHeight,
      galleryConfig.camera.position[2],
    );
  }, [camera]);

  useEffect(() => {
    if (isDisabled && document.pointerLockElement === gl.domElement) {
      document.exitPointerLock();
    }
  }, [gl.domElement, isDisabled]);

  useEffect(() => {
    const handleClick = () => {
      if (isDisabled) {
        return;
      }

      gl.domElement.requestPointerLock();
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isDisabled || document.pointerLockElement !== gl.domElement) {
        return;
      }

      yaw.current -= event.movementX * galleryConfig.movement.lookSensitivityX;

      pitch.current -=
        event.movementY * galleryConfig.movement.lookSensitivityY;

      pitch.current = Math.max(
        galleryConfig.movement.minPitch,
        Math.min(galleryConfig.movement.maxPitch, pitch.current),
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isDisabled) {
        return;
      }

      pressedKeys.add(event.key.toLowerCase());
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeys.delete(event.key.toLowerCase());
    };

    gl.domElement.addEventListener("click", handleClick);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      gl.domElement.removeEventListener("click", handleClick);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      pressedKeys.clear();
    };
  }, [gl.domElement, isDisabled]);

  useFrame(() => {
    if (isDisabled) {
      pressedKeys.clear();
      return;
    }

    cameraRotation.set(pitch.current, yaw.current, 0);
    camera.quaternion.setFromEuler(cameraRotation);

    camera.getWorldDirection(forwardDirection);
    forwardDirection.y = 0;
    forwardDirection.normalize();

    rightDirection.crossVectors(forwardDirection, camera.up);
    rightDirection.normalize();

    movementVector.set(0, 0, 0);

    if (pressedKeys.has("w") || pressedKeys.has("arrowup")) {
      movementVector.add(forwardDirection);
    }

    if (pressedKeys.has("s") || pressedKeys.has("arrowdown")) {
      movementVector.sub(forwardDirection);
    }

    if (pressedKeys.has("a") || pressedKeys.has("arrowleft")) {
      movementVector.sub(rightDirection);
    }

    if (pressedKeys.has("d") || pressedKeys.has("arrowright")) {
      movementVector.add(rightDirection);
    }

    if (movementVector.lengthSq() > 0) {
      movementVector
        .normalize()
        .multiplyScalar(galleryConfig.movement.moveSpeed);

      targetPosition.current.add(movementVector);
    }

    const z = targetPosition.current.z;

    const matchingZones = bounds.zones.filter(
      (zone) => z >= zone.minZ && z <= zone.maxZ,
    );

    if (matchingZones.length > 0) {
      const minX = Math.min(...matchingZones.map((zone) => zone.minX));
      const maxX = Math.max(...matchingZones.map((zone) => zone.maxX));
      targetPosition.current.x = Math.max(
        minX,
        Math.min(maxX, targetPosition.current.x),
      );
    }

    targetPosition.current.z = Math.max(
      bounds.minZ,
      Math.min(bounds.maxZ, targetPosition.current.z),
    );

    targetPosition.current.y = galleryConfig.movement.cameraHeight;

    camera.position.lerp(
      targetPosition.current,
      galleryConfig.movement.positionDamping,
    );
  });

  return null;
};
