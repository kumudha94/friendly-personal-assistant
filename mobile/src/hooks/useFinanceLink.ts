import { useQuery } from "@tanstack/react-query";
import * as api from "../lib/api";

// Connect/disconnect now lives in the Connected Apps screen (see useConnections.ts) — this
// just reads the snapshot once a connection exists.
export function useFinanceSnapshot() {
  return useQuery({ queryKey: ["finance-snapshot"], queryFn: api.getFinanceSnapshot });
}
