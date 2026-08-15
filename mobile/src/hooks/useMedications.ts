import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/api";
import type { Medication } from "../types";

export function useMedications() {
  return useQuery({ queryKey: ["medications"], queryFn: api.getMedications });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createMedication,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["medications"] }),
  });
}

export function useUpdateMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<Medication> }) => api.updateMedication(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["medications"] }),
  });
}

export function useDeleteMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteMedication,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["medications"] }),
  });
}

export function useMedicationLogs() {
  return useQuery({ queryKey: ["medication_logs"], queryFn: api.getMedicationLogs });
}

export function useSetMedicationLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.setMedicationLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medication_logs"] });
      queryClient.invalidateQueries({ queryKey: ["medications"] });
    },
  });
}

export function useSymptomLogs() {
  return useQuery({ queryKey: ["symptom_logs"], queryFn: api.getSymptomLogs });
}

export function useCreateSymptomLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createSymptomLog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["symptom_logs"] }),
  });
}

export function useDeleteSymptomLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteSymptomLog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["symptom_logs"] }),
  });
}
