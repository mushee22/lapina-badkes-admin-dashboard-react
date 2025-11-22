import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useOrdersPaginatedQuery } from "../../hooks/queries/orders";
import { useDeliveryBoysListQuery } from "../../hooks/queries/deliveryBoys";
import { useLocationsQuery } from "../../hooks/queries/locations";
import { useStoresPaginatedQuery } from "../../hooks/queries/stores";
import type { PaginationMeta } from "../../types/pagination";
import type { Order } from "../../types/order";
import { OrdersCardView } from "./components/OrdersCardView";

export default function PendingOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL params, default to "pending" if no status is set
  const [page, setPage] = useState<number>(Number(searchParams.get("page")) || 1);
  const [perPage, setPerPage] = useState<number>(Number(searchParams.get("per_page")) || 15);
  const [status, setStatus] = useState<string | undefined>(searchParams.get("status") || "pending");
  const [locationId, setLocationId] = useState<number | undefined>(
    searchParams.get("location_id") ? Number(searchParams.get("location_id")) : undefined
  );
  const [storeId, setStoreId] = useState<number | undefined>(
    searchParams.get("store_id") ? Number(searchParams.get("store_id")) : undefined
  );
  const [deliveryBoyId, setDeliveryBoyId] = useState<number | undefined>(
    searchParams.get("delivery_boy_id") ? Number(searchParams.get("delivery_boy_id")) : undefined
  );

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (perPage !== 15) params.set("per_page", String(perPage));
    if (status) params.set("status", status);
    if (locationId) params.set("location_id", String(locationId));
    if (storeId) params.set("store_id", String(storeId));
    if (deliveryBoyId) params.set("delivery_boy_id", String(deliveryBoyId));
    
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, status, locationId, storeId, deliveryBoyId]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [status, locationId, storeId, deliveryBoyId]);

  const { data: ordersRes, isLoading } = useOrdersPaginatedQuery({ 
    page, 
    per_page: perPage,
    status,
    location_id: locationId,
    store_id: storeId,
    delivery_boy_id: deliveryBoyId,
  });
  
  const orders: Order[] = ordersRes?.data ?? [];
  const meta: PaginationMeta | undefined = ordersRes?.meta;

  const { data: deliveryBoys = [] } = useDeliveryBoysListQuery({});
  const { data: locations = [] } = useLocationsQuery();
  const { data: storesRes } = useStoresPaginatedQuery({ per_page: 100 });
  const stores = storesRes?.data ?? [];

  return (
    <OrdersCardView
      orders={orders}
      isLoading={isLoading}
      page={page}
      perPage={perPage}
      setPage={setPage}
      setPerPage={setPerPage}
      meta={meta}
      status={status}
      setStatus={setStatus}
      userId={undefined}
      setUserId={() => {}}
      storeId={storeId}
      setStoreId={setStoreId}
      locationId={locationId}
      setLocationId={setLocationId}
      deliveryBoyId={deliveryBoyId}
      setDeliveryBoyId={setDeliveryBoyId}
      dateFrom={undefined}
      setDateFrom={() => {}}
      dateTo={undefined}
      setDateTo={() => {}}
      stores={stores}
      users={[]}
      locations={locations}
      deliveryBoys={deliveryBoys}
      clearFilters={() => {}}
      hasActiveFilters={false}
    />
  );
}