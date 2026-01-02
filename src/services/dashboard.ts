import * as http from "./http";

export interface DashboardStats {
    total_amount: number;
    product_count: number;
    customer_count: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
    return http.get<DashboardStats>("/admin/dashboard");
}
