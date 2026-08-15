import type { WeekDay } from "../types";

export const DAY_LABELS: Record<WeekDay, string> = {
  sun: "Sun",
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
};

// Date.getDay(): 0 = Sunday ... 6 = Saturday.
const WEEKDAY_ORDER: WeekDay[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function todayWeekDay(): WeekDay {
  return WEEKDAY_ORDER[new Date().getDay()];
}
