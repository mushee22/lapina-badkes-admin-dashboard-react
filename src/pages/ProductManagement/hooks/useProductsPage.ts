import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useModal } from "../../../hooks/useModal";
import {
  useProductsPaginatedQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
} from "../../../hooks/queries/products";
import { useCategoriesQuery } from "../../../hooks/queries/categories";
import * as productsApi from "../../../services/products";
import { useToast } from "../../../context/ToastContext";
import type { Product } from "../../../types/product";
import type { PaginationMeta } from "../../../types/pagination";

export function useProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Initialize state from URL params
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState<number>(Number(searchParams.get("page")) || 1);
  const [perPage, setPerPage] = useState<number>(Number(searchParams.get("per_page")) || 15);
  const [categoryId, setCategoryId] = useState<number | undefined>(
    searchParams.get("category_id") ? Number(searchParams.get("category_id")) : undefined
  );
  const [isAvailable, setIsAvailable] = useState<boolean | undefined>(
    searchParams.get("is_available") ? searchParams.get("is_available") === "true" : undefined
  );
  
  const debouncedSearch = useDebouncedValue(search, 400);
  const { data: productsRes, isLoading } = useProductsPaginatedQuery({ 
    page, 
    per_page: perPage,
    category_id: categoryId,
    is_available: isAvailable,
    search: debouncedSearch,
  });
  const products: Product[] = productsRes?.data ?? [];
  const meta: PaginationMeta | undefined = productsRes?.meta;
  
  // Get categories for filter dropdown
  const { data: categories = [] } = useCategoriesQuery();

  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const { isOpen: isToggleOpen, openModal: openToggleModal, closeModal: closeToggleModal } = useModal();
  const { isOpen: isStockOpen, openModal: openStockModal, closeModal: closeStockModal } = useModal();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockValue, setStockValue] = useState<number>(0);

  const deleteMutation = useDeleteProductMutation();
  const updateMutation = useUpdateProductMutation();

  const openDelete = (product: Product) => {
    setSelectedProduct(product);
    openDeleteModal();
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      deleteMutation.mutate(selectedProduct.id, { onSuccess: () => closeDeleteModal() });
    }
  };

  const openToggleAvailability = (product: Product) => {
    setSelectedProduct(product);
    openToggleModal();
  };

  const confirmToggleAvailability = () => {
    if (selectedProduct) {
      updateMutation.mutate({
        id: selectedProduct.id,
        data: { is_available: !selectedProduct.is_available },
      }, {
        onSuccess: () => closeToggleModal(),
      });
    }
  };

  const openUpdateStock = (product: Product) => {
    setSelectedProduct(product);
    setStockValue(product.stock);
    openStockModal();
  };

  const confirmUpdateStock = () => {
    if (selectedProduct) {
      updateMutation.mutate({
        id: selectedProduct.id,
        data: { stock: stockValue },
      }, {
        onSuccess: () => closeStockModal(),
      });
    }
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (perPage !== 15) params.set("per_page", String(perPage));
    if (categoryId) params.set("category_id", String(categoryId));
    if (isAvailable !== undefined) params.set("is_available", String(isAvailable));
    if (debouncedSearch) params.set("search", debouncedSearch);
    
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, categoryId, isAvailable, debouncedSearch]);

  const onSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when search changes
  };

  const onCategoryClick = (id: number) => {
    setCategoryId(id);
    setPage(1);
  };

  const clearFilters = () => {
    setCategoryId(undefined);
    setIsAvailable(undefined);
    setSearch("");
    setPage(1);
    navigate("/products");
  };

  const hasActiveFilters = categoryId !== undefined || isAvailable !== undefined || search.length > 0;
  const { showToast } = useToast();

  const handleExport = async () => {
    try {
      const params: productsApi.ProductExportParams = {};
      if (categoryId !== undefined) params.category_id = categoryId;
      if (isAvailable !== undefined) params.is_available = isAvailable;
      if (search) params.search = search;

      const blob = await productsApi.exportProducts(params);
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `products-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast("success", "Products exported successfully", "Success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to export products";
      showToast("error", message, "Error");
    }
  };

  return {
    products,
    isLoading,
    search,
    page,
    perPage,
    setPage,
    setPerPage,
    meta,
    categoryId,
    setCategoryId,
    isAvailable,
    setIsAvailable,
    categories,
    onSearchChange,
    onCategoryClick,
    clearFilters,
    hasActiveFilters,

    isDeleteOpen,
    closeDeleteModal,

    selectedProduct,

    openDelete,
    confirmDelete,

    isDeletePending: deleteMutation.isPending,
    
    isToggleOpen,
    closeToggleModal,
    openToggleAvailability,
    confirmToggleAvailability,
    isTogglePending: updateMutation.isPending,
    
    isStockOpen,
    closeStockModal,
    openUpdateStock,
    confirmUpdateStock,
    stockValue,
    setStockValue,
    isStockPending: updateMutation.isPending,
    
    handleExport,
  };
}

