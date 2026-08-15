import { format, subDays } from "date-fns";
import type { HabitLog } from "../types";
import { todayStr } from "./date";

/** Consecutive completed days ending today (or yesterday, if today isn't checked off yet). */
export function calculateStreak(logs: HabitLog[]): number {
  const completedDates = new Set(logs.filter((l) => l.completed).map((l) => l.date));

  let cursor = new Date();
  if (!completedDates.has(todayStr())) {
    cursor = subDays(cursor, 1);
  }

  let streak = 0;
  while (completedDates.has(format(cursor, "yyyy-MM-dd"))) {
    streak++;
    cursor = subDays(cursor, 1);
  }
  return streak;
}
