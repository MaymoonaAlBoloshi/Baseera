type LandingCopyProps = {
  text: string;
};

export const LandingCopy = ({ text }: LandingCopyProps) => {
  return (
    <p className="max-w-xl text-center text-xl leading-relaxed tracking-wide text-landing-text-primary font-light">
      {text}
    </p>
  );
};
