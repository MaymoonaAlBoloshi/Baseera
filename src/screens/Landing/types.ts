export type Vector3Tuple = [number, number, number];

export type SpeedGridConfig = {
  camera: {
    position: Vector3Tuple;
    fov: number;
  };

  walls: {
    distanceFromCenter: number;
    depth: number;
    width: number;
    height: number;
  };

  colors: {
    background: string;
    wallBase: string;
    wallWire: [number, number, number];
  };

  drift: {
    strength: number;
    speed: number;
  };
};

export type SpeedWallProps = {
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  config: SpeedGridConfig;
};

export type Language = "ar" | "en";
export type LocalizedString = { ar: string; en: string };

export type TextStep = {
  kind: "text";
  id: string;
  text: LocalizedString;
  actionLabel: LocalizedString;
};

export type LanguageStep = {
  kind: "language";
  id: string;
};

export type ChoiceStep = {
  kind: "choice";
  id: string;
  text: LocalizedString;
  yesLabel: LocalizedString;
  noLabel: LocalizedString;
};

export type LandingStep = TextStep | LanguageStep | ChoiceStep;

export type OnboardingResult = {
  language: Language;
  audioEnabled: boolean;
};