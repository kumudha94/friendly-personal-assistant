import { useQuery } from "@tanstack/react-query";
import * as api from "../lib/api";

// 45 min staleTime (same in-memory react-query cache every other query in this app already
// uses) — avoids re-hitting the weather API on every Dashboard focus/pull-to-refresh.
export function useWeatherSnapshot(location: string | undefined) {
  return useQuery({
    queryKey: ["weather", location],
    queryFn: () => api.getWeather(location!),
    enabled: !!location,
    staleTime: 45 * 60 * 1000,
  });
}
