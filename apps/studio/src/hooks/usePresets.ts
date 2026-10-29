import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deletePreset, listPresets, savePreset } from "../services/preset-service.js";
import type { PresetParams } from "../types.js";

export function usePresets() {
  const queryClient = useQueryClient();

  const presetsQuery = useQuery({
    queryKey: ["presets"],
    queryFn: listPresets,
  });

  const saveMutation = useMutation({
    mutationFn: ({ name, preset }: { name: string; preset: PresetParams }) =>
      savePreset(name, preset),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presets"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePreset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presets"] });
    },
  });

  return {
    presets: presetsQuery.data ?? [],
    isLoading: presetsQuery.isLoading,
    savePreset: saveMutation.mutateAsync,
    deletePreset: deleteMutation.mutateAsync,
  };
}
