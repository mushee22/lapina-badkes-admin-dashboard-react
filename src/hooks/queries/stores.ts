import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Store, CreateStoreInput, UpdateStoreInput, UpdateStoreStatusInput, SetStoreDiscountInput } from "../../types/store";
import {
  listStoresPaginated,
  getStore,
  createStore,
  updateStore,
  deleteStore,
  updateStoreStatus,
  setStoreDiscount,
  deactivateStoreDiscount,
  getStoreProducts,
  setStoreProductDiscountsBulk,
  type StoreProductDiscountItem,
} from "../../services/stores";
import type { StoreListParams } from "../../services/stores";
import type { PaginatedResponse } from "../../types/pagination";
import { useToast } from "../../context/ToastContext";
import type { Product } from "../../types/product";

export const storesKey = ["stores"] as const;

export function useStoresPaginatedQuery(params?: StoreListParams) {
  const { showToast } = useToast();
  const effectiveParams = params ?? {};
  return useQuery<PaginatedResponse<Store>>({
    queryKey: [...storesKey, "paginated", effectiveParams],
    queryFn: async () => {
      try {
        return await listStoresPaginated(effectiveParams);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load stores";
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

export function useStoreQuery(id: number | null) {
  return useQuery<Store>({
    queryKey: [...storesKey, id],
    queryFn: () => getStore(Number(id)),
    enabled: !!id
  });
}

export function useCreateStoreMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (input: CreateStoreInput) => createStore(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: storesKey });
      showToast("success", "Store created successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to create store";
      showToast("error", message, "Error");
    },
  });
}

export function useUpdateStoreMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStoreInput }) => updateStore(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: storesKey });
      qc.invalidateQueries({ queryKey: [...storesKey, id] });
      showToast("success", "Store updated successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to update store";
      showToast("error", message, "Error");
    },
  });
}

export function useDeleteStoreMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (id: number) => deleteStore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: storesKey });
      showToast("success", "Store deleted successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to delete store";
      showToast("error", message, "Error");
    },
  });
}

export function useUpdateStoreStatusMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStoreStatusInput }) => updateStoreStatus(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: storesKey });
      qc.invalidateQueries({ queryKey: [...storesKey, id] });
      showToast("success", "Store status updated successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to update store status";
      showToast("error", message, "Error");
    },
  });
}

export function useSetStoreDiscountMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SetStoreDiscountInput }) => setStoreDiscount(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: storesKey });
      qc.invalidateQueries({ queryKey: [...storesKey, id] });
      showToast("success", "Store discount set successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to set store discount";
      showToast("error", message, "Error");
    },
  });
}

export function useDeactivateStoreDiscountMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (id: number) => deactivateStoreDiscount(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: storesKey });
      qc.invalidateQueries({ queryKey: [...storesKey, id] });
      showToast("success", "Store discount deactivated successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to deactivate store discount";
      showToast("error", message, "Error");
    },
  });
}

export function useStoreProductsQuery(storeId: number | null) {
  const { showToast } = useToast();
  return useQuery<Product[]>({
    queryKey: [...storesKey, storeId, "products"],
    queryFn: async () => {
      try {
        return await getStoreProducts(storeId!);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load store products";
        showToast("error", message, "Error");
        throw error;
      }
    },
    enabled: storeId !== null,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useSetStoreProductDiscountsMutation() {
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ storeId, items }: { storeId: number; items: StoreProductDiscountItem[] }) =>
      setStoreProductDiscountsBulk(storeId, items),
    onSuccess: () => {
      showToast("success", "Product discounts saved successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to save product discounts";
      showToast("error", message, "Error");
    },
  });
}
