import { useState } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Autocomplete from "../../../components/form/Autocomplete";
import DatePicker from "../../../components/form/date-picker";
import Badge from "../../../components/ui/badge/Badge";
import Checkbox from "../../../components/form/input/Checkbox";
import { EyeIcon, PlusIcon } from "../../../icons";
import type { Order } from "../../../types/order";
import type { PaginationMeta } from "../../../types/pagination";
import type { Store } from "../../../types/store";
import type { AdminUser } from "../../../types/userManagement";
import type { Location } from "../../../types/location";
import Pagination from "../../../components/common/Pagination";
import { useUpdateOrderStatusMutation } from "../../../hooks/queries/orders";
import { useToast } from "../../../context/ToastContext";

const getStatusBadgeColor = (status: string | undefined): "warning" | "info" | "success" | "error" | "light" => {
  if (!status) return "light";
  const statusLower = status.toLowerCase();
  if (statusLower === "order_placed") return "warning";
  if (statusLower === "ready_to_dispatch" || statusLower === "out_of_delivery") return "info";
  if (statusLower === "delivered") return "success";
  if (statusLower === "cancelled" || statusLower === "canceled") return "error";
  return "light";
};

const formatStatusForDisplay = (status: string | undefined): string => {
  if (!status) return "—";
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "order_placed":
      return "Order Placed";
    case "ready_to_dispatch":
      return "Ready to Dispatch";
    case "out_of_delivery":
      return "Out of Delivery";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      // Fallback: capitalize first letter and replace underscores with spaces
      return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
  }
};

type Props = {
  orders: Order[];
  isLoading: boolean;
  page: number;
  perPage: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  meta: PaginationMeta | undefined;
  status: string | undefined;
  setStatus: (status: string | undefined) => void;
  userId: number | undefined;
  setUserId: (userId: number | undefined) => void;
  storeId: number | undefined;
  setStoreId: (storeId: number | undefined) => void;
  locationId: number | undefined;
  setLocationId: (locationId: number | undefined) => void;
  deliveryBoyId: number | undefined;
  setDeliveryBoyId: (deliveryBoyId: number | undefined) => void;
  dateFrom: string | undefined;
  setDateFrom: (date: string | undefined) => void;
  dateTo: string | undefined;
  setDateTo: (date: string | undefined) => void;
  stores: Store[];
  users: AdminUser[];
  locations: Location[];
  deliveryBoys: AdminUser[];
  clearFilters: () => void;
  hasActiveFilters: boolean;
};

export function OrdersView(props: Props) {
  const navigate = useNavigate();
  const updateStatusMutation = useUpdateOrderStatusMutation();
  const { showToast } = useToast();
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  
  const {
    orders,
    isLoading,
    setPage,
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
  } = props;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(orders.map((order) => order.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOrder = (orderId: number, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds((prev) => [...prev, orderId]);
    } else {
      setSelectedOrderIds((prev) => prev.filter((id) => id !== orderId));
    }
  };

  const handleBulkStatusChange = async () => {
    if (!bulkStatus) {
      showToast("error", "Please select a status", "Error");
      return;
    }
    if (selectedOrderIds.length === 0) {
      showToast("error", "Please select at least one order", "Error");
      return;
    }

    setIsBulkUpdating(true);
    const errors: string[] = [];
    const successCount = { count: 0 };

    // Use for loop to update each order
    for (let i = 0; i < selectedOrderIds.length; i++) {
      const orderId = selectedOrderIds[i];
      try {
        await updateStatusMutation.mutateAsync({
          id: orderId,
          status: bulkStatus,
          notes: `Bulk status update to ${formatStatusForDisplay(bulkStatus)}`,
        });
        successCount.count++;
      } catch (error) {
        const order = orders.find((o) => o.id === orderId);
        errors.push(`Order #${order?.order_number || orderId}: ${error instanceof Error ? error.message : "Failed"}`);
      }
    }

    setIsBulkUpdating(false);
    setSelectedOrderIds([]);
    setBulkStatus("");

    if (successCount.count > 0) {
      showToast("success", `Successfully updated ${successCount.count} order(s)`, "Success");
    }
    if (errors.length > 0) {
      showToast("error", `Failed to update ${errors.length} order(s)`, "Error");
    }
  };

  const allSelected = orders.length > 0 && selectedOrderIds.length === orders.length;

  return (
    <>
      <PageMeta title="All Orders | Lapina Bakes Admin" description="View all orders" />
      <PageBreadcrumb pageTitle="All Orders" />
      <div className="space-y-6">
        <ComponentCard title="">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">View and manage all orders here.</p>
            <Button size="sm" onClick={() => navigate("/orders/manual-create")} startIcon={<PlusIcon className="w-4 h-4" />}>
              Create Manual Order
            </Button>
          </div>

          {/* Bulk Actions - Only show when status filter is selected */}
          {status && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all-orders"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  label={`Select All (${selectedOrderIds.length} selected)`}
                />
              </div>
              {selectedOrderIds.length > 0 && (
                <>
                  <div className="flex-1">
                    <Select
                      options={[
                        { value: "", label: "Select Status" },
                        { value: "order_placed", label: "Order Placed" },
                        { value: "ready_to_dispatch", label: "Ready to Dispatch" },
                        { value: "out_of_delivery", label: "Out of Delivery" },
                        { value: "delivered", label: "Delivered" },
                        { value: "cancelled", label: "Cancelled" },
                      ]}
                      placeholder="Bulk Status Change"
                      value={bulkStatus}
                      onChange={(value) => setBulkStatus(value || "")}
                    />
                  </div>
                  <Button
                    onClick={handleBulkStatusChange}
                    disabled={!bulkStatus || isBulkUpdating}
                    size="sm"
                  >
                    {isBulkUpdating ? "Updating..." : `Update ${selectedOrderIds.length} Order(s)`}
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Filters */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8">
            <div>
              <Select
                options={[
                  { value: "", label: "All Status" },
                  { value: "order_placed", label: "Order Placed" },
                  { value: "ready_to_dispatch", label: "Ready to Dispatch" },
                  { value: "out_of_delivery", label: "Out of Delivery" },
                  { value: "delivered", label: "Delivered" },
                  { value: "cancelled", label: "Cancelled" },
                ]}
                placeholder="Filter by Status"
                value={status || ""}
                onChange={(value) => setStatus(value || undefined)}
              />
            </div>
            <div>
              <Autocomplete
                options={[
                  { value: "", label: "All Users" },
                  ...users.map((user) => ({ value: String(user.id), label: user.name }))
                ]}
                placeholder="Filter by User"
                value={userId ? String(userId) : ""}
                onChange={(value) => setUserId(value ? Number(value) : undefined)}
              />
            </div>
            <div>
              <Autocomplete
                options={[
                  { value: "", label: "All Stores" },
                  ...stores.map((store) => ({ value: String(store.id), label: store.name }))
                ]}
                placeholder="Filter by Store"
                value={storeId ? String(storeId) : ""}
                onChange={(value) => setStoreId(value ? Number(value) : undefined)}
              />
            </div>
            <div>
              <Autocomplete
                options={[
                  { value: "", label: "All Locations" },
                  ...locations.map((location) => ({ value: String(location.id), label: location.name }))
                ]}
                placeholder="Filter by Location"
                value={locationId ? String(locationId) : ""}
                onChange={(value) => setLocationId(value ? Number(value) : undefined)}
              />
            </div>
            <div>
              <Autocomplete
                options={[
                  { value: "", label: "All Delivery Boys" },
                  ...deliveryBoys.map((deliveryBoy) => ({ value: String(deliveryBoy.id), label: deliveryBoy.name }))
                ]}
                placeholder="Filter by Delivery Boy"
                value={deliveryBoyId ? String(deliveryBoyId) : ""}
                onChange={(value) => setDeliveryBoyId(value ? Number(value) : undefined)}
              />
            </div>
            <div>
              <DatePicker
                key={`date_from_${dateFrom || 'empty'}`}
                id="date_from"
                placeholder="Date From"
                defaultDate={dateFrom || undefined}
                onChange={(_dates, currentDateString) => {
                  setDateFrom(currentDateString || undefined);
                  setPage(1);
                }}
              />
            </div>
            <div>
              <DatePicker
                key={`date_to_${dateTo || 'empty'}`}
                id="date_to"
                placeholder="Date To"
                defaultDate={dateTo || undefined}
                onChange={(_dates, currentDateString) => {
                  setDateTo(currentDateString || undefined);
                  setPage(1);
                }}
              />
            </div>
            <div>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border-2 border-blue-100/60 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 dark:border-blue-800/40 dark:bg-gradient-to-br dark:from-gray-800/70 dark:via-blue-900/20 dark:to-indigo-900/30 shadow-lg">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b-2 border-blue-200/60 bg-gradient-to-r from-blue-100/40 via-indigo-100/50 to-purple-100/40 dark:border-blue-700/60 dark:bg-gradient-to-r dark:from-blue-900/30 dark:via-indigo-900/40 dark:to-purple-900/30">
                  <TableRow>
                    {status && (
                      <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider w-12">
                        <Checkbox
                          id="select-all-header"
                          checked={allSelected}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                    )}
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">
                      Order Number
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">
                      User
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">
                      Status
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">
                      Address
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">
                      Items
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">
                      Total
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">
                      Created At
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-blue-100/60 dark:divide-blue-800/40">
                  {isLoading ? (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-gray-500" colSpan={status ? 9 : 8}>Loading orders...</TableCell>
                    </TableRow>
                  ) : Array.isArray(orders) && orders.length > 0 ? (
                    orders.map((order, index) => (
                      <TableRow key={order.id} className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/80 dark:bg-gray-800/40' : 'bg-blue-25/30 dark:bg-blue-950/20'}`}>
                        {status && (
                          <TableCell className="px-5 py-4 text-start">
                            <Checkbox
                              id={`select-order-${order.id}`}
                              checked={selectedOrderIds.includes(order.id)}
                              onChange={(checked) => handleSelectOrder(order.id, checked)}
                            />
                          </TableCell>
                        )}
                        <TableCell className="px-5 py-4 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {order.order_number || `#${order.id}`}
                          </span>
                          <span className="text-theme-xs text-gray-500 dark:text-gray-400">ID: {order.id}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {order.user?.name || "—"}
                          </span>
                          <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                            {order.user?.email || ""}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {order.status ? (
                            <Badge variant="light" color={getStatusBadgeColor(order.status)} size="sm">
                              {formatStatusForDisplay(order.status)}
                            </Badge>
                          ) : (
                            <span className="text-gray-700 text-theme-sm dark:text-gray-300">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="text-gray-700 text-theme-sm dark:text-gray-300">
                            {order.delivery_address || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="text-gray-700 text-theme-sm dark:text-gray-300">
                            {order.order_items?.length || 0}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="text-gray-700 text-theme-sm dark:text-gray-300">
                            {order.total_amount && !isNaN(parseFloat(order.total_amount))
                              ? `₹${parseFloat(order.total_amount).toFixed(2)}`
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="text-gray-700 text-theme-sm dark:text-gray-300">
                            {order.created_at
                              ? new Date(order.created_at).toLocaleDateString()
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <button
                            className="inline-flex items-center justify-center rounded-md p-2 text-info-600 hover:text-info-700 hover:bg-info-50 dark:text-info-400 dark:hover:text-info-300 dark:hover:bg-info-900/20 transition-colors"
                            aria-label="View Order"
                            onClick={() => navigate(`/orders/${order.id}`)}
                            title="View Order Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-gray-500" colSpan={status ? 9 : 8}>No orders found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {meta && meta.last_page > 1 && (
              <Pagination
                meta={meta}
                onPageChange={setPage}
                isLoading={isLoading}
              />
            )}
          </div>
        </ComponentCard>
      </div>
    </>
  );
}

