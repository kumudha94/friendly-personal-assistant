import { useMutation } from "@tanstack/react-query";
import * as api from "../lib/api";

export function useGenerateDigest() {
  return useMutation({
    mutationFn: (period: "daily" | "weekly") => api.getDigest(period),
  });
}
