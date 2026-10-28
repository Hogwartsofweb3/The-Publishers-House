"use client";

/**
 * eventTiming.ts
 * React hook for live-updating event timing — CLIENT ONLY.
 * Re-exports pure utils from eventTimingUtils for convenience.
 */

import { useState, useEffect } from "react";
import { getEventTiming, parseStartAndEnd, type EventTimingInfo } from "@/lib/eventTimingUtils";

export type { EventTimingInfo };
export { getEventTiming, parseStartAndEnd };

export function useEventTiming(item: any): EventTimingInfo {
  const [timing, setTiming] = useState<EventTimingInfo>(() => getEventTiming(item));

  useEffect(() => {
    // Recompute immediately in case of SSR/hydration time skew
    setTiming(getEventTiming(item));

    // Tick every 1s in countdown mode, every 30s otherwise
    const tick = () => {
      const t = getEventTiming(item);
      setTiming(t);
      // Adjust interval dynamically
      timer = setTimeout(tick, t.status === "countdown" ? 1000 : 30000);
    };

    let timer = setTimeout(tick, timing.status === "countdown" ? 1000 : 30000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(item)]);

  return timing;
}
