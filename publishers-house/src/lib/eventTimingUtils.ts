/**
 * eventTimingUtils.ts
 * Pure utility functions — NO React hooks, safe for both server and client.
 * Import from here in API routes, server components, and client components alike.
 */

export interface EventTimingInfo {
  startMs: number;
  endMs: number;
  status: "countdown" | "live" | "today" | "tomorrow" | "upcoming" | "concluded";
  badgeLabel: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder?: string;
  isPulsing?: boolean;
  hoursLeft?: number;
  minutesLeft?: number;
  secondsLeft?: number;
  formattedRange: string;
}

const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/**
 * All church gatherings in Jos / Abuja are in West Africa Time (WAT = UTC+1).
 * Nigeria does not observe Daylight Saving Time (always UTC+1).
 * This function guarantees start and end timestamps are anchored to WAT,
 * regardless of the visitor's local device timezone or clock setting.
 */
export function parseStartAndEnd(item: any): {
  start: Date;
  end: Date;
  startMs: number;
  endMs: number;
} {
  let start: Date | null = null;
  let end: Date | null = null;

  // 1. Try explicit startAt field (ISO string)
  if (item?.startAt) {
    let str = String(item.startAt).trim();
    if (str.includes("T") && !str.includes("Z") && !/[+-]\d{2}:?\d{2}$/.test(str)) {
      // Missing timezone offset: anchor to West Africa Time (WAT = UTC+1)
      str = `${str}+01:00`;
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) start = d;
  }

  // 2. Try date field (e.g. "2026-11-05") combined with time field
  if (!start && item?.date && String(item.date).includes("-")) {
    const parts = String(item.date).split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      const year = parts[0];
      const month = parts[1] - 1; // 0-indexed
      const day = parts[2];

      let hours = 16;
      let minutes = 30;
      if (item?.time) {
        const match = String(item.time).match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
        if (match) {
          hours = parseInt(match[1], 10);
          minutes = match[2] ? parseInt(match[2], 10) : 0;
          const meridian = (match[3] || "").toUpperCase();
          if (meridian === "PM" && hours < 12) hours += 12;
          if (meridian === "AM" && hours === 12) hours = 0;
        }
      }
      // WAT is UTC+1 -> UTC hour is (hours - 1)
      start = new Date(Date.UTC(year, month, day, hours - 1, minutes, 0, 0));
    }
  }

  // 3. Fallback: parse from day/date/month/year/time fields
  if (!start) {
    const year = Number(item?.year) || new Date().getFullYear();
    const mStr = String(item?.month || "").toLowerCase().slice(0, 3);
    const month = MONTH_MAP[mStr] !== undefined ? MONTH_MAP[mStr] : new Date().getMonth();
    const day = parseInt(String(item?.date || "1").replace(/\D/g, ""), 10) || 1;

    let hours = 16;
    let minutes = 30;
    if (item?.time) {
      const match = String(item.time).match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = match[2] ? parseInt(match[2], 10) : 0;
        const meridian = (match[3] || "").toUpperCase();
        if (meridian === "PM" && hours < 12) hours += 12;
        if (meridian === "AM" && hours === 12) hours = 0;
      }
    }
    // WAT is UTC+1 -> UTC hour is (hours - 1)
    start = new Date(Date.UTC(year, month, day, hours - 1, minutes, 0, 0));
  }

  // Try endAt
  if (item?.endAt) {
    let str = String(item.endAt).trim();
    if (str.includes("T") && !str.includes("Z") && !/[+-]\d{2}:?\d{2}$/.test(str)) {
      str = `${str}+01:00`;
    }
    const ed = new Date(str);
    if (!isNaN(ed.getTime())) end = ed;
  }

  // Default end: 3.5 hours after start
  if (!end) {
    end = new Date(start.getTime() + 3.5 * 60 * 60 * 1000);
  }

  return {
    start,
    end,
    startMs: start.getTime(),
    endMs: end.getTime(),
  };
}

/**
 * Formats event time with WAT timestamp, and dynamically adds the visitor's local
 * time when they are viewing from another timezone (e.g. UK, USA, Europe).
 * Example: "16:30 WAT (11:30 AM your time)"
 */
export function formatEventTime(item: any, allowLocal: boolean = false): string {
  const rawTime = String(item?.time || "").trim();

  // Normalize base Nigerian WAT time string
  let watTime = rawTime;
  if (!watTime) {
    const { start } = parseStartAndEnd(item);
    // Format in WAT (UTC+1)
    const watDate = new Date(start.getTime() + 60 * 60 * 1000);
    const h = watDate.getUTCHours();
    const m = watDate.getUTCMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    watTime = `${h12}:${m.toString().padStart(2, "0")} ${ampm} WAT`;
  } else if (!watTime.toUpperCase().includes("WAT") && !watTime.toUpperCase().includes("GMT")) {
    watTime = `${watTime} WAT`;
  }

  // If client-side local timezone detection is enabled
  if (allowLocal && typeof window !== "undefined") {
    try {
      // in minutes (WAT is UTC+1 = -60 minutes in JS getTimezoneOffset)
      const localOffset = new Date().getTimezoneOffset();
      if (localOffset !== -60) {
        const { start } = parseStartAndEnd(item);
        const localFormatted = start.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        // Determine short timezone abbreviation if available
        let tzName = "";
        try {
          const parts = new Intl.DateTimeFormat([], { timeZoneName: "short" }).formatToParts(start);
          const tzPart = parts.find((p) => p.type === "timeZoneName");
          if (tzPart && tzPart.value && !tzPart.value.includes("GMT+1")) {
            tzName = ` ${tzPart.value}`;
          }
        } catch {}

        return `${watTime} (${localFormatted}${tzName || " your time"})`;
      }
    } catch {
      // Fallback to watTime
    }
  }

  return watTime;
}

export function getEventTiming(
  item: any,
  now: Date = new Date(),
  allowLocal: boolean = false
): EventTimingInfo {
  const { start, end, startMs, endMs } = parseStartAndEnd(item);
  const nowMs = now.getTime();
  const diffMs = startMs - nowMs;

  // Convert to WAT calendar dates (UTC+1) so "Today" and "Tomorrow" represent church calendar days
  const WAT_OFFSET_MS = 60 * 60 * 1000;
  const startWat = new Date(startMs + WAT_OFFSET_MS);
  const nowWat = new Date(nowMs + WAT_OFFSET_MS);

  const isSameCalendarDayWAT =
    startWat.getUTCFullYear() === nowWat.getUTCFullYear() &&
    startWat.getUTCMonth() === nowWat.getUTCMonth() &&
    startWat.getUTCDate() === nowWat.getUTCDate();

  const tomorrowWat = new Date(nowWat);
  tomorrowWat.setUTCDate(nowWat.getUTCDate() + 1);
  const isTomorrowWAT =
    startWat.getUTCFullYear() === tomorrowWat.getUTCFullYear() &&
    startWat.getUTCMonth() === tomorrowWat.getUTCMonth() &&
    startWat.getUTCDate() === tomorrowWat.getUTCDate();

  const formattedRange = startWat.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  // 1. Concluded: after end time
  if (nowMs > endMs) {
    return {
      startMs, endMs,
      status: "concluded",
      badgeLabel: "Concluded",
      badgeBg: "rgba(100, 110, 140, 0.12)",
      badgeColor: "#747CA1",
      badgeBorder: "1px solid rgba(100, 110, 140, 0.25)",
      formattedRange,
    };
  }

  // 2. Live Now: between start and end
  if (nowMs >= startMs && nowMs <= endMs) {
    return {
      startMs, endMs,
      status: "live",
      badgeLabel: "🔴 Live Now",
      badgeBg: "#DC2626",
      badgeColor: "#FFFFFF",
      isPulsing: true,
      formattedRange,
    };
  }

  // 3. Countdown: within 5 hours before start (universal relative time across all timezones)
  const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;
  if (diffMs > 0 && diffMs <= FIVE_HOURS_MS) {
    const hoursLeft = Math.floor(diffMs / (3600 * 1000));
    const minutesLeft = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
    const secondsLeft = Math.floor((diffMs % (60 * 1000)) / 1000);
    const timeStr = hoursLeft > 0
      ? `${hoursLeft}h ${minutesLeft}m`
      : `${minutesLeft}m ${secondsLeft}s`;

    return {
      startMs, endMs,
      status: "countdown",
      badgeLabel: `Starts in ${timeStr}`,
      badgeBg: "#EBF2FF",
      badgeColor: "#0140C1",
      badgeBorder: "1px solid #2090FF",
      isPulsing: true,
      hoursLeft,
      minutesLeft,
      secondsLeft,
      formattedRange,
    };
  }

  // Format the time portion in WAT
  let baseWatTime = item?.time ? String(item.time).replace(/WAT/i, "").trim() : "";
  if (!baseWatTime) {
    const h = startWat.getUTCHours();
    const m = startWat.getUTCMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    baseWatTime = `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
  }

  // Check visitor local timezone
  let isLocalDifferent = false;
  let localTimeStr = "";
  let localDayLabel = "";
  if (allowLocal && typeof window !== "undefined") {
    try {
      const localOffset = new Date().getTimezoneOffset();
      if (localOffset !== -60) {
        isLocalDifferent = true;
        const localFormatted = start.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        let tz = "";
        try {
          const parts = new Intl.DateTimeFormat([], { timeZoneName: "short" }).formatToParts(start);
          const p = parts.find((x) => x.type === "timeZoneName");
          if (p && p.value && !p.value.includes("GMT+1")) tz = ` ${p.value}`;
        } catch {}

        localTimeStr = `${localFormatted}${tz || " your time"}`;

        const isLocalSameDay =
          start.getFullYear() === now.getFullYear() &&
          start.getMonth() === now.getMonth() &&
          start.getDate() === now.getDate();

        const tomorrowLocal = new Date(now);
        tomorrowLocal.setDate(now.getDate() + 1);
        const isLocalTomorrow =
          start.getFullYear() === tomorrowLocal.getFullYear() &&
          start.getMonth() === tomorrowLocal.getMonth() &&
          start.getDate() === tomorrowLocal.getDate();

        if (isLocalSameDay) {
          localDayLabel = "Today";
        } else if (isLocalTomorrow) {
          localDayLabel = "Tomorrow";
        } else {
          localDayLabel = start.toLocaleDateString([], { weekday: "short" });
        }
      }
    } catch {}
  }

  // 4. Today
  if (isSameCalendarDayWAT || (isLocalDifferent && localDayLabel === "Today")) {
    let label = `Today · ${baseWatTime} WAT`;
    if (isLocalDifferent && localTimeStr) {
      if (localDayLabel === "Today") {
        label = `Today · ${baseWatTime} WAT (${localTimeStr})`;
      } else {
        label = `Today WAT (${localDayLabel} ${localTimeStr})`;
      }
    }
    return {
      startMs, endMs,
      status: "today",
      badgeLabel: label,
      badgeBg: "#DCFCE7",
      badgeColor: "#15803D",
      badgeBorder: "1px solid #86EFAC",
      formattedRange,
    };
  }

  // 5. Tomorrow
  if (isTomorrowWAT || (isLocalDifferent && localDayLabel === "Tomorrow")) {
    let label = `Tomorrow · ${baseWatTime} WAT`;
    if (isLocalDifferent && localTimeStr) {
      if (localDayLabel === "Tomorrow") {
        label = `Tomorrow · ${baseWatTime} WAT (${localTimeStr})`;
      } else {
        label = `Tomorrow WAT (${localDayLabel} ${localTimeStr})`;
      }
    }
    return {
      startMs, endMs,
      status: "tomorrow",
      badgeLabel: label,
      badgeBg: "#EBF2FF",
      badgeColor: "#0140C1",
      badgeBorder: "1px solid #BFDBFE",
      formattedRange,
    };
  }

  // 6. Upcoming (more than 1 day away)
  const daysAway = Math.ceil(diffMs / (24 * 3600 * 1000));
  const upcomingLabel = daysAway <= 7 ? `In ${daysAway} Day${daysAway !== 1 ? "s" : ""}` : "Upcoming";
  return {
    startMs, endMs,
    status: "upcoming",
    badgeLabel: upcomingLabel,
    badgeBg: "#F4F6FB",
    badgeColor: "#0140C1",
    badgeBorder: "1px solid #D3DAEC",
    formattedRange,
  };
}
