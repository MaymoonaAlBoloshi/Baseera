import { useMemo } from "react";

export function useIsMobile(): boolean {
  return useMemo(() => {
    if (typeof window === "undefined") return false;
    // Require BOTH a coarse pointer (touch) AND a small screen.
    // This avoids false-positives on touch-capable laptops/desktops.
    return window.matchMedia("(max-width: 1024px) and (pointer: coarse)").matches;
  }, []);
}
