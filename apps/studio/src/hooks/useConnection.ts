import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { disconnect, getConnectionStatus, setConnected } from "../services/connection-service.js";

export function useConnection() {
  const queryClient = useQueryClient();

  const connQuery = useQuery({
    queryKey: ["connection-status"],
    queryFn: getConnectionStatus,
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connection-status"] });
    },
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      await setConnected(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connection-status"] });
    },
  });

  return {
    status: connQuery.data ?? { connected: false, scopes: [], lastUsedAt: null },
    isLoading: connQuery.isLoading,
    connect: connectMutation.mutateAsync,
    disconnect: disconnectMutation.mutateAsync,
  };
}
