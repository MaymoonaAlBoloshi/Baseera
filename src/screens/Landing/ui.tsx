import { LandingAction } from "./components/landing-action";
import { LandingCopy } from "./components/landing-copy";
import { ProgressDots } from "./components/progress-dots";
import type { LandingStep } from "./types";

type LandingUiProps = {
  step: LandingStep;
  currentIndex: number;
  totalSteps: number;
  onAdvance: () => void;
};

export const LandingUi = ({
  step,
  currentIndex,
  totalSteps,
  onAdvance,
}: LandingUiProps) => {
  return (
    <section className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
      <div className="pointer-events-auto flex flex-col items-center gap-10">
        <LandingCopy text={step.text} />

        <div className="flex flex-col items-center gap-6">
          <LandingAction
            label={step.buttonLabel}
            onClick={onAdvance}
          />

          <ProgressDots
            total={totalSteps}
            currentIndex={currentIndex}
          />
        </div>
      </div>
    </section>
  );
};