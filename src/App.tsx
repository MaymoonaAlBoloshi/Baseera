import { useState, useRef } from "react";
import i18n from "./i18n/config";
import { Gallery } from "./screens/Gallary";
import { Landing } from "./screens/Landing";
import type { OnboardingResult } from "./screens/Landing/types";
import { DevPerformancePanel } from "./components/dev-performance-panel";

type Phase = "landing" | "fading" | "gallery";

function App() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [onboarding, setOnboarding] = useState<OnboardingResult | null>(null);
  // overlay: 0 = transparent, 1 = opaque black
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleComplete = (result: OnboardingResult) => {
    setOnboarding(result);
    i18n.changeLanguage(result.language);
    // Kick off landing music fade-out and wall burst simultaneously
    window.dispatchEvent(new Event("landing-exit"));
    // Fade to black
    setOverlayOpacity(1);
    setPhase("fading");
    timerRef.current = setTimeout(() => {
      // Switch screen while still black
      setPhase("gallery");
      // Fade back in
      timerRef.current = setTimeout(() => setOverlayOpacity(0), 50);
    }, 900); // match transition duration below
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {phase === "landing" || phase === "fading" ? (
        <Landing onComplete={handleComplete} />
      ) : (
        <Gallery audioEnabled={onboarding!.audioEnabled} />
      )}

      {/* Full-screen black fade overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-black"
        style={{
          opacity: overlayOpacity,
          transition:
            overlayOpacity === 1
              ? "opacity 0.85s ease-in"
              : "opacity 1.1s ease-out",
        }}
      />

      {import.meta.env.DEV ? <DevPerformancePanel /> : null}
    </div>
  );
}

export default App;
