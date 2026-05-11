import * as http from "./http";
import { API_BASE_URL, getAuthToken } from "../config/api";

export interface ProductQuantity {
  product_id: number;
  name: string;
  sku: string | null;
  quantity: number;
  orders_count: number;
}

export interface StoreQuantity {
  store: {
    id: number;
    name: string;
  };
  total_quantity: number;
  products: ProductQuantity[];
}

export interface RouteQuantity {
  route: {
    id: number | null;
    code: string | null;
    name: string;
  };
  total_quantity: number;
  stores: StoreQuantity[];
}

export interface OrderProductQuantitiesResponse {
  message: string;
  filters_applied: string[];
  summary: {
    total_quantity: number;
    distinct_orders: number;
    distinct_products: number;
  };
  by_route: RouteQuantity[];
}

export interface OrderProductQuantitiesParams {
  location_id?: number;
  store_id?: number;
  start_date?: string;
  end_date?: string;
}

export async function getOrderProductQuantities(
  params?: OrderProductQuantitiesParams
): Promise<OrderProductQuantitiesResponse> {
  const qs = new URLSearchParams();
  if (params?.location_id !== undefined) qs.set("location_id", String(params.location_id));
  if (params?.store_id !== undefined) qs.set("store_id", String(params.store_id));
  if (params?.start_date) qs.set("start_date", params.start_date);
  if (params?.end_date) qs.set("end_date", params.end_date);

  const query = qs.toString();
  const path = query ? `/reports/order-product-quantities?${query}` : "/reports/order-product-quantities";

  return await http.get<OrderProductQuantitiesResponse>(path);
}

export async function exportOrderProductQuantities(
  params?: OrderProductQuantitiesParams
): Promise<Blob> {
  const headers = new Headers();
  const token = getAuthToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const qs = new URLSearchParams();
  if (params?.location_id !== undefined) qs.set("location_id", String(params.location_id));
  if (params?.store_id !== undefined) qs.set("store_id", String(params.store_id));
  if (params?.start_date) qs.set("date_from", params.start_date);
  if (params?.end_date) qs.set("date_to", params.end_date);

  const query = qs.toString();
  const path = query ? `/reports/order-product-quantities/export/xlsx?${query}` : "/reports/order-product-quantities/export/xlsx";

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload: unknown = isJson ? await res.json() : await res.text();
    const message =
      isJson && typeof payload === "object" && payload !== null && "message" in payload && typeof payload.message === "string"
        ? (payload as any).message
        : res.statusText;
    throw new Error(message || `HTTP ${res.status}`);
  }

  return await res.blob();
}

export async function exportInvoices(params: {
  store_id?: number;
  location_id?: number;
  start_date?: string;
  end_date?: string;
  delivery_boy_id?: number;
}): Promise<Blob> {
  const headers = new Headers();
  const token = getAuthToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const qs = new URLSearchParams();
  if (params.store_id !== undefined) qs.set("store_id", String(params.store_id));
  if (params.location_id !== undefined) qs.set("location_id", String(params.location_id));
  if (params.start_date) qs.set("date_from", params.start_date);
  if (params.end_date) qs.set("date_to", params.end_date);
  if (params.delivery_boy_id !== undefined) qs.set("delivery_boy_id", String(params.delivery_boy_id));

  const query = qs.toString();
  const path = query ? `/reports/invoices/export/xlsx?${query}` : "/reports/invoices/export/xlsx";

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload: unknown = isJson ? await res.json() : await res.text();
    const message =
      isJson && typeof payload === "object" && payload !== null && "message" in payload && typeof payload.message === "string"
        ? (payload as any).message
        : res.statusText;
    throw new Error(message || `HTTP ${res.status}`);
  }

  return await res.blob();
}
