import { useOrdersPage } from "./hooks/useOrdersPage";
import { OrdersView } from "./components/OrdersView";

export default function AllOrders() {
  const {
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
  } = useOrdersPage();

  return (
    <OrdersView
      orders={orders}
      isLoading={isLoading}
      page={page}
      perPage={perPage}
      setPage={setPage}
      setPerPage={setPerPage}
      meta={meta}
      status={status}
      setStatus={setStatus}
      userId={userId}
      setUserId={setUserId}
      storeId={storeId}
      setStoreId={setStoreId}
      locationId={locationId}
      setLocationId={setLocationId}
      deliveryBoyId={deliveryBoyId}
      setDeliveryBoyId={setDeliveryBoyId}
      dateFrom={dateFrom}
      setDateFrom={setDateFrom}
      dateTo={dateTo}
      setDateTo={setDateTo}
      stores={stores}
      users={users}
      locations={locations}
      deliveryBoys={deliveryBoys}
      clearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );
}