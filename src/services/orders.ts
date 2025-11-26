import * as http from "./http";
import { API_BASE_URL, getAuthToken } from "../config/api";
import type { Order, UpdateOrderInput } from "../types/order";
import type { PaginatedResponse } from "../types/pagination";

export interface OrderListParams {
  page?: number;
  per_page?: number;
  status?: string;
  user_id?: number;
  store_id?: number;
  location_id?: number;
  delivery_boy_id?: number;
  date_from?: string;
  date_to?: string;
}

export async function listOrdersPaginated(params?: OrderListParams): Promise<PaginatedResponse<Order>> {
  const qs = new URLSearchParams();
  if (params?.page !== undefined) qs.set("page", String(params.page));
  if (params?.per_page !== undefined) qs.set("per_page", String(params.per_page));
  if (params?.status) qs.set("status", params.status);
  if (params?.user_id !== undefined) qs.set("user_id", String(params.user_id));
  if (params?.store_id !== undefined) qs.set("store_id", String(params.store_id));
  if (params?.location_id !== undefined) qs.set("location_id", String(params.location_id));
  if (params?.delivery_boy_id !== undefined) qs.set("delivery_boy_id", String(params.delivery_boy_id));
  if (params?.date_from) qs.set("date_from", params.date_from);
  if (params?.date_to) qs.set("date_to", params.date_to);
  const query = qs.toString();
  const path = query ? `/orders?${query}` : "/orders";
  const response = await http.get<Order[] | PaginatedResponse<Order>>(path);
  
  if (Array.isArray(response)) {
    return { data: response };
  }
  
  if (response && typeof response === "object" && Array.isArray(response.data)) {
    return response;
  }
  
  return { data: [] };
}

export async function getOrder(id: number): Promise<Order> {
  const response = await http.get<{ data?: Order; order?: Order } | Order>(`/orders/${id}`);

  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response && response.data) {
    return response.data as Order;
  }

  // Handle order key wrapper
  if (response && typeof response === "object" && "order" in response && response.order) {
    return response.order as Order;
  }

  // Direct response
  return response as Order;
}

export async function updateOrder(id: number, input: UpdateOrderInput): Promise<Order> {
  const response = await http.put<{ data?: Order; order?: Order } | Order>(`/orders/${id}`, input);

  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response && response.data) {
    return response.data as Order;
  }

  // Handle order key wrapper
  if (response && typeof response === "object" && "order" in response && response.order) {
    return response.order as Order;
  }

  // Direct response
  return response as Order;
}

export async function generateOrderInvoice(id: number): Promise<void> {
  await http.post(`/orders/${id}/generate-invoice`, {});
}

export async function downloadOrderInvoice(id: number): Promise<Blob> {
  const headers = new Headers();
  const token = getAuthToken();
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}/invoices/${id}/download-pdf`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload: unknown = isJson ? await res.json() : await res.text();
    const message =
      isJson && typeof payload === "object" && payload !== null && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : res.statusText;
    throw new Error(message || `HTTP ${res.status}`);
  }

  return await res.blob();
}

export async function deleteOrder(id: number): Promise<void> {
  await http.del(`/orders/${id}`);
}

export interface OrderCustomer {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export interface OrderStoreLocation {
  id: number;
  name: string;
}

export interface OrderStore {
  id: number;
  name: string;
  location_id: number;
  location: OrderStoreLocation;
}

export interface OrderDeliveryBoy {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export async function getOrderCustomers(search?: string): Promise<OrderCustomer[]> {
  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  qs.set("role", "customer");
  const query = qs.toString();
  const path = query ? `/orders/customers?${query}` : "/orders/customers?role=customer";
  const response = await http.get<{ customers: { data: OrderCustomer[] } } | OrderCustomer[] | { data: OrderCustomer[] }>(path);
  
  // Handle customers key wrapper with nested data
  if (response && typeof response === "object" && "customers" in response && response.customers && typeof response.customers === "object" && "data" in response.customers && Array.isArray(response.customers.data)) {
    return response.customers.data;
  }
  
  // Handle data key wrapper
  if (response && typeof response === "object" && "data" in response && Array.isArray(response.data)) {
    return response.data;
  }
  
  // Handle direct array
  if (Array.isArray(response)) {
    return response;
  }
  
  return [];
}

export interface OrderStoreOwner {
  id: number;
  name: string;
  email: string;
  phone?: string;
  store?: {
    id: number;
    name: string;
    phone?: string;
  };
}

export async function getOrderStoreOwners(search?: string): Promise<OrderStoreOwner[]> {
  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  qs.set("role", "store_owner");
  const query = qs.toString();
  const path = query ? `/orders/customers?${query}` : "/orders/customers?role=store_owner";
  const response = await http.get<{ customers: { data: OrderStoreOwner[] } } | OrderStoreOwner[] | { data: OrderStoreOwner[] }>(path);
  
  // Handle customers key wrapper with nested data
  if (response && typeof response === "object" && "customers" in response && response.customers && typeof response.customers === "object" && "data" in response.customers && Array.isArray(response.customers.data)) {
    return response.customers.data;
  }
  
  // Handle data key wrapper
  if (response && typeof response === "object" && "data" in response && Array.isArray(response.data)) {
    return response.data;
  }
  
  // Handle direct array
  if (Array.isArray(response)) {
    return response;
  }
  
  return [];
}

export async function getOrderStores(): Promise<OrderStore[]> {
  const response = await http.get<{ stores: OrderStore[] } | OrderStore[] | { data: OrderStore[] }>("/orders/stores");
  
  // Handle stores key wrapper
  if (response && typeof response === "object" && "stores" in response && Array.isArray(response.stores)) {
    return response.stores;
  }
  
  // Handle data key wrapper
  if (response && typeof response === "object" && "data" in response && Array.isArray(response.data)) {
    return response.data;
  }
  
  // Handle direct array
  if (Array.isArray(response)) {
    return response;
  }
  
  return [];
}

export async function getOrderDeliveryBoys(): Promise<OrderDeliveryBoy[]> {
  const response = await http.get<{ delivery_boys: OrderDeliveryBoy[] } | OrderDeliveryBoy[] | { data: OrderDeliveryBoy[] }>("/orders/delivery-boys");
  
  // Handle delivery_boys key wrapper
  if (response && typeof response === "object" && "delivery_boys" in response && Array.isArray(response.delivery_boys)) {
    return response.delivery_boys;
  }
  
  // Handle data key wrapper
  if (response && typeof response === "object" && "data" in response && Array.isArray(response.data)) {
    return response.data;
  }
  
  // Handle direct array
  if (Array.isArray(response)) {
    return response;
  }
  
  return [];
}

export async function createManualOrder(input: import("../types/order").CreateManualOrderInput): Promise<Order> {
  const response = await http.post<{ data?: Order; order?: Order } | Order>("/orders/manual-create", input);

  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response && response.data) {
    return response.data as Order;
  }

  // Handle order key wrapper
  if (response && typeof response === "object" && "order" in response && response.order) {
    return response.order as Order;
  }

  // Direct response
  return response as Order;
}

export async function updateOrderStatus(id: number, status: string, notes: string): Promise<Order> {
  const response = await http.patch<{ data?: Order; order?: Order } | Order>(`/orders/${id}/status`, {
    status,
    notes,
  });

  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response && response.data) {
    return response.data as Order;
  }

  // Handle order key wrapper
  if (response && typeof response === "object" && "order" in response && response.order) {
    return response.order as Order;
  }

  // Direct response
  return response as Order;
}

export async function assignDeliveryBoy(
  id: number,
  delivery_boy_id: number,
  auto_update_status: boolean,
  notes: string
): Promise<Order> {
  const response = await http.post<{ data?: Order; order?: Order } | Order>(`/orders/${id}/assign-delivery-boy`, {
    delivery_boy_id,
    auto_update_status,
    notes,
  });

  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response && response.data) {
    return response.data as Order;
  }

  // Handle order key wrapper
  if (response && typeof response === "object" && "order" in response && response.order) {
    return response.order as Order;
  }

  // Direct response
  return response as Order;
}

export interface UpdateOrderItemInput {
  id?: number; // Optional for existing items
  product_id: number;
  quantity: number;
}

export interface UpdateOrderItemsInput {
  items: UpdateOrderItemInput[];
}

export async function updateOrderItems(orderId: number, input: UpdateOrderItemsInput): Promise<Order> {
  const response = await http.put<{ data?: Order; order?: Order } | Order>(`/orders/${orderId}/items`, input);

  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response && response.data) {
    return response.data as Order;
  }

  // Handle order key wrapper
  if (response && typeof response === "object" && "order" in response && response.order) {
    return response.order as Order;
  }

  // Direct response
  return response as Order;
}

