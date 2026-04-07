import { useState } from "react";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useStoreUsersPaginatedQuery, useStoreUsersDetailsQuery } from "../../../hooks/queries/stores";
import { useLocationsQuery } from "../../../hooks/queries/locations";
import type { StoreUser } from "../../../types/store";
import type { PaginationMeta } from "../../../types/pagination";
import { API_BASE_URL, getAuthToken } from "../../../config/api";
import { useModal } from "../../../hooks/useModal";

export function useOutletUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(15);
  const [locationId, setLocationId] = useState<number | undefined>(undefined);
  
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const { isOpen: isDetailOpen, openModal: openDetailModal, closeModal: closeDetailModal } = useModal();

  const debouncedSearch = useDebouncedValue(search, 400);
  const { data: usersRes, isLoading } = useStoreUsersPaginatedQuery({ 
    page, 
    per_page: perPage,
    location_id: locationId,
    search: debouncedSearch 
  });
  const users: StoreUser[] = usersRes?.data ?? [];
  const meta: PaginationMeta | undefined = usersRes?.meta;

  const { data: userDetails = [], isLoading: isDetailsLoading } = useStoreUsersDetailsQuery(selectedStoreId);
  
  // Get locations for filter dropdown
  const { data: locations = [] } = useLocationsQuery();

  const onSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when search changes
  };

  const clearFilters = () => {
    setLocationId(undefined);
    setSearch("");
    setPage(1);
  };

  const handleExport = async () => {
    console.log("Exporting users for location:", locationId, "search:", debouncedSearch);
    const token = getAuthToken();
    const qs = new URLSearchParams();
    if (locationId !== undefined) qs.set("location_id", String(locationId));
    if (debouncedSearch) qs.set("search", debouncedSearch);
    
    const url = `${API_BASE_URL}/store-users/export/xlsx?${qs.toString()}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `outlet-users-${new Date().toISOString().split("T")[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const viewPassword = (storeId: number) => {
    console.log("Viewing password for storeId:", storeId);
    setSelectedStoreId(storeId);
    openDetailModal();
  };

  return {
    users,
    isLoading,
    search,
    page,
    perPage,
    setPage,
    setPerPage,
    meta,
    locationId,
    setLocationId,
    locations,
    onSearchChange,
    clearFilters,
    handleExport,
    isDetailOpen,
    closeDetailModal,
    viewPassword,
    userDetails,
    isDetailsLoading,
  };
}
