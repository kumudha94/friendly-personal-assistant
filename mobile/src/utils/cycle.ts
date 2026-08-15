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

export function predictNextStart(startDates: string[]): Date | null {
  const avg = averageCycleLength(startDates);
  if (avg === null) return null;
  const sorted = [...startDates].sort();
  const last = new Date(sorted[sorted.length - 1]);
  last.setDate(last.getDate() + Math.round(avg));
  return last;
}
