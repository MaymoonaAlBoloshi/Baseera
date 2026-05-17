import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";

import { galleryConfig } from "../configs";

type FootstepAudioProps = {
  isMuted: boolean;
};

export const FootstepAudio = ({ isMuted }: FootstepAudioProps) => {
  const { camera } = useThree();

  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const startedRef = useRef(false);
  const smoothGainRef = useRef(0);

  // Per-instance prev position — avoids module-level shared state bugs
  const prevRef = useRef(new Vector3());
  const currRef = useRef(new Vector3());
  const initializedRef = useRef(false);

  useEffect(() => {
    let ctx: AudioContext;

    try {
      ctx = new AudioContext();
    } catch {
      return;
    }

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);

    ctxRef.current = ctx;
    gainRef.current = gain;

    fetch("/audio/walk.mp3")
      .then((r) => r.arrayBuffer())
      .then((buf) => ctx.decodeAudioData(buf))
      .then((decoded) => {
        bufferRef.current = decoded;
      })
      .catch(() => {});

    const resume = () => ctx.resume().catch(() => {});
    document.addEventListener("click", resume);
    document.addEventListener("keydown", resume);

    return () => {
      document.removeEventListener("click", resume);
      document.removeEventListener("keydown", resume);
      ctx.close();
    };
  }, []);

  useFrame(() => {
    const ctx = ctxRef.current;
    const gain = gainRef.current;

    if (!ctx || !gain || ctx.state !== "running") return;

    // Initialise prev position on first valid frame — avoids false spike
    if (!initializedRef.current) {
      prevRef.current.copy(camera.position);
      initializedRef.current = true;
      return;
    }

    // Start the looping source once — then only control gain
    if (!startedRef.current && bufferRef.current) {
      const source = ctx.createBufferSource();
      source.buffer = bufferRef.current;
      source.loop = true;
      source.playbackRate.value = galleryConfig.audio.footstepPlaybackRate;
      source.connect(gain);
      source.start(0);
      startedRef.current = true;
    }

    if (!startedRef.current) return;

    currRef.current.copy(camera.position);
    const moved = currRef.current.distanceTo(prevRef.current);
    prevRef.current.copy(currRef.current);

    const isWalking = !isMuted && moved > galleryConfig.audio.movementThreshold;
    const target = isWalking ? galleryConfig.audio.footstepVolume : 0;
    const lerpSpeed = isWalking
      ? galleryConfig.audio.fadeInSpeed
      : galleryConfig.audio.fadeOutSpeed;

    smoothGainRef.current += (target - smoothGainRef.current) * lerpSpeed;
    gain.gain.value = Math.max(0, Math.min(1, smoothGainRef.current));
  });

  return null;
};
