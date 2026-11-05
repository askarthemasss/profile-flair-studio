import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSnapshot } from "../services/snapshot-service.js";
import { useDebouncedValue } from "./useDebouncedValue.js";

/** Wait for typing to settle before spending the anonymous GitHub budget. */
const USERNAME_DEBOUNCE_MS = 500;

export function useSnapshot(username: string) {
  const handle = username.trim().toLowerCase();
  const debouncedHandle = useDebouncedValue(handle, USERNAME_DEBOUNCE_MS);
  const queryClient = useQueryClient();

  // When the debounced handle moves on, cancel the lookup for the previous
  // one. Its abort signal stops the in-flight request chain, so obsolete
  // lookups cannot race the final one for the hourly budget.
  useEffect(() => {
    return () => {
      void queryClient.cancelQueries({ queryKey: ["snapshot", debouncedHandle] });
    };
  }, [queryClient, debouncedHandle]);

  const query = useQuery({
    queryKey: ["snapshot", debouncedHandle],
    queryFn: ({ signal }) => fetchSnapshot(debouncedHandle, signal),
    enabled: Boolean(debouncedHandle),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false, // surfaced immediately: not-found and rate-limit states
  });

  return {
    ...query,
    /** The input has moved past the handle this result belongs to. */
    isDebouncing: handle !== debouncedHandle,
    handle: debouncedHandle,
  };
}
