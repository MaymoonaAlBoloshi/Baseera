import { useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";

import type { MobileInputState } from "../types";

type MobileControlsProps = {
  inputRef: MutableRefObject<MobileInputState>;
  /** Whether movement and look should be suppressed (overlay open) */
  isDisabled: boolean;
  /** Shown when near a painting — triggers selection */
  nearbyArtworkTitle: string | null;
  onSelectNearby: () => void;
};

const JOYSTICK_MAX_RADIUS = 52;
const TOUCH_LOOK_SENSITIVITY = 0.0032;

export const MobileControls = ({
  inputRef,
  isDisabled,
  nearbyArtworkTitle,
  onSelectNearby,
}: MobileControlsProps) => {
  // Joystick visual state
  const [joystick, setJoystick] = useState<{
    baseX: number;
    baseY: number;
    knobX: number;
    knobY: number;
    norm: number;
    visible: boolean;
  }>({ baseX: 0, baseY: 0, knobX: 0, knobY: 0, norm: 0, visible: false });

  // Track which touch IDs belong to joystick vs look
  const joystickTouchId = useRef<number | null>(null);
  const joystickBaseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lookTouchId = useRef<number | null>(null);
  const lookLastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (isDisabled) {
      joystickTouchId.current = null;
      lookTouchId.current = null;
      inputRef.current.moveX = 0;
      inputRef.current.moveZ = 0;
      setJoystick((j) => ({ ...j, visible: false }));
      return;
    }

    const screenW = () => window.innerWidth;

    const onTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];

        if (t.clientX < screenW() * 0.45) {
          // Left zone → joystick
          if (joystickTouchId.current === null) {
            joystickTouchId.current = t.identifier;
            joystickBaseRef.current = { x: t.clientX, y: t.clientY };
            setJoystick({
              baseX: t.clientX,
              baseY: t.clientY,
              knobX: t.clientX,
              knobY: t.clientY,
              norm: 0,
              visible: true,
            });
          }
        } else {
          // Right zone → look
          if (lookTouchId.current === null) {
            lookTouchId.current = t.identifier;
            lookLastPos.current = { x: t.clientX, y: t.clientY };
          }
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();

      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];

        if (t.identifier === joystickTouchId.current) {
          const base = joystickBaseRef.current;
          const rawDX = t.clientX - base.x;
          const rawDY = t.clientY - base.y;
          const dist = Math.sqrt(rawDX * rawDX + rawDY * rawDY);
          const clamp = Math.min(dist, JOYSTICK_MAX_RADIUS);
          const angle = Math.atan2(rawDY, rawDX);

          const knobX = base.x + Math.cos(angle) * clamp;
          const knobY = base.y + Math.sin(angle) * clamp;

          // Normalise to -1..1 and write synchronously (not inside updater)
          const norm = clamp / JOYSTICK_MAX_RADIUS;
          inputRef.current.moveX = Math.cos(angle) * norm;
          inputRef.current.moveZ = Math.sin(angle) * norm;

          setJoystick((j) => ({ ...j, knobX, knobY, norm }));
        }

        if (t.identifier === lookTouchId.current) {
          const dx = t.clientX - lookLastPos.current.x;
          const dy = t.clientY - lookLastPos.current.y;
          lookLastPos.current = { x: t.clientX, y: t.clientY };
          inputRef.current.lookDX += dx * TOUCH_LOOK_SENSITIVITY;
          inputRef.current.lookDY += dy * TOUCH_LOOK_SENSITIVITY;
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];

        if (t.identifier === joystickTouchId.current) {
          joystickTouchId.current = null;
          inputRef.current.moveX = 0;
          inputRef.current.moveZ = 0;
          setJoystick((j) => ({ ...j, norm: 0, visible: false }));
        }

        if (t.identifier === lookTouchId.current) {
          lookTouchId.current = null;
        }
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [isDisabled, inputRef]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 select-none">
      {/* ── Joystick ──────────────────────────────────── */}
      {joystick.visible && (
        <>
          {/* Base ring */}
          <div
            className="absolute rounded-full border bg-white/5"
            style={{
              width: JOYSTICK_MAX_RADIUS * 2,
              height: JOYSTICK_MAX_RADIUS * 2,
              left: joystick.baseX - JOYSTICK_MAX_RADIUS,
              top: joystick.baseY - JOYSTICK_MAX_RADIUS,
              borderColor: `rgba(255,255,255,${0.12 + joystick.norm * 0.28})`,
            }}
          />
          {/* Knob — size and brightness scale with push magnitude */}
          {(() => {
            const knobSize = 28 + joystick.norm * 16;
            const knobOpacity = 0.28 + joystick.norm * 0.42;
            return (
              <div
                className="absolute rounded-full"
                style={{
                  width: knobSize,
                  height: knobSize,
                  left: joystick.knobX - knobSize / 2,
                  top: joystick.knobY - knobSize / 2,
                  background: `rgba(255,255,255,${knobOpacity})`,
                  transition: "width 60ms linear, height 60ms linear",
                }}
              />
            );
          })()}
        </>
      )}

      {/* ── "View" button — appears when near a painting ─ */}
      {nearbyArtworkTitle && !isDisabled && (
        <div className="pointer-events-auto absolute bottom-24 left-1/2 -translate-x-1/2">
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              onSelectNearby();
            }}
            className="border border-gallery-border bg-gallery-background/80 px-8 py-3 text-[11px] tracking-[0.3em] text-gallery-text-secondary uppercase backdrop-blur-sm active:border-gallery-text-secondary active:text-gallery-text-primary"
          >
            View painting
          </button>
        </div>
      )}

      {/* Joystick hint — shown briefly when no touch active */}
      {!joystick.visible && !isDisabled && (
        <div className="absolute bottom-8 left-8">
          <p className="text-[9px] tracking-[0.3em] text-white/20 uppercase">
            Left — move · Right — look
          </p>
        </div>
      )}
    </div>
  );
};
