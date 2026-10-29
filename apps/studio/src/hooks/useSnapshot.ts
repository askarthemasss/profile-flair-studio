import { useQuery } from "@tanstack/react-query";
import { fetchSnapshot } from "../services/snapshot-service.js";

export function useSnapshot(username: string) {
  return useQuery({
    queryKey: ["snapshot", username],
    queryFn: () => fetchSnapshot(username),
    enabled: Boolean(username.trim()),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
