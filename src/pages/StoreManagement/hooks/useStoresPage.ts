import { useState } from "react";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useModal } from "../../../hooks/useModal";
import {
  useStoresPaginatedQuery,
  useDeleteStoreMutation,
} from "../../../hooks/queries/stores";
import { useLocationsQuery } from "../../../hooks/queries/locations";
import type { Store } from "../../../types/store";
import type { PaginationMeta } from "../../../types/pagination";

export function useStoresPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(15);
  const [locationId, setLocationId] = useState<number | undefined>(undefined);
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  
  const debouncedSearch = useDebouncedValue(search, 400);
  const { data: storesRes, isLoading } = useStoresPaginatedQuery({ 
    page, 
    per_page: perPage,
    location_id: locationId,
    is_active: isActive,
    status: status,
    search: debouncedSearch 
  });
  const stores: Store[] = storesRes?.data ?? [];
  const meta: PaginationMeta | undefined = storesRes?.meta;
  
  // Get locations for filter dropdown
  const { data: locations = [] } = useLocationsQuery();

  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();

  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const deleteMutation = useDeleteStoreMutation();

  const openDelete = (store: Store) => {
    setSelectedStore(store);
    openDeleteModal();
  };

  const confirmDelete = () => {
    if (selectedStore) {
      deleteMutation.mutate(selectedStore.id, { onSuccess: () => closeDeleteModal() });
    }
  };

  const onSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when search changes
  };

  const clearFilters = () => {
    setLocationId(undefined);
    setIsActive(undefined);
    setStatus(undefined);
    setSearch("");
    setPage(1);
  };

  return {
    stores,
    isLoading,
    search,
    page,
    perPage,
    setPage,
    setPerPage,
    meta,
    locationId,
    setLocationId,
    isActive,
    setIsActive,
    status,
    setStatus,
    locations,
    onSearchChange,
    clearFilters,

    isDeleteOpen,
    closeDeleteModal,

    selectedStore,

    openDelete,
    confirmDelete,

    isDeletePending: deleteMutation.isPending,
  };
}

