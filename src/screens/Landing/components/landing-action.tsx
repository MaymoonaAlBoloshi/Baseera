type LandingActionProps = {
  label: string;
  onClick: () => void;
};

export const LandingAction = ({ label, onClick }: LandingActionProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-landing-border px-5 py-2.5 text-xs tracking-[0.25em] uppercase text-landing-text-secondary transition hover:border-landing-text-primary hover:text-landing-text-primary"
    >
      {label}
    </button>
  );
};
