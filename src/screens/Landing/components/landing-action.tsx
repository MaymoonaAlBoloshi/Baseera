type LandingActionProps = {
  label: string;
  onClick: () => void;
};

export const LandingAction = ({
  label,
  onClick,
}: LandingActionProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-landing-border px-8 py-3 text-sm tracking-[0.25em] text-landing-text-primary transition hover:border-landing-text-primary hover:bg-landing-text-primary hover:text-landing-background"
    >
      {label}
    </button>
  );
};