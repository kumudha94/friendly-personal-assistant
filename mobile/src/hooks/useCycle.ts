import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/api";
import type { CycleLog } from "../types";

export function useCycleLogs() {
  return useQuery({ queryKey: ["cycle_logs"], queryFn: api.getCycleLogs });
}

export function useCreateCycleLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createCycleLog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cycle_logs"] }),
  });
}

export function useUpdateCycleLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<CycleLog> }) => api.updateCycleLog(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cycle_logs"] }),
  });
}

export function useDeleteCycleLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteCycleLog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cycle_logs"] }),
  });
}
