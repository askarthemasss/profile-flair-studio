import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSnapshot } from "../services/snapshot-service.js";

const SNAPSHOT_STALE_MS = 1000 * 60 * 10;

/** The one place that decides how a profile lookup is keyed. */
export function snapshotQueryKey(username: string) {
  return ["snapshot", username.trim().toLowerCase()] as const;
}

export function useSnapshot(username: string) {
  const handle = username.trim().toLowerCase();
  const queryClient = useQueryClient();
  const previousHandle = useRef(handle);

  // Moving to another handle supersedes the old lookup. Its abort signal stops
  // the request chain so an abandoned profile cannot race the new one for the
  // hourly GitHub budget.
  useEffect(() => {
    if (previousHandle.current === handle) return;
    const superseded = previousHandle.current;
    previousHandle.current = handle;
    void queryClient.cancelQueries({ queryKey: snapshotQueryKey(superseded) });
  }, [handle, queryClient]);

  const query = useQuery({
    queryKey: snapshotQueryKey(handle),
    queryFn: ({ signal }) => fetchSnapshot(handle, signal),
    enabled: Boolean(handle),
    staleTime: SNAPSHOT_STALE_MS,
    retry: false, // surfaced immediately: not-found and rate-limit states
  });

  return {
    ...query,
    /** The normalized handle this result belongs to. */
    handle,
  };
}
