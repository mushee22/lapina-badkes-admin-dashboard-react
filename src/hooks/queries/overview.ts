import { useQuery } from "@tanstack/react-query";
import { getOverview, type OverviewParams, type OverviewData } from "../../services/overview";
import { useToast } from "../../context/ToastContext";

export const overviewKey = ["overview"] as const;

export function useOverviewQuery(params?: OverviewParams) {
  const { showToast } = useToast();
  
  return useQuery<OverviewData>({
    queryKey: [...overviewKey, params],
    queryFn: async () => {
      try {
        return await getOverview(params);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load overview";
        showToast("error", message, "Error");
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

