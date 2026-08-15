import { useQuery } from "@tanstack/react-query";
import * as api from "../lib/api";

export function useKitchenSnapshot(date: string) {
  return useQuery({ queryKey: ["kitchen-snapshot", date], queryFn: () => api.getKitchenSnapshot(date) });
}
