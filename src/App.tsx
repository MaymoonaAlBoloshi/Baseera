import { useState } from "react";
import { Gallery } from "./screens/Gallary";
import { Landing } from "./screens/Landing";
import type { OnboardingResult } from "./screens/Landing/types";

function App() {
  const [onboarding, setOnboarding] = useState<OnboardingResult | null>(null);

  if (onboarding) return <Gallery audioEnabled={onboarding.audioEnabled} />;
  return <Landing onComplete={setOnboarding} />;
}

export default App;
