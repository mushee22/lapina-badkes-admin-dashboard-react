import * as http from "./http";
import { API_BASE_URL, getAuthToken } from "../config/api";
import { CreateProductSchema, UpdateProductSchema } from "../types/product";
import type { Product, CreateProductInput, UpdateProductInput, ProductImagesResponse } from "../types/product";
import type { PaginatedResponse } from "../types/pagination";

export interface ProductListParams {
  page?: number;
  per_page?: number;
  category_id?: number;
  is_available?: boolean;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export async function listProductsPaginated(params?: ProductListParams): Promise<PaginatedResponse<Product>> {
  const qs = new URLSearchParams();
  if (params?.page !== undefined) qs.set("page", String(params.page));
  if (params?.per_page !== undefined) qs.set("per_page", String(params.per_page));
  if (params?.category_id !== undefined) qs.set("category_id", String(params.category_id));
  if (params?.is_available !== undefined) qs.set("is_available", String(params.is_available));
  if (params?.search) qs.set("search", params.search);
  if (params?.date_from) qs.set("date_from", params.date_from);
  if (params?.date_to) qs.set("date_to", params.date_to);
  const query = qs.toString();
  const path = query ? `/products?${query}` : "/products";
  const response = await http.get<Product[] | PaginatedResponse<Product>>(path);
  
  if (Array.isArray(response)) {
    return { data: response };
  }
  
  if (response && typeof response === "object" && Array.isArray(response.data)) {
    return response;
  }
  
  return { data: [] };
}

export async function getProduct(id: number): Promise<Product> {
  const response = await http.get<{ data?: Product; product?: Product } | Product>(`/products/${id}`);
  
  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response && response.data) {
    return response.data as Product;
  }
  
  // Handle product key wrapper
  if (response && typeof response === "object" && "product" in response && response.product) {
    return response.product as Product;
  }
  
  // Direct response
  return response as Product;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const validated = CreateProductSchema.safeParse(input);
  if (!validated.success) {
    throw new Error("Invalid product create payload");
  }
  const response = await http.post<{ data?: Product; product?: Product } | Product>("/products", validated.data);
  
  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response && response.data) {
    return response.data as Product;
  }
  
  // Handle product key wrapper
  if (response && typeof response === "object" && "product" in response && response.product) {
    return response.product as Product;
  }
  
  // Direct response
  return response as Product;
}

export async function updateProduct(id: number, input: UpdateProductInput): Promise<Product> {
  const validated = UpdateProductSchema.safeParse(input);
  if (!validated.success) {
    throw new Error("Invalid product update payload");
  }
  const response = await http.put<{ data?: Product; product?: Product } | Product>(`/products/${id}`, validated.data);
  
  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response && response.data) {
    return response.data as Product;
  }
  
  // Handle product key wrapper
  if (response && typeof response === "object" && "product" in response && response.product) {
    return response.product as Product;
  }
  
  // Direct response
  return response as Product;
}

export async function deleteProduct(id: number): Promise<void> {
  await http.del(`/products/${id}`);
}

export interface UploadProductImagesInput {
  images: File[];
  primary_index?: number;
}

export async function getProductImages(id: number): Promise<ProductImagesResponse> {
  const response = await http.get<ProductImagesResponse>(`/products/${id}/images`);
  return response;
}

export async function uploadProductImages(id: number, input: UploadProductImagesInput): Promise<Product> {
  const formData = new FormData();
  
  // Append each image file
  input.images.forEach((image) => {
    formData.append("images[]", image);
  });
  
  // Append primary_index if provided
  if (input.primary_index !== undefined) {
    formData.append("primary_index", String(input.primary_index));
  }
  
  const response = await http.postFormData<{ data?: Product; product?: Product } | Product>(
    `/products/${id}/images`,
    formData
  );
  
  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response && response.data) {
    return response.data as Product;
  }
  
  // Handle product key wrapper
  if (response && typeof response === "object" && "product" in response && response.product) {
    return response.product as Product;
  }
  
  // Direct response
  return response as Product;
}

export async function deleteProductImage(productId: number, imageId: number): Promise<void> {
  await http.del(`/products/${productId}/images/${imageId}`);
}

export async function setProductImagePrimary(productId: number, imageId: number): Promise<Product> {
  const response = await http.patch<{ data?: Product; product?: Product } | Product>(
    `/products/${productId}/images/${imageId}/primary`,
    {}
  );
  
  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response && response.data) {
    return response.data as Product;
  }
  
  // Handle product key wrapper
  if (response && typeof response === "object" && "product" in response && response.product) {
    return response.product as Product;
  }
  
  // Direct response
  return response as Product;
}

export interface ImageOrderItem {
  id: number;
  sort_order: number;
  is_primary: boolean;
}

export interface UpdateImageOrderInput {
  image_orders: ImageOrderItem[];
}

export async function updateProductImageOrder(productId: number, input: UpdateImageOrderInput): Promise<ProductImagesResponse> {
  const response = await http.put<ProductImagesResponse>(
    `/products/${productId}/images/order`,
    input
  );
  return response;
}

export interface ProductExportParams {
  category_id?: number;
  is_available?: boolean;
  search?: string;
}

export async function exportProducts(params?: ProductExportParams): Promise<Blob> {
  const headers = new Headers();
  const token = getAuthToken();
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const qs = new URLSearchParams();
  if (params?.category_id !== undefined) qs.set("category_id", String(params.category_id));
  if (params?.is_available !== undefined) qs.set("is_available", String(params.is_available));
  if (params?.search) qs.set("search", params.search);
  
  const query = qs.toString();
  const path = query ? `/products-export/xlsx?${query}` : "/products-export/xlsx";

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
        ? payload.message
        : res.statusText;
    throw new Error(message || `HTTP ${res.status}`);
  }

  return await res.blob();
}
