import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "../../types/category";
import { listCategories, listCategoriesPaginated, getCategory, createCategory, updateCategory, deleteCategory } from "../../services/categories";
import type { CategoryListParams } from "../../services/categories";
import type { PaginatedResponse } from "../../types/pagination";
import { useToast } from "../../context/ToastContext";

export const categoriesKey = ["categories"] as const;

export function useCategoriesQuery(params?: CategoryListParams) {
  const { showToast } = useToast();
  const effectiveParams = params ?? {};
  return useQuery<Category[]>({
    queryKey: [...categoriesKey, effectiveParams],
    queryFn: async () => {
      try {
        const rows = await listCategories(effectiveParams);
        return Array.isArray(rows) ? rows : [];
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load categories";
        showToast("error", message, "Error");
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCategoriesPaginatedQuery(params?: CategoryListParams) {
  const { showToast } = useToast();
  const effectiveParams = params ?? {};
  return useQuery<PaginatedResponse<Category>>({
    queryKey: [...categoriesKey, "paginated", effectiveParams],
    queryFn: async () => {
      try {
        return await listCategoriesPaginated(effectiveParams);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load categories";
        showToast("error", message, "Error");
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCategoryQuery(id: number | null) {
  return useQuery<Category>({ 
    queryKey: [...categoriesKey, id], 
    queryFn: () => getCategory(Number(id)), 
    enabled: !!id 
  });
}

export function useCreateCategoryMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoriesKey });
      showToast("success", "Category created successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to create category";
      showToast("error", message, "Error");
    },
  });
}

export function useUpdateCategoryMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryInput }) => updateCategory(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: categoriesKey });
      qc.invalidateQueries({ queryKey: [...categoriesKey, id] });
      showToast("success", "Category updated successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to update category";
      showToast("error", message, "Error");
    },
  });
}

export function useDeleteCategoryMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoriesKey });
      showToast("success", "Category deleted successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to delete category";
      showToast("error", message, "Error");
    },
  });
}

