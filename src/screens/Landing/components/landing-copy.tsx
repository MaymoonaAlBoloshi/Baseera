type LandingCopyProps = {
  text: string;
};

export const LandingCopy = ({ text }: LandingCopyProps) => {
  return (
    <p
      dir="rtl"
      className="max-w-2xl text-center text-3xl leading-loose tracking-wide text-landing-text-primary md:text-5xl"
    >
      {text}
    </p>
  );
};