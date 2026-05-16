import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { speedGridConfig } from "./configs";
import { landingSteps } from "./data";
import { LandingScene } from "./scene";
import { LandingUi } from "./ui";

export const Landing = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = landingSteps[currentStepIndex];
  const isLastStep = currentStepIndex === landingSteps.length - 1;

  const handleAdvance = () => {
    if (isLastStep) {
      // TODO: navigate to gallery screen
      return;
    }

    setCurrentStepIndex((currentIndex) => currentIndex + 1);
  };

  return (
    <main dir="rtl" className="relative h-screen w-screen overflow-hidden bg-landing-background">
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
        currentIndex={currentStepIndex}
        totalSteps={landingSteps.length}
        onAdvance={handleAdvance}
      />
    </main>
  );
};