import { useEffect, useState } from "react";

const query = "(orientation: portrait)";

export const useIsPortrait = (): boolean => {
  const [isPortrait, setIsPortrait] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setIsPortrait(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isPortrait;
};
