import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/api";

export function useMemories() {
  return useQuery({ queryKey: ["memories"], queryFn: api.getMemories });
}

export function useCreateMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createMemory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["memories"] }),
  });
}

export function useUpdateMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) => api.updateMemory(id, { text }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["memories"] }),
  });
}

export function useDeleteMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteMemory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["memories"] }),
  });
}
