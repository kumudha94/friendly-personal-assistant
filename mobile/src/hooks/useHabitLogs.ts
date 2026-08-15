import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/api";

export function useHabitLogs() {
  return useQuery({ queryKey: ["habit_logs"], queryFn: api.getHabitLogs });
}

export function useToggleHabitLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.setHabitLog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["habit_logs"] }),
  });
}
