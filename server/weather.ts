export type WeatherSnapshot =
  | { configured: false }
  | {
      configured: true;
      tempC: number;
      condition: string;
      description: string;
      locationName: string;
    };

// Lazy + non-throwing, same pattern as getAnthropicClient(): the rest of the backend must
// keep working even before WEATHER_API_KEY is configured in a given environment.
export async function getWeatherSnapshot(location: string): Promise<WeatherSnapshot> {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) return { configured: false };

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body: any = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Weather lookup failed with ${res.status}`);
  }
  const data: any = await res.json();

  return {
    configured: true,
    tempC: Math.round(data.main.temp),
    condition: data.weather?.[0]?.main ?? "Unknown",
    description: data.weather?.[0]?.description ?? "",
    locationName: data.name ?? location,
  };
}
