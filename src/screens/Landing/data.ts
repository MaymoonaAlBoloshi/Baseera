import type { LandingStep } from "./types";

export const landingSteps: LandingStep[] = [
  {
    kind: "language",
    id: "language",
  },
  {
    kind: "choice",
    id: "audio",
    text: {
      ar: "هل تريد تجربة صوتية كاملة؟",
      en: "Would you like audio?",
    },
    yesLabel: { ar: "نعم", en: "Yes" },
    noLabel: { ar: "لا", en: "No" },
  },
  {
    kind: "text",
    id: "entry",
    text: {
      ar: "حين تكون مستعدًا، يبدأ العبور.",
      en: "When you are ready, the crossing begins.",
    },
    actionLabel: { ar: "دخول", en: "Enter" },
  },
];