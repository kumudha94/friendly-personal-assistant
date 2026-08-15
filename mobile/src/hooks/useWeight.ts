import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/api";

export function useWeightLogs() {
  return useQuery({ queryKey: ["weight_logs"], queryFn: api.getWeightLogs });
}

export function useSetWeightLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.setWeightLog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["weight_logs"] }),
  });
}
