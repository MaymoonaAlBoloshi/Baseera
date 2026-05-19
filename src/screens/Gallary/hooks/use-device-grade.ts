import { useMemo } from "react";

export type DeviceGrade = "high" | "low";

/**
 * Classifies the current device as "high" or "low" grade based on available
 * hardware hints. Returns "low" when there are ≤ 4 CPU cores or ≤ 4 GB RAM
 * (Chrome/Edge deviceMemory API). Falls back conservatively to "high" when the
 * API is unavailable so desktop browsers without the API are not penalised.
 */
export function useDeviceGrade(): DeviceGrade {
  return useMemo<DeviceGrade>(() => {
    const cores = navigator.hardwareConcurrency ?? 8;
    const memGb =
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;

    if (cores <= 4 || memGb <= 4) {
      return "low";
    }

    return "high";
  }, []);
}
