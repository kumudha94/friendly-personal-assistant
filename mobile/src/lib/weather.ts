export function weatherEmoji(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes("thunderstorm")) return "⛈";
  if (c.includes("drizzle")) return "🌦";
  if (c.includes("rain")) return "🌧";
  if (c.includes("snow")) return "❄️";
  if (c.includes("clear")) return "☀️";
  if (c.includes("cloud")) return "☁️";
  if (c.includes("mist") || c.includes("fog") || c.includes("haze")) return "🌫";
  return "🌡";
}

// Only conditions worth changing your plans for get advice — clear/cloudy skies don't need
// Milo to say anything about them.
export function weatherAdvice(condition: string): string | null {
  const c = condition.toLowerCase();
  if (c.includes("thunderstorm")) return "best to stay indoors if you can";
  if (c.includes("rain") || c.includes("drizzle")) return "don't forget your umbrella";
  if (c.includes("snow")) return "bundle up out there";
  if (c.includes("mist") || c.includes("fog") || c.includes("haze")) return "visibility may be low";
  return null;
}
