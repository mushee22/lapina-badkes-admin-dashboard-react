import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Product, CreateProductInput, UpdateProductInput } from "../../types/product";
import { 
  listProductsPaginated, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getProductImages,
  uploadProductImages,
  deleteProductImage,
  setProductImagePrimary,
  updateProductImageOrder,
  type UploadProductImagesInput,
  type UpdateImageOrderInput,
} from "../../services/products";
import type { ProductListParams } from "../../services/products";
import type { PaginatedResponse } from "../../types/pagination";
import { useToast } from "../../context/ToastContext";

export const productsKey = ["products"] as const;

export function useProductsPaginatedQuery(params?: ProductListParams) {
  const { showToast } = useToast();
  const effectiveParams = params ?? {};
  return useQuery<PaginatedResponse<Product>>({
    queryKey: [...productsKey, "paginated", effectiveParams],
    queryFn: async () => {
      try {
        return await listProductsPaginated(effectiveParams);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load products";
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

export function useProductQuery(id: number | null) {
  return useQuery<Product>({ 
    queryKey: [...productsKey, id], 
    queryFn: () => getProduct(Number(id)), 
    enabled: !!id 
  });
}

export function useCreateProductMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productsKey });
      showToast("success", "Product created successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to create product";
      showToast("error", message, "Error");
    },
  });
}

export function useUpdateProductMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductInput }) => updateProduct(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: productsKey });
      qc.invalidateQueries({ queryKey: [...productsKey, id] });
      showToast("success", "Product updated successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to update product";
      showToast("error", message, "Error");
    },
  });
}

export function useDeleteProductMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productsKey });
      showToast("success", "Product deleted successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to delete product";
      showToast("error", message, "Error");
    },
  });
}

export function useProductImagesQuery(id: number | null) {
  return useQuery({
    queryKey: [...productsKey, id, "images"],
    queryFn: () => getProductImages(id!),
    enabled: id !== null,
  });
}

export function useUploadProductImagesMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UploadProductImagesInput }) => uploadProductImages(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: productsKey });
      qc.invalidateQueries({ queryKey: [...productsKey, id] });
      qc.invalidateQueries({ queryKey: [...productsKey, id, "images"] });
      showToast("success", "Product images uploaded successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to upload product images";
      showToast("error", message, "Error");
    },
  });
}

export function useDeleteProductImageMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) => 
      deleteProductImage(productId, imageId),
    onSuccess: (_, { productId }) => {
      qc.invalidateQueries({ queryKey: productsKey });
      qc.invalidateQueries({ queryKey: [...productsKey, productId] });
      qc.invalidateQueries({ queryKey: [...productsKey, productId, "images"] });
      showToast("success", "Image deleted successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to delete image";
      showToast("error", message, "Error");
    },
  });
}

export function useSetProductImagePrimaryMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: number; imageId: number }) => 
      setProductImagePrimary(productId, imageId),
    onSuccess: (_, { productId }) => {
      qc.invalidateQueries({ queryKey: productsKey });
      qc.invalidateQueries({ queryKey: [...productsKey, productId] });
      qc.invalidateQueries({ queryKey: [...productsKey, productId, "images"] });
      showToast("success", "Primary image updated successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to set primary image";
      showToast("error", message, "Error");
    },
  });
}

export function useUpdateProductImageOrderMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: number; data: UpdateImageOrderInput }) => 
      updateProductImageOrder(productId, data),
    onSuccess: (_, { productId }) => {
      qc.invalidateQueries({ queryKey: productsKey });
      qc.invalidateQueries({ queryKey: [...productsKey, productId] });
      qc.invalidateQueries({ queryKey: [...productsKey, productId, "images"] });
      showToast("success", "Image order updated successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to update image order";
      showToast("error", message, "Error");
    },
  });
}

