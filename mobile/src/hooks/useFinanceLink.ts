import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/api";

export function useFinanceSnapshot() {
  return useQuery({ queryKey: ["finance-snapshot"], queryFn: api.getFinanceSnapshot });
}

export function useRequestFinanceOtp() {
  return useMutation({
    mutationFn: api.requestFinanceOtp,
  });
}

export function useVerifyFinanceOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => api.verifyFinanceOtp(email, code),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["finance-snapshot"] }),
  });
}

export function useUnlinkFinance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.unlinkFinance,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["finance-snapshot"] }),
  });
}
