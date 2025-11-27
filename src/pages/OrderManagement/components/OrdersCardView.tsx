import { useState } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import Button from "../../../components/ui/button/Button";
import Badge from "../../../components/ui/badge/Badge";
import { Modal } from "../../../components/ui/modal";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import Autocomplete from "../../../components/form/Autocomplete";
import TextArea from "../../../components/form/input/TextArea";
import Checkbox from "../../../components/form/input/Checkbox";
import { EyeIcon, PlusIcon, PencilIcon } from "../../../icons";
import type { Order } from "../../../types/order";
import type { PaginationMeta } from "../../../types/pagination";
import type { Store } from "../../../types/store";
import type { AdminUser } from "../../../types/userManagement";
import type { Location } from "../../../types/location";
import Pagination from "../../../components/common/Pagination";
import { useUpdateOrderStatusMutation, useAssignDeliveryBoyMutation } from "../../../hooks/queries/orders";
import { useOverviewQuery } from "../../../hooks/queries/overview";
import type { OverviewData } from "../../../services/overview";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useModal } from "../../../hooks/useModal";
import { useToast } from "../../../context/ToastContext";

const getStatusBadgeColor = (status: string | undefined): "warning" | "info" | "success" | "error" | "light" => {
  if (!status) return "light";
  const statusLower = status.toLowerCase();
  if (statusLower === "order_placed") return "warning";
  if (statusLower === "ready_to_dispatch") return "info";
  if (statusLower === "out_of_delivery") return "info";
  if (statusLower === "delivered") return "success";
  if (statusLower === "cancelled" || statusLower === "canceled") return "error";
  return "light";
};

const getStatusCardColor = (status: string | undefined): string => {
  if (!status) return "border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]";
  const statusLower = status.toLowerCase();
  if (statusLower === "order_placed") return "border-warning-200 bg-warning-50 dark:border-warning-900/30 dark:bg-warning-900/10";
  if (statusLower === "ready_to_dispatch" || statusLower === "out_of_delivery") return "border-info-200 bg-info-50 dark:border-info-900/30 dark:bg-info-900/10";
  if (statusLower === "delivered") return "border-success-200 bg-success-50 dark:border-success-900/30 dark:bg-success-900/10";
  if (statusLower === "cancelled" || statusLower === "canceled") return "border-error-200 bg-error-50 dark:border-error-900/30 dark:bg-error-900/10";
  return "border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]";
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

const UpdateStatusSchema = z.object({
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
});

const AssignDeliveryBoySchema = z.object({
  delivery_boy_id: z.number().min(1, "Delivery boy is required"),
  auto_update_status: z.boolean().default(true).optional(),
  notes: z.string().optional(),
});

type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>;
type AssignDeliveryBoyInput = z.infer<typeof AssignDeliveryBoySchema>;

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

const getStatusCount = (status: string | undefined, overview: OverviewData | undefined): number => {
  if (!overview?.orders) return 0;
  if (status === undefined) {
    return overview.orders.total || 0;
  }
  // Map status values to overview order stats keys
  const statusMap: Record<string, keyof typeof overview.orders> = {
    order_placed: "order_placed",
    ready_to_dispatch: "ready_to_dispatch",
    out_of_delivery: "out_of_delivery",
    delivered: "delivered",
    cancelled: "cancelled",
  };
  const statusKey = statusMap[status];
  if (statusKey && overview.orders[statusKey] !== undefined) {
    return overview.orders[statusKey] as number;
  }
  return 0;
};

const statusTabs = [
  { value: undefined, label: "All" },
  { value: "order_placed", label: "Order Placed" },
  { value: "ready_to_dispatch", label: "Ready to Dispatch" },
  { value: "out_of_delivery", label: "Out of Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function OrdersCardView(props: Props) {
  const navigate = useNavigate();
  const updateStatusMutation = useUpdateOrderStatusMutation();
  const assignDeliveryBoyMutation = useAssignDeliveryBoyMutation();
  const { showToast } = useToast();
  const { isOpen: isStatusOpen, openModal: openStatusModal, closeModal: closeStatusModal } = useModal();
  const { isOpen: isAssignOpen, openModal: openAssignModal, closeModal: closeAssignModal } = useModal();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const {
    orders,
    isLoading,
    setPage,
    meta,
    status,
    setStatus,
    locationId,
    setLocationId,
    locations,
    storeId,
    setStoreId,
    stores,
    deliveryBoyId,
    setDeliveryBoyId,
    deliveryBoys,
  } = props;
  
  // Fetch overview data for order counts with current filters
  const { data: overview, isLoading: isLoadingOverview } = useOverviewQuery({
    location_id: locationId,
    store_id: storeId,
    delivery_boy_id: deliveryBoyId,
  });

  // Helper function to get allowed status transitions
  const getAllowedStatusTransitions = (currentStatus: string) => {
    const statusLower = currentStatus.toLowerCase();
    switch (statusLower) {
      case "order_placed":
        return [
          { value: "ready_to_dispatch", label: "Ready to Dispatch", color: "info" as const },
          { value: "cancelled", label: "Cancel", color: "error" as const },
        ];
      case "ready_to_dispatch":
        return [
          { value: "out_of_delivery", label: "Out of Delivery", color: "info" as const },
          { value: "cancelled", label: "Cancel", color: "error" as const },
        ];
      case "out_of_delivery":
        return [
          { value: "delivered", label: "Delivered", color: "success" as const },
          { value: "cancelled", label: "Cancel", color: "error" as const },
        ];
      default:
        return [];
    }
  };

  // Get next status (first non-cancelled transition)
  const getNextStatus = (currentStatus: string | undefined): string | null => {
    if (!currentStatus) return null;
    const transitions = getAllowedStatusTransitions(currentStatus);
    const nextTransition = transitions.find((t) => t.value !== "cancelled");
    return nextTransition?.value || null;
  };

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

  const handleBulkStatusChange = async (changeAll: boolean) => {
    const nextStatus = getNextStatus(status);
    if (!nextStatus) {
      showToast("error", "No next status available for current status", "Error");
      return;
    }

    const ordersToUpdate = changeAll
      ? orders.map((order) => order.id)
      : selectedOrderIds;

    if (ordersToUpdate.length === 0) {
      showToast("error", "No orders to update", "Error");
      return;
    }

    setIsBulkUpdating(true);
    const errors: string[] = [];
    const successCount = { count: 0 };

    // Use for loop to update each order
    for (let i = 0; i < ordersToUpdate.length; i++) {
      const orderId = ordersToUpdate[i];
      try {
        await updateStatusMutation.mutateAsync({
          id: orderId,
          status: nextStatus,
          notes: `Bulk status update from ${formatStatusForDisplay(status)} to ${formatStatusForDisplay(nextStatus)}`,
        });
        successCount.count++;
      } catch (error) {
        const order = orders.find((o) => o.id === orderId);
        errors.push(`Order #${order?.order_number || orderId}: ${error instanceof Error ? error.message : "Failed"}`);
      }
    }

    setIsBulkUpdating(false);
    setSelectedOrderIds([]);

    if (successCount.count > 0) {
      showToast("success", `Successfully updated ${successCount.count} order(s) to ${formatStatusForDisplay(nextStatus)}`, "Success");
    }
    if (errors.length > 0) {
      showToast("error", `Failed to update ${errors.length} order(s)`, "Error");
    }
  };

  // Quick status update function
  const handleQuickStatusUpdate = (order: Order, newStatus: string) => {
    updateStatusMutation.mutate({
      id: order.id,
      status: newStatus,
      notes: `Status changed from ${order.status} to ${newStatus} via quick action`,
    });
  };

  const {
    control: statusControl,
    handleSubmit: handleStatusSubmit,
    reset: resetStatus,
    formState: { errors: statusErrors },
  } = useForm<UpdateStatusInput>({
    resolver: zodResolver(UpdateStatusSchema),
    defaultValues: {
      status: "",
      notes: "",
    },
  });

  const {
    control: assignControl,
    handleSubmit: handleAssignSubmit,
    reset: resetAssign,
    formState: { errors: assignErrors },
  } = useForm<AssignDeliveryBoyInput>({
    resolver: zodResolver(AssignDeliveryBoySchema),
    defaultValues: {
      delivery_boy_id: undefined,
      auto_update_status: true,
      notes: "",
    },
  });

  const openStatusModalForOrder = (order: Order) => {
    setSelectedOrder(order);
    resetStatus({
      status: order.status || "",
      notes: "",
    });
    openStatusModal();
  };

  const openAssignModalForOrder = (order: Order) => {
    setSelectedOrder(order);
    resetAssign({
      delivery_boy_id: undefined,
      auto_update_status: true,
      notes: "",
    });
    openAssignModal();
  };

  const onStatusSubmit = (data: UpdateStatusInput) => {
    if (!selectedOrder) return;
    updateStatusMutation.mutate(
      {
        id: selectedOrder.id,
        status: data.status,
        notes: data.notes || "",
      },
      {
        onSuccess: () => {
          closeStatusModal();
          setSelectedOrder(null);
        },
      }
    );
  };

  const onAssignSubmit = (data: AssignDeliveryBoyInput) => {
    if (!selectedOrder) return;
    assignDeliveryBoyMutation.mutate(
      {
        id: selectedOrder.id,
        delivery_boy_id: data.delivery_boy_id,
        auto_update_status: data.auto_update_status ?? true,
        notes: data.notes || "",
      },
      {
        onSuccess: () => {
          closeAssignModal();
          setSelectedOrder(null);
        },
      }
    );
  };

  return (
    <>
      <PageMeta title="Pending Orders | Lapina Bakes Admin" description="View and manage pending orders" />
      <PageBreadcrumb pageTitle="Pending Orders" />
      <div className="space-y-6">
        <ComponentCard title="">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">View and manage orders by status.</p>
            <Button size="sm" onClick={() => navigate("/orders/manual-create")} startIcon={<PlusIcon className="w-4 h-4" />}>
              Create Manual Order
            </Button>
          </div>

          {/* Filters */}
          <div className="mb-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                    { value: "", label: "All Delivery Boys" },
                    ...deliveryBoys.map((deliveryBoy) => ({ value: String(deliveryBoy.id), label: deliveryBoy.name }))
                  ]}
                  placeholder="Filter by Delivery Boy"
                  value={deliveryBoyId ? String(deliveryBoyId) : ""}
                  onChange={(value) => setDeliveryBoyId(value ? Number(value) : undefined)}
                />
              </div>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="mb-4">
            <div className="flex items-center gap-0.5 rounded-lg bg-gradient-to-r from-slate-100 to-slate-50 p-0.5 dark:from-slate-800 dark:to-slate-900 overflow-x-auto border border-slate-200 dark:border-slate-600">
              {statusTabs.map((tab) => {
                const isActive = status === tab.value;
                const count = isLoadingOverview ? 0 : getStatusCount(tab.value, overview);
                const getTabColor = () => {
                  if (isActive) {
                    if (tab.value === "order_placed") {
                      return "shadow-md text-white bg-gradient-to-r from-warning-500 to-warning-600 dark:from-warning-600 dark:to-warning-700";
                    }
                    if (tab.value === "ready_to_dispatch") {
                      return "shadow-md text-white bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700";
                    }
                    if (tab.value === "out_of_delivery") {
                      return "shadow-md text-white bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700";
                    }
                    if (tab.value === "delivered") {
                      return "shadow-md text-white bg-gradient-to-r from-success-500 to-success-600 dark:from-success-600 dark:to-success-700";
                    }
                    if (tab.value === "cancelled") {
                      return "shadow-md text-white bg-gradient-to-r from-error-500 to-error-600 dark:from-error-600 dark:to-error-700";
                    }
                    return "shadow-md text-white bg-gradient-to-r from-brand-500 to-brand-600 dark:from-brand-600 dark:to-brand-700";
                  }
                  return "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-gray-600/50 font-medium";
                };
                const getCountBadgeColor = () => {
                  if (isActive) {
                    return "bg-white/20 text-white font-bold";
                  }
                  if (tab.value === "order_placed") {
                    return "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300";
                  }
                  if (tab.value === "ready_to_dispatch") {
                    return "bg-blue-100 text-blue-900 dark:bg-blue-800/50 dark:text-blue-100 font-semibold";
                  }
                  if (tab.value === "out_of_delivery") {
                    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
                  }
                  if (tab.value === "delivered") {
                    return "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300";
                  }
                  if (tab.value === "cancelled") {
                    return "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-300";
                  }
                  return "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
                };
                return (
                  <button
                    key={tab.value || "all"}
                    onClick={() => {
                      setStatus(tab.value);
                      setSelectedOrderIds([]);
                    }}
                    className={`px-3 py-2 font-medium rounded-md text-sm whitespace-nowrap transition-all flex items-center gap-2 ${getTabColor()}`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${getCountBadgeColor()}`}>
                      {isLoadingOverview ? "..." : count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bulk Actions - Only show when status is selected and not "All", "delivered", or "cancelled" */}
          {status && status !== undefined && status !== "delivered" && status !== "cancelled" && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all-orders"
                  checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                  onChange={handleSelectAll}
                  label={`Select All (${selectedOrderIds.length} selected)`}
                />
              </div>
              {(() => {
                const nextStatus = getNextStatus(status);
                if (!nextStatus) return null;
                return (
                  <>
                    <div className="flex-1 text-sm text-gray-600 dark:text-gray-400">
                      Next status: <span className="font-medium text-gray-800 dark:text-white/90">{formatStatusForDisplay(nextStatus)}</span>
                    </div>
                    <Button
                      onClick={() => handleBulkStatusChange(false)}
                      disabled={isBulkUpdating || selectedOrderIds.length === 0}
                      size="sm"
                      variant="outline"
                    >
                      {isBulkUpdating ? "Updating..." : `Change Selected (${selectedOrderIds.length})`}
                    </Button>
                    <Button
                      onClick={() => handleBulkStatusChange(true)}
                      disabled={isBulkUpdating || orders.length === 0}
                      size="sm"
                    >
                      {isBulkUpdating ? "Updating..." : `Change All (${orders.length})`}
                    </Button>
                  </>
                );
              })()}
            </div>
          )}

          {/* Orders Grid */}
          {isLoading ? (
            <div className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No orders found
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {orders.map((order) => {
                const statusCount = getStatusCount(order.status, overview);
                return (
                  <div
                    key={order.id}
                    className={`rounded-xl border p-4 hover:shadow-md transition-shadow ${getStatusCardColor(order.status)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-2 flex-1">
                        {status && status !== "delivered" && status !== "cancelled" && (
                          <div className="pt-1">
                            <Checkbox
                              id={`select-order-${order.id}`}
                              checked={selectedOrderIds.includes(order.id)}
                              onChange={(checked) => handleSelectOrder(order.id, checked)}
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                            {order.order_number || `#${order.id}`}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="light" color={getStatusBadgeColor(order.status)} size="sm">
                          {formatStatusForDisplay(order.status)}
                        </Badge>
                        {statusCount > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {statusCount} {statusCount === 1 ? 'order' : 'orders'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Customer:</span>
                      <span className="font-medium text-gray-800 dark:text-white/90">{order.user?.name || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                      <span className="font-semibold text-gray-800 dark:text-white/90">
                        {order.total_amount && !isNaN(parseFloat(order.total_amount))
                          ? `₹${parseFloat(order.total_amount).toFixed(2)}`
                          : "—"}
                      </span>
                    </div>
                    {order.delivery_boy && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Delivery Boy:</span>
                        <span className="font-medium text-gray-800 dark:text-white/90">{order.delivery_boy.name || "—"}</span>
                      </div>
                    )}
                    {order.store && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Store:</span>
                        <span className="font-medium text-gray-800 dark:text-white/90">{order.store.name || "—"}</span>
                      </div>
                    )}
                    </div>

                    {/* Status Transition Buttons */}
                    {(() => {
                      const allowedTransitions = getAllowedStatusTransitions(order.status);
                      return allowedTransitions.length > 0 && (
                        <div className="pt-3 border-t border-gray-100 dark:border-white/[0.05]">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Quick Actions:</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {allowedTransitions.map((transition) => {
                              const getButtonClasses = () => {
                                if (transition.color === "success") {
                                  return "bg-success-50 text-success-700 hover:bg-success-100 border-success-200 dark:bg-success-900/20 dark:text-success-300 dark:hover:bg-success-900/30 dark:border-success-800";
                                }
                                if (transition.color === "error") {
                                  return "bg-error-50 text-error-700 hover:bg-error-100 border-error-200 dark:bg-error-900/20 dark:text-error-300 dark:hover:bg-error-900/30 dark:border-error-800";
                                }
                                return "bg-info-50 text-info-700 hover:bg-info-100 border-info-200 dark:bg-info-900/20 dark:text-info-300 dark:hover:bg-info-900/30 dark:border-info-800";
                              };
                              
                              return (
                                <button
                                  key={transition.value}
                                  onClick={() => handleQuickStatusUpdate(order, transition.value)}
                                  disabled={updateStatusMutation.isPending}
                                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getButtonClasses()}`}
                                  title={`Change status to ${transition.label}`}
                                >
                                  {updateStatusMutation.isPending ? "..." : transition.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-white/[0.05]">
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="inline-flex items-center justify-center rounded-md p-2 text-info-600 hover:text-info-700 hover:bg-info-50 dark:text-info-400 dark:hover:text-info-300 dark:hover:bg-info-900/20 transition-colors"
                      aria-label="View Order"
                      title="View Order Details"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openStatusModalForOrder(order)}
                      className="inline-flex items-center justify-center rounded-md p-2 text-warning-600 hover:text-warning-700 hover:bg-warning-50 dark:text-warning-400 dark:hover:text-warning-300 dark:hover:bg-warning-900/20 transition-colors"
                      aria-label="Change Status"
                      title="Change Order Status"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openAssignModalForOrder(order)}
                      className="inline-flex items-center justify-center rounded-md p-2 text-success-600 hover:text-success-700 hover:bg-success-50 dark:text-success-400 dark:hover:text-success-300 dark:hover:bg-success-900/20 transition-colors"
                      aria-label="Assign Delivery Boy"
                      title="Assign Delivery Boy"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {meta && (
            <div className="mt-4">
              <Pagination
                meta={meta}
                onPageChange={setPage}
                onPerPageChange={(perPage) => {
                  props.setPerPage(perPage);
                  setPage(1);
                }}
                isLoading={isLoading}
              />
            </div>
          )}
        </ComponentCard>
      </div>

      {/* Update Status Modal */}
      <Modal isOpen={isStatusOpen} onClose={closeStatusModal} className="w-full max-w-md mx-4 sm:mx-6">
        <form onSubmit={handleStatusSubmit(onStatusSubmit)}>
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Update Order Status</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">
                  Status <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="status"
                  control={statusControl}
                  render={({ field }) => (
                    <Select
                      options={[
                        { value: "order_placed", label: "Order Placed" },
                        { value: "ready_to_dispatch", label: "Ready to Dispatch" },
                        { value: "out_of_delivery", label: "Out of Delivery" },
                        { value: "delivered", label: "Delivered" },
                        { value: "cancelled", label: "Cancelled" },
                      ]}
                      placeholder="Select Status"
                      value={field.value || ""}
                      onChange={(value) => field.onChange(value || "")}
                    />
                  )}
                />
                {statusErrors.status && (
                  <p className="mt-1.5 text-xs text-error-500">{statusErrors.status.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Controller
                  name="notes"
                  control={statusControl}
                  render={({ field }) => (
                    <TextArea
                      placeholder="Enter notes for this status update..."
                      rows={4}
                      value={field.value || ""}
                      onChange={(value) => field.onChange(value)}
                      error={!!statusErrors.notes}
                      hint={statusErrors.notes?.message}
                    />
                  )}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center gap-3">
              <Button variant="outline" onClick={closeStatusModal} disabled={updateStatusMutation.isPending} type="button" className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button variant="primary" disabled={updateStatusMutation.isPending} type="submit" className="w-full sm:w-auto">
                {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Assign Delivery Boy Modal */}
      <Modal isOpen={isAssignOpen} onClose={closeAssignModal} className="w-full max-w-md mx-4 sm:mx-6">
        <form onSubmit={handleAssignSubmit(onAssignSubmit)}>
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Assign Delivery Boy</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="delivery_boy_id">
                  Delivery Boy <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="delivery_boy_id"
                  control={assignControl}
                  render={({ field }) => (
                    <Autocomplete
                      options={deliveryBoys.map((boy) => ({
                        value: String(boy.id),
                        label: boy.name,
                      }))}
                      placeholder="Select Delivery Boy"
                      value={field.value ? String(field.value) : ""}
                      onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                    />
                  )}
                />
                {assignErrors.delivery_boy_id && (
                  <p className="mt-1.5 text-xs text-error-500">{assignErrors.delivery_boy_id.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="auto_update_status">
                  <Controller
                    name="auto_update_status"
                    control={assignControl}
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="auto_update_status"
                          checked={field.value ?? true}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Auto update status</span>
                      </div>
                    )}
                  />
                </Label>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Controller
                  name="notes"
                  control={assignControl}
                  render={({ field }) => (
                    <TextArea
                      placeholder="Enter notes for this assignment..."
                      rows={4}
                      value={field.value || ""}
                      onChange={(value) => field.onChange(value)}
                      error={!!assignErrors.notes}
                      hint={assignErrors.notes?.message}
                    />
                  )}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center gap-3">
              <Button variant="outline" onClick={closeAssignModal} disabled={assignDeliveryBoyMutation.isPending} type="button" className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button variant="primary" disabled={assignDeliveryBoyMutation.isPending} type="submit" className="w-full sm:w-auto">
                {assignDeliveryBoyMutation.isPending ? "Assigning..." : "Assign Delivery Boy"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}

