import { Canvas } from "@react-three/fiber";
import { useState } from "react";
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

  const currentStep = landingSteps[currentStepIndex];
  const isLastStep = currentStepIndex === landingSteps.length - 1;

  const advance = () => {
    if (isLastStep) {
      onComplete({ language, audioEnabled });
    } else {
      setCurrentStepIndex((i) => i + 1);
    }
  };

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setCurrentStepIndex((i) => i + 1);
  };

  const handleChoice = (value: boolean) => {
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
