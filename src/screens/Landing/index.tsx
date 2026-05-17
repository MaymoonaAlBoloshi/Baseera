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
    return () => {
      clearInterval(fadeRef.current);
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
    </main>
  );
};
