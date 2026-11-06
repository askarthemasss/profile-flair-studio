import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchSnapshot } from "../services/snapshot-service.js";
import { useStudioStore } from "../store/studio-store.js";
import { snapshotQueryKey } from "./useSnapshot.js";

/**
 * Commits a username and performs an explicit, cache-bypassing lookup.
 *
 * Typing only changes the input draft; nothing here runs until the user submits
 * the form or presses Load. Re-submitting the same handle still refreshes it.
 */
export function useProfileLoader() {
  const queryClient = useQueryClient();
  const setUser = useStudioStore((s) => s.setUser);

  return useCallback(
    (raw: string) => {
      const handle = raw.trim();
      if (!handle) return;

      // Move the preview, export panel, and URL state together. The imperative
      // fetch below seeds the same query key that useSnapshot observes.
      setUser(handle);

      void queryClient
        .fetchQuery({
          queryKey: snapshotQueryKey(handle),
          queryFn: ({ signal }) => fetchSnapshot(handle, signal, { force: true }),
          staleTime: 0,
          retry: false,
        })
        .catch(() => {
          // useSnapshot surfaces the error state; this catch only prevents an
          // unhandled rejection from the imperative fetch.
        });
    },
    [queryClient, setUser],
  );
}
