import { useMutation } from "@tanstack/react-query";
import * as api from "../lib/api";

export function usePlanEvening() {
  return useMutation({
    mutationFn: api.planEvening,
  });
}
