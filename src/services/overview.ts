import * as http from "./http";

export interface OverviewParams {
  date_from?: string;
  date_to?: string;
  location_id?: number;
  store_id?: number;
  delivery_boy_id?: number;
}

export interface OrderStats {
  total: number;
  order_placed: number;
  ready_to_dispatch: number;
  out_of_delivery: number;
  delivered: number;
  cancelled: number;
}

export interface RevenueStats {
  total_amount: number;
  subtotal_amount: number;
  discount_amount: number;
  completed_amount: number;
  pending_amount: number;
  active_amount: number;
  order_placed_amount: number;
  ready_to_dispatch_amount: number;
}

export interface UserStats {
  total_users: number;
  customers: number;
  store_owners: number;
  delivery_boys: number;
  admins: number;
  active_users: number;
  inactive_users: number;
}

export interface StoreStats {
  total_stores: number;
  active_stores: number;
  inactive_stores: number;
}

export interface LocationStats {
  total_locations: number;
  active_locations: number;
  inactive_locations: number;
}

export interface ProductStats {
  total_products: number;
  available_products: number;
  unavailable_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
}

export interface DeliveryBoyStats {
  total_delivery_boys: number;
  active_delivery_boys: number;
  assigned_orders: number;
  unassigned_orders: number;
}

export interface StatusBreakdown {
  pending: number;
  confirmed: number;
  preparing: number;
  ready: number;
  order_assigned: number;
  order_pickup: number;
  out_for_delivery: number;
  delivered: number;
  cancelled: number;
}

export interface TimePeriodStats {
  total: number;
  completed?: number;
  pending?: number;
  active?: number;
  delivered?: number;
  order_placed?: number;
  amount: number;
}

export interface RecentOrder {
  id: number;
  order_number: string;
  customer_name: string;
  store_name: string;
  location_name: string;
  delivery_boy_name: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export interface TopStore {
  id: number;
  name: string;
  orders_count: number;
}

export interface TopLocation {
  id: number;
  name: string;
  code: string;
  orders_count: number;
}

export interface TopDeliveryBoy {
  id: number;
  name: string;
  email: string;
  delivered_orders_count: number;
}

export interface OverviewData {
  orders: OrderStats;
  revenue: RevenueStats;
  users?: UserStats;
  stores: StoreStats;
  locations: LocationStats;
  products?: ProductStats;
  delivery_boys: DeliveryBoyStats;
  status_breakdown?: StatusBreakdown;
  today: TimePeriodStats;
  this_week: TimePeriodStats;
  this_month: TimePeriodStats;
  recent_orders?: RecentOrder[];
  top_stores?: TopStore[];
  top_locations?: TopLocation[];
  top_delivery_boys?: TopDeliveryBoy[];
}

export interface OverviewResponse {
  message: string;
  data: OverviewData;
}

export async function getOverview(params?: OverviewParams): Promise<OverviewData> {
  const qs = new URLSearchParams();
  if (params?.date_from) qs.set("date_from", params.date_from);
  if (params?.date_to) qs.set("date_to", params.date_to);
  if (params?.location_id !== undefined) qs.set("location_id", String(params.location_id));
  if (params?.store_id !== undefined) qs.set("store_id", String(params.store_id));
  if (params?.delivery_boy_id !== undefined) qs.set("delivery_boy_id", String(params.delivery_boy_id));
  
  const query = qs.toString();
  const path = query ? `/overview?${query}` : "/overview";
  
  const response = await http.get<OverviewResponse | OverviewData>(path);
  
  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response) {
    return response.data;
  }
  
  // Direct response
  return response as OverviewData;
}

