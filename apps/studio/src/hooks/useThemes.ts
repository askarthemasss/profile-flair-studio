import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listThemes, voteTheme } from "../services/theme-service.js";

export function useThemes() {
  const queryClient = useQueryClient();

  const themesQuery = useQuery({
    queryKey: ["themes"],
    queryFn: listThemes,
  });

  const voteMutation = useMutation({
    mutationFn: (themeId: string) => voteTheme(themeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
    },
  });

  return {
    themes: themesQuery.data ?? [],
    isLoading: themesQuery.isLoading,
    voteTheme: voteMutation.mutateAsync,
  };
}
