import { useParams, useNavigate } from "react-router";
import { useStoreQuery, useUpdateStoreMutation, useDeleteStoreMutation, useSetStoreDiscountMutation, useDeactivateStoreDiscountMutation } from "../../hooks/queries/stores";
import { useOrdersPaginatedQuery } from "../../hooks/queries/orders";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import Switch from "../../components/form/switch/Switch";
import DatePicker from "../../components/form/date-picker";
import { useModal } from "../../hooks/useModal";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { SetStoreDiscountSchema } from "../../types/store";
import type { SetStoreDiscountInput } from "../../types/store";
import { ChevronLeftIcon, PencilIcon, TrashBinIcon, EyeIcon, BoxIcon } from "../../icons";
import { useToast } from "../../context/ToastContext";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Pagination from "../../components/common/Pagination";
import Select from "../../components/form/Select";

const getStatusBadgeColor = (status: string | undefined): "warning" | "info" | "success" | "error" | "light" => {
  if (!status) return "light";
  const statusLower = status.toLowerCase();
  if (statusLower === "pending") return "warning";
  if (statusLower === "processing") return "info";
  if (statusLower === "completed") return "success";
  if (statusLower === "cancelled" || statusLower === "canceled") return "error";
  return "light";
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

  const updateStoreMutation = useUpdateStoreMutation();
  const deleteStoreMutation = useDeleteStoreMutation();
  const setDiscountMutation = useSetStoreDiscountMutation();
  const deactivateDiscountMutation = useDeactivateStoreDiscountMutation();

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
                  { value: "pending", label: "Pending" },
                  { value: "processing", label: "Processing" },
                  { value: "completed", label: "Completed" },
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

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Order Number
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Customer
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
                  {isLoadingOrders ? (
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

