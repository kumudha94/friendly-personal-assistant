import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/api";

export function useQuickAdd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.quickAdd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}
