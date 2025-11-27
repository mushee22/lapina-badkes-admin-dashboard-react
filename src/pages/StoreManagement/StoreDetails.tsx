import { useParams, useNavigate } from "react-router";
import { useStoreQuery, useUpdateStoreMutation, useDeleteStoreMutation, useSetStoreDiscountMutation, useDeactivateStoreDiscountMutation } from "../../hooks/queries/stores";
import { useOrdersPaginatedQuery } from "../../hooks/queries/orders";
import { useCreateStoreTransactionMutation } from "../../hooks/queries/transactions";
import { useAdminUsersQuery } from "../../hooks/queries/adminUsers";
import { useDeliveryBoysListQuery } from "../../hooks/queries/deliveryBoys";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import Switch from "../../components/form/switch/Switch";
import DatePicker from "../../components/form/date-picker";
import Select from "../../components/form/Select";
import Autocomplete from "../../components/form/Autocomplete";
import TextArea from "../../components/form/input/TextArea";
import { useModal } from "../../hooks/useModal";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { SetStoreDiscountSchema } from "../../types/store";
import type { SetStoreDiscountInput } from "../../types/store";
import { CreateStoreTransactionSchema, type CreateStoreTransactionInput } from "../../types/transaction";
import { ChevronLeftIcon, PencilIcon, TrashBinIcon, EyeIcon, BoxIcon, DollarLineIcon } from "../../icons";
import { useToast } from "../../context/ToastContext";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Pagination from "../../components/common/Pagination";

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

export default function StoreDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: store, isLoading } = useStoreQuery(id ? Number(id) : null);
  
  // Orders pagination state
  const [ordersPage, setOrdersPage] = useState<number>(1);
  const [ordersStatus, setOrdersStatus] = useState<string | undefined>(undefined);
  
  // Fetch orders for this store
  const { data: ordersRes, isLoading: isLoadingOrders } = useOrdersPaginatedQuery({
    page: ordersPage,
    per_page: 15,
    store_id: id ? Number(id) : undefined,
    status: ordersStatus,
  });
  
  const orders = ordersRes?.data ?? [];
  const ordersMeta = ordersRes?.meta;
  
  const { isOpen: isDiscountOpen, openModal: openDiscountModal, closeModal: closeDiscountModal } = useModal();
  const { isOpen: isDeactivateDiscountOpen, openModal: openDeactivateDiscountModal, closeModal: closeDeactivateDiscountModal } = useModal();
  const { isOpen: isActivateDiscountOpen, openModal: openActivateDiscountModal, closeModal: closeActivateDiscountModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const { isOpen: isStorePaymentOpen, openModal: openStorePaymentModal, closeModal: closeStorePaymentModal } = useModal();

  const updateStoreMutation = useUpdateStoreMutation();
  const deleteStoreMutation = useDeleteStoreMutation();
  const setDiscountMutation = useSetStoreDiscountMutation();
  const deactivateDiscountMutation = useDeactivateStoreDiscountMutation();
  const createStoreTransactionMutation = useCreateStoreTransactionMutation();
  const { data: deliveryBoys = [] } = useDeliveryBoysListQuery({});
  const { data: adminUsers = [] } = useAdminUsersQuery();

  const {
    control: discountControl,
    handleSubmit: handleDiscountSubmit,
    reset: resetDiscount,
    formState: { errors: discountErrors },
  } = useForm<SetStoreDiscountInput>({
    resolver: zodResolver(SetStoreDiscountSchema),
    defaultValues: {
      discount_percentage: store?.discount?.percentage || 0,
      discount_start_date: store?.discount?.start_date ? store.discount.start_date.split('T')[0] : "",
      discount_end_date: store?.discount?.end_date ? store.discount.end_date.split('T')[0] : "",
      discount_description: store?.discount?.description || "",
    },
  });

  const {
    control: storePaymentControl,
    handleSubmit: handleStorePaymentSubmit,
    reset: resetStorePayment,
    formState: { errors: storePaymentErrors },
  } = useForm<CreateStoreTransactionInput>({
    resolver: zodResolver(CreateStoreTransactionSchema),
    defaultValues: {
      store_id: id ? Number(id) : 0,
      amount: 0,
      payment_mode: "cash",
      payment_note: "",
      collected_by: undefined,
      transaction_date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (store) {
      resetDiscount({
        discount_percentage: store.discount?.percentage || 0,
        discount_start_date: store.discount?.start_date ? store.discount.start_date.split('T')[0] : "",
        discount_end_date: store.discount?.end_date ? store.discount.end_date.split('T')[0] : "",
        discount_description: store.discount?.description || "",
      });
    }
  }, [store, resetDiscount]);

  const onToggleActive = () => {
    if (id && store) {
      updateStoreMutation.mutate({
        id: Number(id),
        data: { is_active: !store.is_active },
      });
    }
  };

  const onDelete = () => {
    if (id) {
      deleteStoreMutation.mutate(Number(id), {
        onSuccess: () => {
          navigate("/stores");
        },
      });
    }
  };

  const onDiscountSubmit = handleDiscountSubmit((data) => {
    if (id) {
      setDiscountMutation.mutate(
        { id: Number(id), data },
        { onSuccess: () => closeDiscountModal() },
      );
    }
  });

  const onDeactivateDiscount = () => {
    if (id) {
      deactivateDiscountMutation.mutate(Number(id), {
        onSuccess: () => {
          closeDeactivateDiscountModal();
          showToast("success", "Discount deactivated successfully", "Success");
        },
      });
    }
  };

  const onActivateDiscount = () => {
    if (id && store?.discount) {
      const discountData: SetStoreDiscountInput = {
        discount_percentage: store.discount.percentage || store.discount.current_percentage || 0,
        discount_start_date: store.discount.start_date ? (store.discount.start_date.includes('T') ? store.discount.start_date.split('T')[0] : store.discount.start_date) : "",
        discount_end_date: store.discount.end_date ? (store.discount.end_date.includes('T') ? store.discount.end_date.split('T')[0] : store.discount.end_date) : "",
        discount_description: store.discount.description || "",
      };
      
      setDiscountMutation.mutate(
        { id: Number(id), data: discountData },
        {
          onSuccess: () => {
            closeActivateDiscountModal();
            showToast("success", "Discount activated successfully", "Success");
          },
        }
      );
    }
  };

  const onStorePaymentSubmit = handleStorePaymentSubmit((data) => {
    createStoreTransactionMutation.mutate(data, {
      onSuccess: () => {
        closeStorePaymentModal();
      },
    });
  });

  useEffect(() => {
    if (id && isStorePaymentOpen) {
      resetStorePayment({
        store_id: Number(id),
        amount: 0,
        payment_mode: "cash",
        payment_note: "",
        collected_by: undefined,
        transaction_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [id, isStorePaymentOpen, resetStorePayment]);

  if (isLoading) {
    return (
      <>
        <PageMeta title="Store Details | Lapina Bakes Admin" description="Store details" />
        <PageBreadcrumb pageTitle="Store Details" />
        <div className="space-y-6">
          <ComponentCard title="">
            <div className="px-5 py-4 text-center text-gray-500">Loading store details...</div>
          </ComponentCard>
        </div>
      </>
    );
  }

  if (!store) {
    return (
      <>
        <PageMeta title="Store Details | Lapina Bakes Admin" description="Store details" />
        <PageBreadcrumb pageTitle="Store Details" />
        <div className="space-y-6">
          <ComponentCard title="">
            <div className="px-5 py-4 text-center text-gray-500">Store not found</div>
          </ComponentCard>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title={`${store.name} | Lapina Bakes Admin`} description="Store details" />
      <PageBreadcrumb pageTitle="Store Details" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigate("/stores")} startIcon={<ChevronLeftIcon className="w-4 h-4" />}>
            Back to Stores
          </Button>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={openStorePaymentModal}
              startIcon={<DollarLineIcon className="w-4 h-4" />}
            >
              Add Store Payment
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => navigate(`/overview/store/${id}`)}
              startIcon={<BoxIcon className="w-4 h-4" />}
            >
              View Overview
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => navigate(`/stores/${id}/edit`)}
              startIcon={<PencilIcon className="w-4 h-4" />}
            >
              Edit Store
            </Button>
            <Button 
              size="sm" 
              variant="primary" 
              onClick={openDeleteModal}
              startIcon={<TrashBinIcon className="w-4 h-4" />}
            >
              Delete Store
            </Button>
          </div>
        </div>

        {/* Store Information */}
        <ComponentCard title="Store Information">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Name:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{store.name}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Description:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{store.description || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Location:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {store.location ? `${store.location.name} (${store.location.code || store.location.id})` : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Phone:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{store.phone || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Email:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{store.email || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Address:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{store.address || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Website:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {store.website ? (
                      <a href={store.website} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">
                        {store.website}
                      </a>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Owner Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Owner Name:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{store.owner?.name || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Owner Email:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{store.owner?.email || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Owner Phone:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{store.owner?.phone || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Store Status & Settings */}
        <ComponentCard title="Status & Settings">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Active:</span>
                  <div className="mt-1">
                    <Switch
                      label={store.is_active ? "Active" : "Inactive"}
                      checked={store.is_active}
                      onChange={onToggleActive}
                      disabled={updateStoreMutation.isPending}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Store Settings</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Min Order Amount:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {store.settings?.min_order_amount ? `₹${store.settings.min_order_amount.toFixed(2)}` : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Delivery Fee:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {store.settings?.delivery_fee ? `₹${store.settings.delivery_fee.toFixed(2)}` : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Store Discount */}
        <ComponentCard title="Store Discount">
          <div className="space-y-4">
            {store.discount?.has_active_discount && (store.discount?.percentage || store.discount?.current_percentage) ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">Active Discount</h4>
                  <Button size="sm" variant="outline" onClick={openDeactivateDiscountModal}>
                    Deactivate
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Percentage:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {(store.discount.percentage || store.discount.current_percentage || 0)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Description:</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {store.discount.description || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Start Date:</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {store.discount.start_date
                        ? new Date(store.discount.start_date).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">End Date:</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {store.discount.end_date
                        ? new Date(store.discount.end_date).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            ) : store.discount && (store.discount.percentage || store.discount.current_percentage) ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">Discount Information</h4>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={openDiscountModal}>
                      Update Discount
                    </Button>
                    <Button size="sm" variant="outline" onClick={openActivateDiscountModal}>
                      Activate
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Percentage:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {(store.discount.percentage || store.discount.current_percentage || 0)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Description:</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {store.discount.description || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Start Date:</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {store.discount.start_date
                        ? new Date(store.discount.start_date).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">End Date:</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {store.discount.end_date
                        ? new Date(store.discount.end_date).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Status: <span className="text-gray-700 dark:text-gray-300">Inactive</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p className="mb-3 text-sm">No active discount</p>
                <Button size="sm" onClick={openDiscountModal}>
                  Set Discount
                </Button>
              </div>
            )}
          </div>
        </ComponentCard>

        {/* Store Orders */}
        <ComponentCard title="Store Orders">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View all orders for this store. {ordersMeta?.total ? `Total: ${ordersMeta.total}` : ""}
            </p>
            <div className="w-48">
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
                value={ordersStatus || ""}
                onChange={(value) => {
                  setOrdersStatus(value || undefined);
                  setOrdersPage(1);
                }}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border-2 border-blue-100/60 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 dark:border-blue-800/40 dark:bg-gradient-to-br dark:from-gray-800/70 dark:via-blue-900/20 dark:to-indigo-900/30 shadow-lg">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b-2 border-blue-200/60 bg-gradient-to-r from-blue-100/40 via-indigo-100/50 to-purple-100/40 dark:border-blue-700/60 dark:bg-gradient-to-r dark:from-blue-900/30 dark:via-indigo-900/40 dark:to-purple-900/30">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">
                      Order Number
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">
                      Customer
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
                  {isLoadingOrders ? (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-gray-500" colSpan={8}>Loading orders...</TableCell>
                    </TableRow>
                  ) : Array.isArray(orders) && orders.length > 0 ? (
                    orders.map((order, index) => (
                      <TableRow key={order.id} className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/80 dark:bg-gray-800/40' : 'bg-blue-25/30 dark:bg-blue-950/20'}`}>
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
            {ordersMeta && ordersMeta.last_page > 1 && (
              <Pagination
                meta={ordersMeta}
                onPageChange={setOrdersPage}
                isLoading={isLoadingOrders}
              />
            )}
          </div>
        </ComponentCard>
      </div>

      {/* Set Discount Modal */}
      <Modal isOpen={isDiscountOpen} onClose={closeDiscountModal} className="w-full max-w-2xl mx-4 sm:mx-6">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Set Store Discount</h3>
          <form onSubmit={onDiscountSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="discount_percentage">
                  Percentage <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="discount_percentage"
                  control={discountControl}
                  render={({ field }) => (
                    <InputField
                      id="discount_percentage"
                      type="number"
                      step="0.1"
                      placeholder="15.0"
                      value={field.value ? String(field.value) : ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      error={!!discountErrors.discount_percentage}
                      hint={discountErrors.discount_percentage?.message}
                    />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="discount_description">Description</Label>
                <Controller
                  name="discount_description"
                  control={discountControl}
                  render={({ field }) => (
                    <InputField
                      id="discount_description"
                      placeholder="Holiday Special Discount"
                      value={field.value || ""}
                      onChange={field.onChange}
                      error={!!discountErrors.discount_description}
                      hint={discountErrors.discount_description?.message}
                    />
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="start_date">
                  Start Date <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="discount_start_date"
                  control={discountControl}
                  render={({ field }) => {
                    const dateValue = field.value 
                      ? (field.value.includes('T') ? field.value.split('T')[0] : field.value)
                      : "";
                    return (
                      <div>
                        <DatePicker
                          id="discount_start_date"
                          placeholder="Select start date"
                          defaultDate={dateValue || undefined}
                          onChange={(_dates, currentDateString) => {
                            if (currentDateString) {
                              field.onChange(currentDateString);
                            }
                          }}
                        />
                        {discountErrors.discount_start_date && (
                          <p className="mt-1.5 text-xs text-error-500">
                            {discountErrors.discount_start_date.message}
                          </p>
                        )}
                      </div>
                    );
                  }}
                />
              </div>
              <div>
                <Label htmlFor="end_date">
                  End Date <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="discount_end_date"
                  control={discountControl}
                  render={({ field }) => {
                    const dateValue = field.value 
                      ? (field.value.includes('T') ? field.value.split('T')[0] : field.value)
                      : "";
                    return (
                      <div>
                        <DatePicker
                          id="discount_end_date"
                          placeholder="Select end date"
                          defaultDate={dateValue || undefined}
                          onChange={(_dates, currentDateString) => {
                            if (currentDateString) {
                              field.onChange(currentDateString);
                            }
                          }}
                        />
                        {discountErrors.discount_end_date && (
                          <p className="mt-1.5 text-xs text-error-500">
                            {discountErrors.discount_end_date.message}
                          </p>
                        )}
                      </div>
                    );
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <Button variant="outline" onClick={closeDiscountModal} disabled={setDiscountMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={setDiscountMutation.isPending}>
                {setDiscountMutation.isPending ? "Setting..." : "Set Discount"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Deactivate Discount Modal */}
      <Modal isOpen={isDeactivateDiscountOpen} onClose={closeDeactivateDiscountModal} className="w-full max-w-md mx-4 sm:mx-6">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Deactivate Discount</h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to deactivate the discount for this store?
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={closeDeactivateDiscountModal} disabled={deactivateDiscountMutation.isPending}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onDeactivateDiscount} disabled={deactivateDiscountMutation.isPending}>
              {deactivateDiscountMutation.isPending ? "Deactivating..." : "Deactivate"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Activate Discount Modal */}
      <Modal isOpen={isActivateDiscountOpen} onClose={closeActivateDiscountModal} className="w-full max-w-md mx-4 sm:mx-6">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Activate Discount</h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to activate the discount for this store?
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={closeActivateDiscountModal} disabled={setDiscountMutation.isPending}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onActivateDiscount} disabled={setDiscountMutation.isPending}>
              {setDiscountMutation.isPending ? "Activating..." : "Activate"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Store Payment Modal */}
      <Modal isOpen={isStorePaymentOpen} onClose={closeStorePaymentModal} className="w-full max-w-lg mx-4 sm:mx-6">
        <form onSubmit={onStorePaymentSubmit}>
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Add Store Payment</h3>
            
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400">Store</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {store?.name}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">
                  Amount <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="amount"
                  control={storePaymentControl}
                  render={({ field }) => (
                    <InputField
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseFloat(e.currentTarget.value) || 0)}
                      error={!!storePaymentErrors.amount}
                      hint={storePaymentErrors.amount?.message}
                    />
                  )}
                />
              </div>

              <div>
                <Label htmlFor="payment_mode">
                  Payment Mode <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="payment_mode"
                  control={storePaymentControl}
                  render={({ field }) => (
                    <Select
                      options={[
                        { value: "cash", label: "Cash" },
                        { value: "online", label: "Online" },
                        { value: "bank_transfer", label: "Bank Transfer" },
                        { value: "other", label: "Other" },
                      ]}
                      placeholder="Select Payment Mode"
                      value={field.value || ""}
                      onChange={(value) => field.onChange(value || "")}
                    />
                  )}
                />
                {storePaymentErrors.payment_mode && (
                  <p className="mt-1.5 text-xs text-error-500">{storePaymentErrors.payment_mode.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="transaction_date">
                  Transaction Date <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="transaction_date"
                  control={storePaymentControl}
                  render={({ field }) => (
                    <DatePicker
                      id="transaction_date"
                      placeholder="Select Date"
                      defaultDate={field.value || new Date().toISOString().split('T')[0]}
                      onChange={(_dates, currentDateString) => {
                        field.onChange(currentDateString || "");
                      }}
                    />
                  )}
                />
                {storePaymentErrors.transaction_date && (
                  <p className="mt-1.5 text-xs text-error-500">{storePaymentErrors.transaction_date.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="collected_by">
                  Collected By (Optional)
                </Label>
                <Controller
                  name="collected_by"
                  control={storePaymentControl}
                  render={({ field }) => (
                    <Autocomplete
                      options={[
                        ...deliveryBoys.map((boy) => ({
                          value: String(boy.id),
                          label: `${boy.name} (Delivery Boy)`,
                        })),
                        ...adminUsers.map((user) => ({
                          value: String(user.id),
                          label: `${user.name} (Admin)`,
                        })),
                      ]}
                      placeholder="Select Person (Optional)"
                      value={field.value ? String(field.value) : ""}
                      onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                    />
                  )}
                />
                {storePaymentErrors.collected_by && (
                  <p className="mt-1.5 text-xs text-error-500">{storePaymentErrors.collected_by.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="payment_note">Payment Note (Optional)</Label>
                <Controller
                  name="payment_note"
                  control={storePaymentControl}
                  render={({ field }) => (
                    <TextArea
                      placeholder="Store payment covering multiple orders..."
                      rows={3}
                      value={field.value || ""}
                      onChange={(value) => field.onChange(value || null)}
                      error={!!storePaymentErrors.payment_note}
                      hint={storePaymentErrors.payment_note?.message}
                    />
                  )}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center gap-3">
              <Button variant="outline" onClick={closeStorePaymentModal} disabled={createStoreTransactionMutation.isPending} type="button" className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button 
                variant="primary" 
                disabled={createStoreTransactionMutation.isPending} 
                type="submit"
                className="w-full sm:w-auto"
              >
                {createStoreTransactionMutation.isPending ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Store Modal */}
      <Modal isOpen={isDeleteOpen} onClose={closeDeleteModal} className="w-full max-w-md mx-4 sm:mx-6">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Confirm Delete</h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete the store &quot;{store?.name}&quot;? This action cannot be undone.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={closeDeleteModal} disabled={deleteStoreMutation.isPending}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onDelete} disabled={deleteStoreMutation.isPending}>
              {deleteStoreMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

