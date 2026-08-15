import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/api";

export function useMoodLogs() {
  return useQuery({ queryKey: ["mood_logs"], queryFn: api.getMoodLogs });
}

export function useSetMoodLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.setMoodLog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mood_logs"] }),
  });
}
