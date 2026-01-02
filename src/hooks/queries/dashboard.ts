import { useQuery } from "@tanstack/react-query";
import * as api from "../../services/dashboard";
import { useToast } from "../../context/ToastContext";

export const dashboardKey = ["dashboard"] as const;

export function useDashboardQuery() {
    const { showToast } = useToast();
    return useQuery({
        queryKey: dashboardKey,
        queryFn: async () => {
            try {
                return await api.getDashboardStats();
            } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to load dashboard data";
                showToast("error", message, "Error");
                throw error;
            }
        },
    });
}
