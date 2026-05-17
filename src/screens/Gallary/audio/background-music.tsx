import { useEffect } from "react";

import { galleryConfig } from "../configs";

export const BackgroundMusic = () => {
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

    let source: AudioBufferSourceNode | null = null;
    let buffer: AudioBuffer | null = null;
    let gestureReceived = false;

    const tryStart = () => {
      if (!buffer || !gestureReceived || source) return;
      if (ctx.state === "suspended") {
        ctx
          .resume()
          .then(tryStart)
          .catch(() => {});
        return;
      }

      source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain);
      source.start(0);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(
        galleryConfig.music.volume,
        ctx.currentTime + galleryConfig.music.fadeInDuration,
      );
    };

    fetch("/audio/crowd.mp3")
      .then((r) => r.arrayBuffer())
      .then((buf) => ctx.decodeAudioData(buf))
      .then((decoded) => {
        buffer = decoded;
        tryStart();
      })
      .catch(() => {});

    const handleGesture = () => {
      gestureReceived = true;
      ctx
        .resume()
        .then(tryStart)
        .catch(() => {});
      document.removeEventListener("click", handleGesture);
      document.removeEventListener("keydown", handleGesture);
    };

    document.addEventListener("click", handleGesture);
    document.addEventListener("keydown", handleGesture);

    return () => {
      document.removeEventListener("click", handleGesture);
      document.removeEventListener("keydown", handleGesture);
      source?.stop();
      ctx.close();
    };
  }, []);

  return null;
};
