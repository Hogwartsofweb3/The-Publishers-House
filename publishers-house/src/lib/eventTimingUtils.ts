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

export function parseStartAndEnd(item: any): {
  start: Date;
  end: Date;
  startMs: number;
  endMs: number;
} {
  let start: Date | null = null;
  let end: Date | null = null;

  // 1. Try explicit startAt field
  if (item?.startAt) {
    const d = new Date(item.startAt);
    if (!isNaN(d.getTime())) start = d;
  }

  // 2. Try date field (ISO string like "2026-10-28")
  if (!start && item?.date && String(item.date).includes("-")) {
    const d = new Date(item.date);
    if (!isNaN(d.getTime())) start = d;
  }

  // 3. Fallback: parse from day/date/month/year/time fields
  if (!start) {
    const year = Number(item?.year) || new Date().getFullYear();
    const mStr = String(item?.month || "").toLowerCase().slice(0, 3);
    const month = MONTH_MAP[mStr] !== undefined ? MONTH_MAP[mStr] : new Date().getMonth();
    const day = parseInt(String(item?.date || "1").replace(/\D/g, ""), 10) || 1;

    let hours = 16; // default 4 PM
    let minutes = 0;
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
    start = new Date(year, month, day, hours, minutes, 0, 0);
  }

  // Try endAt
  if (item?.endAt) {
    const ed = new Date(item.endAt);
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

export function getEventTiming(item: any, now: Date = new Date()): EventTimingInfo {
  const { start, end, startMs, endMs } = parseStartAndEnd(item);
  const nowMs = now.getTime();
  const diffMs = startMs - nowMs;

  const isSameCalendarDay =
    start.getFullYear() === now.getFullYear() &&
    start.getMonth() === now.getMonth() &&
    start.getDate() === now.getDate();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    start.getFullYear() === tomorrow.getFullYear() &&
    start.getMonth() === tomorrow.getMonth() &&
    start.getDate() === tomorrow.getDate();

  const formattedRange = start.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
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

  // 3. Countdown: within 5 hours before start
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

  // 4. Today: same calendar day, but more than 5h away
  if (isSameCalendarDay) {
    const timeFormatted = item.time ? ` · ${String(item.time).replace("WAT", "").trim()}` : "";
    return {
      startMs, endMs,
      status: "today",
      badgeLabel: `Today${timeFormatted}`,
      badgeBg: "#DCFCE7",
      badgeColor: "#15803D",
      badgeBorder: "1px solid #86EFAC",
      formattedRange,
    };
  }

  // 5. Tomorrow
  if (isTomorrow) {
    return {
      startMs, endMs,
      status: "tomorrow",
      badgeLabel: "Tomorrow",
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
