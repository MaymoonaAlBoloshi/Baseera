import { Canvas } from "@react-three/fiber";
import { useState, useEffect, useRef } from "react";
import { speedGridConfig } from "./configs";
import { landingSteps } from "./data";
import { LandingScene } from "./scene";
import { LandingUi } from "./ui";
import type { Language, OnboardingResult } from "./types";

type LandingProps = {
  onComplete: (result: OnboardingResult) => void;
};

export const Landing = ({ onComplete }: LandingProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [language, setLanguage] = useState<Language>("ar");
  const [audioEnabled, setAudioEnabled] = useState(true);

  const musicRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef(0);

  // Start music once on mount, clean up only when Landing unmounts
  useEffect(() => {
    const audio = new Audio("/audio/music.mp3");
    audio.loop = true;
    audio.volume = 0;
    musicRef.current = audio;
    audio.play().catch(() => {});
    let vol = 0;
    fadeRef.current = window.setInterval(() => {
      vol = Math.min(vol + 0.012, 0.45);
      audio.volume = vol;
      if (vol >= 0.45) clearInterval(fadeRef.current);
    }, 60);

    // Fade out when App signals we're transitioning to gallery
    const handleExit = () => {
      clearInterval(fadeRef.current);
      const startVol = audio.volume;
      const steps = 40;
      let step = 0;
      const out = window.setInterval(() => {
        step++;
        audio.volume = Math.max(0, startVol * (1 - step / steps));
        if (step >= steps) clearInterval(out);
      }, 22); // ~880 ms total
    };
    window.addEventListener("landing-exit", handleExit);

    return () => {
      clearInterval(fadeRef.current);
      window.removeEventListener("landing-exit", handleExit);
      audio.pause();
      audio.src = "";
    };
  }, []);

  const currentStep = landingSteps[currentStepIndex];
  const isLastStep = currentStepIndex === landingSteps.length - 1;

  const triggerWallBurst = () =>
    window.dispatchEvent(new Event("landing-transition"));

  const advance = () => {
    triggerWallBurst();
    if (isLastStep) {
      onComplete({ language, audioEnabled });
    } else {
      setCurrentStepIndex((i) => i + 1);
    }
  };

  const handleSelectLanguage = (lang: Language) => {
    triggerWallBurst();
    setLanguage(lang);
    setCurrentStepIndex((i) => i + 1);
  };

  const handleChoice = (value: boolean) => {
    triggerWallBurst();
    if (currentStep.id === "audio") setAudioEnabled(value);
    setCurrentStepIndex((i) => i + 1);
  };

  return (
    <main
      dir={language === "ar" ? "rtl" : "ltr"}
      className="relative h-screen w-screen overflow-hidden bg-landing-background"
    >
      <Canvas
        camera={{
          position: speedGridConfig.camera.position,
          fov: speedGridConfig.camera.fov,
        }}
      >
        <LandingScene />
      </Canvas>

      <LandingUi
        step={currentStep}
        language={language}
        currentIndex={currentStepIndex}
        totalSteps={landingSteps.length}
        onAdvance={advance}
        onSelectLanguage={handleSelectLanguage}
        onChoice={handleChoice}
      />

      {/* Cinematic vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 30%, rgba(5,5,4,0.55) 70%, rgba(5,5,4,0.92) 100%)",
        }}
      />
    </main>
  );
};
