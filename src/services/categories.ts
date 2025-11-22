import * as http from "./http";
import { z } from "zod";
import { CategorySchema, CreateCategorySchema, UpdateCategorySchema } from "../types/category";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "../types/category";
import type { PaginatedResponse } from "../types/pagination";

export interface CategoryListParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export async function listCategories(params?: CategoryListParams): Promise<Category[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  const query = qs.toString();
  const path = query ? `/categories?${query}` : "/categories";
  const payload = await http.get<unknown>(path);

  // Rely on HTTP status codes for success; be lenient on shape.
  // Prefer arrays; otherwise try common wrappers.
  if (Array.isArray(payload)) {
    return payload as Category[];
  }

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) {
      return obj.data as Category[];
    }
    if (Array.isArray(obj.categories)) {
      return obj.categories as Category[];
    }
    // Fallback: find the first array of objects and treat as rows
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
        return val as Category[];
      }
      if (Array.isArray(val) && val.length === 0) {
        return [];
      }
    }
  }

  // If shape is unexpected but the request succeeded, return empty list
  // instead of throwing, per user preference to avoid hard failures.
  return [];
}

export async function getCategory(id: number): Promise<Category> {
  const data = await http.get<unknown>(`/categories/${id}`);
  const parsed = CategorySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid category response");
  }
  return parsed.data;
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const validated = CreateCategorySchema.safeParse(input);
  if (!validated.success) {
    throw new Error("Invalid category create payload");
  }
  const data = await http.post<unknown>("/categories", validated.data);
  // Accept either direct Category or wrapped { category, message }
  const direct = CategorySchema.safeParse(data);
  if (direct.success) {
    return direct.data;
  }
  const wrapped = z
    .object({ message: z.string().optional(), category: CategorySchema })
    .safeParse(data);
  if (wrapped.success) {
    return wrapped.data.category;
  }
  throw new Error("Invalid category response after create");
}

export async function updateCategory(id: number, input: UpdateCategoryInput): Promise<Category> {
  const validated = UpdateCategorySchema.safeParse(input);
  if (!validated.success) {
    throw new Error("Invalid category update payload");
  }
  const data = await http.put<unknown>(`/categories/${id}`, validated.data);
  // Accept either direct Category or wrapped { category, message }
  const direct = CategorySchema.safeParse(data);
  if (direct.success) {
    return direct.data;
  }
  const wrapped = z
    .object({ message: z.string().optional(), category: CategorySchema })
    .safeParse(data);
  if (wrapped.success) {
    return wrapped.data.category;
  }
  throw new Error("Invalid category response after update");
}

export async function deleteCategory(id: number): Promise<void> {
  await http.del(`/categories/${id}`);
}

export async function listCategoriesPaginated(params?: CategoryListParams): Promise<PaginatedResponse<Category>> {
  const qs = new URLSearchParams();
  if (params?.page !== undefined) qs.set("page", String(params.page));
  if (params?.per_page !== undefined) qs.set("per_page", String(params.per_page));
  if (params?.search) qs.set("search", params.search);
  const query = qs.toString();
  const path = query ? `/categories?${query}` : "/categories";
  const response = await http.get<Category[] | PaginatedResponse<Category>>(path);
  
  if (Array.isArray(response)) {
    return { data: response };
  }
  
  if (response && typeof response === "object" && Array.isArray(response.data)) {
    return response;
  }
  
  return { data: [] };
}

