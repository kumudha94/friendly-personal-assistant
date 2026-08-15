const MIN_DATA_POINTS = 3;

/** Pearson correlation coefficient. Returns null if there isn't enough data or no variance. */
export function pearsonCorrelation(pairs: [number, number][]): number | null {
  if (pairs.length < MIN_DATA_POINTS) return null;

  const n = pairs.length;
  const meanX = pairs.reduce((sum, [x]) => sum + x, 0) / n;
  const meanY = pairs.reduce((sum, [, y]) => sum + y, 0) / n;

  let cov = 0;
  let varX = 0;
  let varY = 0;
  for (const [x, y] of pairs) {
    const dx = x - meanX;
    const dy = y - meanY;
    cov += dx * dy;
    varX += dx * dx;
    varY += dy * dy;
  }

  if (varX === 0 || varY === 0) return null;
  return cov / Math.sqrt(varX * varY);
}

export function correlationLabel(r: number): string {
  const strength =
    Math.abs(r) >= 0.7 ? "Strong" : Math.abs(r) >= 0.4 ? "Moderate" : Math.abs(r) >= 0.2 ? "Weak" : "No clear";
  if (strength === "No clear") return "No clear pattern";
  return `${strength} ${r > 0 ? "positive" : "negative"} correlation`;
}
