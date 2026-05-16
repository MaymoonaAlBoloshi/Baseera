type ProgressDotsProps = {
  total: number;
  currentIndex: number;
};

export const ProgressDots = ({
  total,
  currentIndex,
}: ProgressDotsProps) => {
  return (
    <div className="flex items-center gap-3">
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={[
            "h-1.5 rounded-full transition-all duration-500",
            index === currentIndex
              ? "w-8 bg-landing-text-primary"
              : "w-1.5 bg-landing-text-secondary",
          ].join(" ")}
        />
      ))}
    </div>
  );
};