import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/api";

export function useWaterLogs() {
  return useQuery({ queryKey: ["water_logs"], queryFn: api.getWaterLogs });
}

export function useSetWaterLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.setWaterLog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["water_logs"] }),
  });
}
