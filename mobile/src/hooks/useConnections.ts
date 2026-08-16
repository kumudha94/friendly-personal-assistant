import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../lib/api";

const QUERY_KEY = ["connections"];

export function useConnections() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: api.getConnections });
}

export function useRequestConnectOtp() {
  return useMutation({ mutationFn: api.requestConnectOtp });
}

export function useVerifyConnectOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appId, code }: { appId: string; code: string }) => api.verifyConnectOtp(appId, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["finance-snapshot"] });
      queryClient.invalidateQueries({ queryKey: ["kitchen-snapshot"] });
    },
  });
}

export function useDisconnectApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.disconnectApp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["finance-snapshot"] });
      queryClient.invalidateQueries({ queryKey: ["kitchen-snapshot"] });
    },
  });
}
