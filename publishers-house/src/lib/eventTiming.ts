"use client";

/**
 * eventTiming.ts
 * React hook for live-updating event timing — CLIENT ONLY.
 * Re-exports pure utils from eventTimingUtils for convenience.
 */

import { useState, useEffect } from "react";
import {
  getEventTiming,
  parseStartAndEnd,
  formatEventTime,
  type EventTimingInfo,
} from "@/lib/eventTimingUtils";

export type { EventTimingInfo };
export { getEventTiming, parseStartAndEnd, formatEventTime };

export function useEventTiming(item: any): EventTimingInfo {
  const [timing, setTiming] = useState<EventTimingInfo>(() => getEventTiming(item, new Date(), false));

  useEffect(() => {
    // Recompute immediately on client with allowLocal = true for local timezone detection
    setTiming(getEventTiming(item, new Date(), true));

    // Tick every 1s in countdown mode, every 30s otherwise
    const tick = () => {
      const t = getEventTiming(item, new Date(), true);
      setTiming(t);
      timer = setTimeout(tick, t.status === "countdown" ? 1000 : 30000);
    };

    let timer = setTimeout(tick, timing.status === "countdown" ? 1000 : 30000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(item)]);

  return timing;
}

/**
 * Hook to dynamically render the event time:
 * - Shows Nigerian time with timezone: e.g. "16:30 WAT"
 * - If visitor is outside Nigeria, seamlessly appends: "(11:30 AM your time)"
 */
export function useFormattedEventTime(item: any): string {
  const [display, setDisplay] = useState<string>(() => formatEventTime(item, false));

  useEffect(() => {
    setDisplay(formatEventTime(item, true));
  }, [item?.time, item?.startAt, item?.date]);

  return display;
}
