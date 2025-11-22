import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useOrdersPaginatedQuery } from "../../../hooks/queries/orders";
import { useStoresPaginatedQuery } from "../../../hooks/queries/stores";
import { useAdminUsersQuery } from "../../../hooks/queries/adminUsers";
import { useLocationsQuery } from "../../../hooks/queries/locations";
import { useDeliveryBoysListQuery } from "../../../hooks/queries/deliveryBoys";
import type { PaginationMeta } from "../../../types/pagination";
import type { Order } from "../../../types/order";
import type { Store } from "../../../types/store";

export function useOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL params
  const [page, setPage] = useState<number>(Number(searchParams.get("page")) || 1);
  const [perPage, setPerPage] = useState<number>(Number(searchParams.get("per_page")) || 15);
  const [status, setStatus] = useState<string | undefined>(searchParams.get("status") || undefined);
  const [userId, setUserId] = useState<number | undefined>(
    searchParams.get("user_id") ? Number(searchParams.get("user_id")) : undefined
  );
  const [storeId, setStoreId] = useState<number | undefined>(
    searchParams.get("store_id") ? Number(searchParams.get("store_id")) : undefined
  );
  const [locationId, setLocationId] = useState<number | undefined>(
    searchParams.get("location_id") ? Number(searchParams.get("location_id")) : undefined
  );
  const [deliveryBoyId, setDeliveryBoyId] = useState<number | undefined>(
    searchParams.get("delivery_boy_id") ? Number(searchParams.get("delivery_boy_id")) : undefined
  );
  const [dateFrom, setDateFrom] = useState<string | undefined>(searchParams.get("date_from") || undefined);
  const [dateTo, setDateTo] = useState<string | undefined>(searchParams.get("date_to") || undefined);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (perPage !== 15) params.set("per_page", String(perPage));
    if (status) params.set("status", status);
    if (userId) params.set("user_id", String(userId));
    if (storeId) params.set("store_id", String(storeId));
    if (locationId) params.set("location_id", String(locationId));
    if (deliveryBoyId) params.set("delivery_boy_id", String(deliveryBoyId));
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, status, userId, storeId, locationId, deliveryBoyId, dateFrom, dateTo]);

  // Reset to page 1 when filters change (except page itself)
  useEffect(() => {
    setPage(1);
  }, [status, userId, storeId, locationId, deliveryBoyId, dateFrom, dateTo]);

  const { data: ordersRes, isLoading } = useOrdersPaginatedQuery({ 
    page, 
    per_page: perPage,
    status,
    user_id: userId,
    store_id: storeId,
    location_id: locationId,
    delivery_boy_id: deliveryBoyId,
    date_from: dateFrom,
    date_to: dateTo,
  });
  
  const orders: Order[] = ordersRes?.data ?? [];
  const meta: PaginationMeta | undefined = ordersRes?.meta;

  // Fetch stores, users, locations, and delivery boys for filters
  const { data: storesRes } = useStoresPaginatedQuery({ per_page: 100 });
  const stores: Store[] = storesRes?.data ?? [];
  const { data: users = [] } = useAdminUsersQuery();
  const { data: locations = [] } = useLocationsQuery();
  const { data: deliveryBoys = [] } = useDeliveryBoysListQuery({});

  const clearFilters = () => {
    setStatus(undefined);
    setUserId(undefined);
    setStoreId(undefined);
    setLocationId(undefined);
    setDeliveryBoyId(undefined);
    setDateFrom(undefined);
    setDateTo(undefined);
    setPage(1);
    // Clear URL params
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = status !== undefined || userId !== undefined || storeId !== undefined || locationId !== undefined || deliveryBoyId !== undefined || dateFrom !== undefined || dateTo !== undefined;

  return {
    orders,
    isLoading,
    page,
    perPage,
    setPage,
    setPerPage,
    meta,
    status,
    setStatus,
    userId,
    setUserId,
    storeId,
    setStoreId,
    locationId,
    setLocationId,
    deliveryBoyId,
    setDeliveryBoyId,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    stores,
    users,
    locations,
    deliveryBoys,
    clearFilters,
    hasActiveFilters,
  };
}

