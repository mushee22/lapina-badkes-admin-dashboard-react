import * as http from "./http";
import { CreateStoreSchema, UpdateStoreSchema, UpdateStoreStatusSchema, SetStoreDiscountSchema } from "../types/store";
import type { Store, CreateStoreInput, UpdateStoreInput, UpdateStoreStatusInput, SetStoreDiscountInput } from "../types/store";
import type { PaginatedResponse } from "../types/pagination";

export interface StoreListParams {
  page?: number;
  per_page?: number;
  location_id?: number;
  is_active?: boolean;
  status?: string;
  search?: string;
}

export async function listStoresPaginated(params?: StoreListParams): Promise<PaginatedResponse<Store>> {
  const qs = new URLSearchParams();
  if (params?.page !== undefined) qs.set("page", String(params.page));
  if (params?.per_page !== undefined) qs.set("per_page", String(params.per_page));
  if (params?.location_id !== undefined) qs.set("location_id", String(params.location_id));
  if (params?.is_active !== undefined) qs.set("is_active", String(params.is_active));
  if (params?.status) qs.set("status", params.status);
  if (params?.search) qs.set("search", params.search);
  const query = qs.toString();
  const path = query ? `/stores?${query}` : "/stores";
  const response = await http.get<Store[] | PaginatedResponse<Store>>(path);
  
  if (Array.isArray(response)) {
    return { data: response };
  }
  
  if (response && typeof response === "object" && Array.isArray(response.data)) {
    return response;
  }
  
  return { data: [] };
}

export async function getStore(id: number): Promise<Store> {
  const response = await http.get<{ data?: Store; store?: Store } | Store>(`/stores/${id}`);
  
  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response && response.data) {
    return response.data as Store;
  }
  
  // Handle store key wrapper
  if (response && typeof response === "object" && "store" in response && response.store) {
    return response.store as Store;
  }
  
  // Direct response
  return response as Store;
}

export async function createStore(input: CreateStoreInput): Promise<Store> {
  const validated = CreateStoreSchema.safeParse(input);
  if (!validated.success) {
    throw new Error("Invalid store create payload");
  }
  const response = await http.post<{ data?: Store; store?: Store } | Store>("/stores", validated.data);
  
  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response && response.data) {
    return response.data as Store;
  }
  
  // Handle store key wrapper
  if (response && typeof response === "object" && "store" in response && response.store) {
    return response.store as Store;
  }
  
  // Direct response
  return response as Store;
}

export async function updateStore(id: number, input: UpdateStoreInput): Promise<Store> {
  const validated = UpdateStoreSchema.safeParse(input);
  if (!validated.success) {
    throw new Error("Invalid store update payload");
  }
  const response = await http.put<{ data?: Store; store?: Store } | Store>(`/stores/${id}`, validated.data);
  
  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response && response.data) {
    return response.data as Store;
  }
  
  // Handle store key wrapper
  if (response && typeof response === "object" && "store" in response && response.store) {
    return response.store as Store;
  }
  
  // Direct response
  return response as Store;
}

export async function deleteStore(id: number): Promise<void> {
  await http.del(`/stores/${id}`);
}

export async function updateStoreStatus(id: number, input: UpdateStoreStatusInput): Promise<Store> {
  const validated = UpdateStoreStatusSchema.safeParse(input);
  if (!validated.success) {
    throw new Error("Invalid store status update payload");
  }
  const response = await http.patch<{ data?: Store; store?: Store } | Store>(`/stores/${id}/status`, validated.data);
  
  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response && response.data) {
    return response.data as Store;
  }
  
  // Handle store key wrapper
  if (response && typeof response === "object" && "store" in response && response.store) {
    return response.store as Store;
  }
  
  // Direct response
  return response as Store;
}

export async function setStoreDiscount(id: number, input: SetStoreDiscountInput): Promise<Store> {
  const validated = SetStoreDiscountSchema.safeParse(input);
  if (!validated.success) {
    throw new Error("Invalid store discount payload");
  }
  const response = await http.post<{ data?: Store; store?: Store } | Store>(`/stores/${id}/discount`, validated.data);
  
  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response && response.data) {
    return response.data as Store;
  }
  
  // Handle store key wrapper
  if (response && typeof response === "object" && "store" in response && response.store) {
    return response.store as Store;
  }
  
  // Direct response
  return response as Store;
}

export async function deactivateStoreDiscount(id: number): Promise<void> {
  await http.del(`/stores/${id}/discount`);
}

