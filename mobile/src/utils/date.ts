import { format, subDays } from "date-fns";

export function todayStr(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function lastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => format(subDays(new Date(), n - 1 - i), "yyyy-MM-dd"));
}
