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
import { EyeIcon, PlusIcon } from "../../../icons";
import type { Order } from "../../../types/order";
import type { PaginationMeta } from "../../../types/pagination";
import type { Store } from "../../../types/store";
import type { AdminUser } from "../../../types/userManagement";
import type { Location } from "../../../types/location";
import Pagination from "../../../components/common/Pagination";

const getStatusBadgeColor = (status: string | undefined): "warning" | "info" | "success" | "error" | "light" => {
  if (!status) return "light";
  const statusLower = status.toLowerCase();
  if (statusLower === "pending") return "warning";
  if (statusLower === "processing") return "info";
  if (statusLower === "completed") return "success";
  if (statusLower === "cancelled" || statusLower === "canceled") return "error";
  return "light";
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

          {/* Filters */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8">
            <div>
              <Select
                options={[
                  { value: "", label: "All Status" },
                  { value: "pending", label: "Pending" },
                  { value: "processing", label: "Processing" },
                  { value: "completed", label: "Completed" },
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

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Order Number
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      User
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Status
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Address
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Items
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Total
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Created At
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {isLoading ? (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-gray-500" colSpan={8}>Loading orders...</TableCell>
                    </TableRow>
                  ) : Array.isArray(orders) && orders.length > 0 ? (
                    orders.map((order) => (
                      <TableRow key={order.id}>
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
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
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
                      <TableCell className="px-5 py-4 text-center text-gray-500" colSpan={8}>No orders found</TableCell>
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

