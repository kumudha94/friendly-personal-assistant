import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/api";
import type { CycleLog } from "../types";
import { getCycleSettings } from "../lib/cycleSettings";
import { scheduleCycleNotifications } from "../lib/cycleNotifications";
import { predictNextStartFromCycleLength } from "../utils/cycle";

export function useCycleLogs() {
  return useQuery({ queryKey: ["cycle_logs"], queryFn: api.getCycleLogs });
}

/** Recomputes the prediction from the latest logs + cycle-length setting and reschedules the
 * two cycle notifications — called after any change that could shift the last logged start date. */
async function rescheduleFromLatestLogs() {
  const [logs, settings] = await Promise.all([api.getCycleLogs(), getCycleSettings()]);
  const predicted = predictNextStartFromCycleLength(logs.map((l) => l.startDate), settings.cycleLengthDays);
  await scheduleCycleNotifications(predicted);
}

export function useCreateCycleLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createCycleLog,
    onSuccess: async () => {
      await rescheduleFromLatestLogs();
      queryClient.invalidateQueries({ queryKey: ["cycle_logs"] });
    },
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
    onSuccess: async () => {
      await rescheduleFromLatestLogs();
      queryClient.invalidateQueries({ queryKey: ["cycle_logs"] });
    },
  });
}
