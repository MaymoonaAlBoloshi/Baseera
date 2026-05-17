import { AnimatePresence, motion } from "framer-motion";
import { LandingAction } from "./components/landing-action";
import { LandingCopy } from "./components/landing-copy";
import { ProgressDots } from "./components/progress-dots";
import type { Language, LandingStep } from "./types";

const dream = { ease: [0.4, 0, 0.2, 1] as const, duration: 1.3 };

type LandingUiProps = {
  step: LandingStep;
  language: Language;
  currentIndex: number;
  totalSteps: number;
  onAdvance: () => void;
  onSelectLanguage: (lang: Language) => void;
  onChoice: (value: boolean) => void;
};

export const LandingUi = ({
  step,
  language,
  currentIndex,
  totalSteps,
  onAdvance,
  onSelectLanguage,
  onChoice,
}: LandingUiProps) => {
  return (
    <section className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="pointer-events-auto flex flex-col items-center gap-10"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={dream}
        >
          {step.kind === "language" ? (
            <p className="text-center text-2xl font-light tracking-widest text-landing-text-secondary">
              <span dir="ltr">Choose your language</span>
              <span className="mx-4 text-landing-text-muted">·</span>
              <span dir="rtl">اختر لغتك</span>
            </p>
          ) : (
            <LandingCopy text={step.text[language]} />
          )}

          <div className="flex flex-col items-center gap-6">
            {step.kind === "language" && (
              <div className="flex gap-4">
                <LandingAction
                  label="العربية"
                  onClick={() => onSelectLanguage("ar")}
                />
                <LandingAction
                  label="English"
                  onClick={() => onSelectLanguage("en")}
                />
              </div>
            )}

            {step.kind === "choice" && (
              <div className="flex gap-4">
                <LandingAction
                  label={step.yesLabel[language]}
                  onClick={() => onChoice(true)}
                />
                <LandingAction
                  label={step.noLabel[language]}
                  onClick={() => onChoice(false)}
                />
              </div>
            )}

            {step.kind === "text" && (
              <LandingAction
                label={step.actionLabel[language]}
                onClick={onAdvance}
              />
            )}

            <ProgressDots total={totalSteps} currentIndex={currentIndex} />
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
