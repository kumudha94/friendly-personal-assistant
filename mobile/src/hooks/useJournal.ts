import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/api";

export function useJournalEntries() {
  return useQuery({ queryKey: ["journal_entries"], queryFn: api.getJournalEntries });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createJournalEntry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["journal_entries"] }),
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteJournalEntry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["journal_entries"] }),
  });
}
