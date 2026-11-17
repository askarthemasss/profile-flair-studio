import { useQuery } from "@tanstack/react-query";
import { listThemes } from "../services/theme-service.js";

export function useThemes() {
  const themesQuery = useQuery({
    queryKey: ["themes"],
    queryFn: listThemes,
  });

  return {
    themes: themesQuery.data ?? [],
    isLoading: themesQuery.isLoading,
  };
}
