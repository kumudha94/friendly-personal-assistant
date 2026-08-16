const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function averageCycleLength(startDates: string[]): number | null {
  if (startDates.length < 2) return null;
  const sorted = [...startDates].sort();
  const diffs: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    diffs.push((new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / MS_PER_DAY);
  }
  return diffs.reduce((a, b) => a + b, 0) / diffs.length;
}

/** Predicts the next period start from the last logged start date and a user-set cycle length,
 * rather than the historical average — direct and predictable, and works from a single log. */
export function predictNextStartFromCycleLength(startDates: string[], cycleLengthDays: number): Date | null {
  if (startDates.length === 0) return null;
  const sorted = [...startDates].sort();
  const last = new Date(sorted[sorted.length - 1]);
  last.setDate(last.getDate() + cycleLengthDays);
  return last;
}
