import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useOrderQuery, useUpdateOrderStatusMutation, useAssignDeliveryBoyMutation, useDeleteOrderMutation, useGenerateOrderInvoiceMutation, useDownloadOrderInvoiceMutation, useUpdateOrderItemsMutation } from "../../hooks/queries/orders";
import { useProductsPaginatedQuery } from "../../hooks/queries/products";
import { useDeliveryBoysListQuery } from "../../hooks/queries/deliveryBoys";
import { useAdminUsersQuery } from "../../hooks/queries/adminUsers";
import { useCreateTransactionMutation, useOrderTransactionsQuery, useUpdateTransactionMutation, useDeleteTransactionMutation } from "../../hooks/queries/transactions";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import Autocomplete from "../../components/form/Autocomplete";
import TextArea from "../../components/form/input/TextArea";
import InputField from "../../components/form/input/InputField";
import DatePicker from "../../components/form/date-picker";
import { useModal } from "../../hooks/useModal";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreateTransactionSchema, type CreateTransactionInput, UpdateTransactionSchema, type UpdateTransactionInput } from "../../types/transaction";
import type { UpdateOrderItemsInput } from "../../services/orders";
const UpdateOrderStatusSchema = z.object({
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
});

type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;
import { DownloadIcon, TrashBinIcon, FileIcon, DollarLineIcon, PencilIcon, PlusIcon } from "../../icons";
import { useState } from "react";

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

const AssignDeliveryBoySchema = z.object({
  delivery_boy_id: z.number().min(1, "Delivery boy is required"),
  auto_update_status: z.boolean().default(true).optional(),
  notes: z.string().optional(),
});

type AssignDeliveryBoyInput = z.infer<typeof AssignDeliveryBoySchema>;

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrderQuery(id ? Number(id) : null);
  const { data: orderTransactions = [], isLoading: isLoadingTransactions } = useOrderTransactionsQuery(id ? Number(id) : null);
  const updateOrderStatusMutation = useUpdateOrderStatusMutation();
  const assignDeliveryBoyMutation = useAssignDeliveryBoyMutation();
  const deleteMutation = useDeleteOrderMutation();
  const generateInvoiceMutation = useGenerateOrderInvoiceMutation();
  const downloadInvoiceMutation = useDownloadOrderInvoiceMutation();
  const updateOrderItemsMutation = useUpdateOrderItemsMutation();
  const { data: deliveryBoys = [] } = useDeliveryBoysListQuery({});
  const { data: adminUsers = [] } = useAdminUsersQuery();
  const createTransactionMutation = useCreateTransactionMutation();
  const updateTransactionMutation = useUpdateTransactionMutation();
  const deleteTransactionMutation = useDeleteTransactionMutation();
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isAssignOpen, openModal: openAssignModal, closeModal: closeAssignModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const { isOpen: isPaymentOpen, openModal: openPaymentModal, closeModal: closePaymentModal } = useModal();
  const { isOpen: isEditTransactionOpen, openModal: openEditTransactionModal, closeModal: closeEditTransactionModal } = useModal();
  const { isOpen: isDeleteTransactionOpen, openModal: openDeleteTransactionModal, closeModal: closeDeleteTransactionModal } = useModal();
  const { isOpen: isEditItemsOpen, openModal: openEditItemsModal, closeModal: closeEditItemsModal } = useModal();
  const [selectedTransaction, setSelectedTransaction] = useState<import("../../services/transactions").Transaction | null>(null);
  const [editingItems, setEditingItems] = useState<UpdateOrderItemsInput["items"]>([]);
  const [newItems, setNewItems] = useState<Array<{ product_id: number; quantity: number; product_name?: string }>>([]);
  const { data: productsData } = useProductsPaginatedQuery({ page: 1, per_page: 50 });
  const products = productsData?.data || [];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateOrderStatusInput>({
    resolver: zodResolver(UpdateOrderStatusSchema),
    defaultValues: {
      status: order?.status || "",
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

  // Payment form
  const {
    control: paymentControl,
    handleSubmit: handlePaymentSubmit,
    reset: resetPayment,
    watch: watchPayment,
    formState: { errors: paymentErrors },
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      transactionable_type: "order",
      transactionable_id: id ? Number(id) : 0,
      amount: 0,
      payment_mode: undefined,
      payment_note: "",
      payment_discount: undefined,
      collected_by: undefined,
      transaction_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    },
  });

  const paymentAmount = watchPayment("amount") || 0;
  const paymentDiscount = watchPayment("payment_discount") || 0;

  // Update Transaction form
  const {
    control: updateTransactionControl,
    handleSubmit: handleUpdateTransactionSubmit,
    reset: resetUpdateTransaction,
    formState: { errors: updateTransactionErrors },
  } = useForm<UpdateTransactionInput>({
    resolver: zodResolver(UpdateTransactionSchema),
    defaultValues: {
      amount: 0,
      payment_mode: undefined,
      payment_note: "",
      payment_discount: 0,
      collected_by: undefined,
      transaction_date: "",
    },
  });


  useEffect(() => {
    if (order) {
      reset({
        status: order.status || "",
        notes: "",
      });
      resetAssign({
        delivery_boy_id: undefined,
        auto_update_status: true,
        notes: "",
      });
    }
  }, [order, reset, resetAssign]);

  useEffect(() => {
    if (order && isPaymentOpen) {
      resetPayment({
        transactionable_type: "order",
        transactionable_id: order.id,
        amount: 0,
        payment_mode: undefined,
        payment_note: "",
        payment_discount: undefined,
        collected_by: undefined,
        transaction_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [order, isPaymentOpen, resetPayment]);


  const onSubmit = (data: UpdateOrderStatusInput) => {
    if (!id) return;
    updateOrderStatusMutation.mutate(
      { id: Number(id), status: data.status, notes: data.notes || "" },
      {
        onSuccess: () => {
          closeEditModal();
        },
      }
    );
  };

  const onAssignSubmit = (data: AssignDeliveryBoyInput) => {
    if (!id) return;
    assignDeliveryBoyMutation.mutate(
      {
        id: Number(id),
        delivery_boy_id: data.delivery_boy_id,
        auto_update_status: data.auto_update_status ?? true,
        notes: data.notes || "",
      },
      {
        onSuccess: () => {
          closeAssignModal();
        },
      }
    );
  };

  const onDelete = () => {
    if (!id) return;
    deleteMutation.mutate(Number(id), {
      onSuccess: () => {
        closeDeleteModal();
        navigate("/orders/all");
      },
    });
  };

  const onPaymentSubmit = (data: CreateTransactionInput) => {
    if (!order) return;
    
    const orderAmount = parseFloat(order.total_amount) || 0;
    const amount = data.amount || 0;
    const discount = data.payment_discount || 0;
    
    // Validate amount and discount don't exceed order amount
    if (amount > orderAmount) {
      return;
    }
    if (discount > orderAmount) {
      return;
    }
    if (amount + discount > orderAmount) {
      return;
    }

    createTransactionMutation.mutate(data, {
      onSuccess: () => {
        closePaymentModal();
      },
    });
  };

  const openEditTransaction = (transaction: import("../../services/transactions").Transaction) => {
    setSelectedTransaction(transaction);
    resetUpdateTransaction({
      amount: transaction.amount,
      payment_mode: transaction.payment_mode as "cash" | "card" | "online" | "upi" | "bank_transfer" | "other" | undefined,
      payment_note: transaction.payment_note || "",
      payment_discount: transaction.payment_discount || 0,
      collected_by: transaction.collected_by || undefined,
      transaction_date: transaction.transaction_date ? transaction.transaction_date.split('T')[0] : "",
    });
    openEditTransactionModal();
  };

  const openDeleteTransaction = (transaction: import("../../services/transactions").Transaction) => {
    setSelectedTransaction(transaction);
    openDeleteTransactionModal();
  };

  const onUpdateTransactionSubmit = (data: UpdateTransactionInput) => {
    if (!selectedTransaction) return;
    updateTransactionMutation.mutate(
      { id: selectedTransaction.id, data },
      {
        onSuccess: () => {
          closeEditTransactionModal();
          setSelectedTransaction(null);
        },
      }
    );
  };

  const onDeleteTransaction = () => {
    if (!selectedTransaction) return;
    deleteTransactionMutation.mutate(selectedTransaction.id, {
      onSuccess: () => {
        closeDeleteTransactionModal();
        setSelectedTransaction(null);
      },
    });
  };

  const openEditItems = () => {
    if (!order?.order_items) return;
    // Only existing items for editing quantity or removal
    setEditingItems(
      order.order_items.map(item => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
      }))
    );
    // Reset new items
    setNewItems([]);
    openEditItemsModal();
  };

  const addNewItem = () => {
    setNewItems(prev => [...prev, { product_id: 0, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setEditingItems(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewItem = (index: number) => {
    setNewItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof UpdateOrderItemsInput["items"][0], value: number) => {
    setEditingItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const updateNewItem = (index: number, field: 'product_id' | 'quantity', value: number) => {
    setNewItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        // Add product name for display
        if (field === 'product_id') {
          const product = products.find(p => p.id === value);
          updatedItem.product_name = product?.name;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const onSubmitItemsEdit = () => {
    if (!id) return;
    
    // Filter existing items with valid quantity
    const validExistingItems = editingItems.filter(item => 
      item.quantity > 0
    );
    
    // Filter new items with valid product_id and quantity
    const validNewItems = newItems.filter(item => 
      item.product_id > 0 && item.quantity > 0
    ).map(item => ({ product_id: item.product_id, quantity: item.quantity }));
    
    const allItems = [...validExistingItems, ...validNewItems];
    
    if (allItems.length === 0) return;
    
    updateOrderItemsMutation.mutate({
      orderId: Number(id),
      items: { items: allItems }
    }, {
      onSuccess: () => {
        closeEditItemsModal();
      },
    });
  };

  if (isLoading) {
    return (
      <>
        <PageMeta title="Order Details | Lapina Bakes Admin" description="Order details" />
        <PageBreadcrumb pageTitle="Order Details" />
        <div className="space-y-6">
          <ComponentCard title="">
            <div className="px-5 py-4 text-center text-gray-500">Loading order details...</div>
          </ComponentCard>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <PageMeta title="Order Details | Lapina Bakes Admin" description="Order details" />
        <PageBreadcrumb pageTitle="Order Details" />
        <div className="space-y-6">
          <ComponentCard title="">
            <div className="px-5 py-4 text-center text-gray-500">Order not found</div>
            <div className="mt-4 flex justify-center">
              <Button variant="outline" size="sm" onClick={() => navigate("/orders")}>
                Back to Orders
              </Button>
            </div>
          </ComponentCard>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title={`Order ${order.order_number} | Lapina Bakes Admin`} description="Order details" />
      <PageBreadcrumb pageTitle="Order Details" />
      <div className="space-y-6">
        <div className="flex">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full sm:w-auto">
            {order.status?.toLowerCase() === "delivered" && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={openPaymentModal}
                startIcon={<DollarLineIcon className="w-4 h-4" />}
                className="w-full"
              >
                <span className="hidden sm:inline">Add Payment</span>
                <span className="sm:hidden">Payment</span>
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => id && generateInvoiceMutation.mutate(Number(id))}
              startIcon={<FileIcon className="w-4 h-4" />}
              disabled={generateInvoiceMutation.isPending}
              className="w-full"
            >
              <span className="hidden sm:inline">{generateInvoiceMutation.isPending ? "Generating..." : "Generate Invoice"}</span>
              <span className="sm:hidden">{generateInvoiceMutation.isPending ? "Generating..." : "Invoice"}</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => id && downloadInvoiceMutation.mutate(Number(id))}
              startIcon={<DownloadIcon className="w-4 h-4" />}
              disabled={downloadInvoiceMutation.isPending}
              className="w-full"
            >
              <span className="hidden sm:inline">{downloadInvoiceMutation.isPending ? "Downloading..." : "Download Invoice"}</span>
              <span className="sm:hidden">{downloadInvoiceMutation.isPending ? "Downloading..." : "Download"}</span>
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={openEditModal}
              startIcon={<PencilIcon className="w-4 h-4" />}
              className="w-full"
            >
              <span className="hidden sm:inline">Update Status</span>
              <span className="sm:hidden">Status</span>
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={openAssignModal}
              className="w-full"
            >
              <span className="hidden sm:inline">Assign Delivery Boy</span>
              <span className="sm:hidden">Assign</span>
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={openDeleteModal}
              startIcon={<TrashBinIcon className="w-4 h-4" />}
              className="w-full"
            >
              <span className="hidden sm:inline">Delete Order</span>
              <span className="sm:hidden">Delete</span>
            </Button>
          </div>
        </div>

        {/* Order Information */}
        <ComponentCard title="Order Information">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Order Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Order Number:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{order.order_number || `#${order.id}`}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Order ID:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{order.id}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Status:</span>
                  <div className="mt-1">
                    {order.status ? (
                      <Badge variant="light" color={getStatusBadgeColor(order.status)} size="sm">
                        {formatStatusForDisplay(order.status)}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-700 dark:text-gray-300">—</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Subtotal Amount:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {order.subtotal_amount && !isNaN(parseFloat(order.subtotal_amount))
                      ? `₹${parseFloat(order.subtotal_amount).toFixed(2)}`
                      : order.total_amount && !isNaN(parseFloat(order.total_amount))
                      ? `₹${parseFloat(order.total_amount).toFixed(2)}`
                      : "—"}
                  </p>
                </div>
                {(order.total_gst_amount && parseFloat(order.total_gst_amount) > 0) && (
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Total GST:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      ₹{parseFloat(order.total_gst_amount).toFixed(2)}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Total Amount:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {order.total_amount && !isNaN(parseFloat(order.total_amount))
                      ? `₹${parseFloat(order.total_amount).toFixed(2)}`
                      : "—"}
                  </p>
                </div>
                {order.total_paid_amount !== undefined && (
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Total Paid:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      ₹{parseFloat(String(order.total_paid_amount || 0)).toFixed(2)}
                    </p>
                  </div>
                )}
                {order.payment_status && (
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Payment Status:</span>
                    <div className="mt-1">
                      <Badge 
                        variant="light" 
                        color={
                          order.payment_status === "fully_paid" ? "success" :
                          order.payment_status === "partially_paid" ? "warning" : "error"
                        } 
                        size="sm"
                      >
                        {order.payment_status.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </Badge>
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Delivery Address:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{order.delivery_address || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Phone:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{order.phone || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Created At:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {order.created_at ? new Date(order.created_at).toLocaleString() : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Updated At:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {order.updated_at ? new Date(order.updated_at).toLocaleString() : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Customer Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Name:</span>
                  {order.store_id ? (
                    <button
                      onClick={() => navigate(`/stores/${order.store_id}`)}
                      className="text-sm font-medium text-gray-800 dark:text-white/90 hover:text-brand-600 dark:hover:text-brand-400 hover:underline transition-colors text-left"
                    >
                      {order.user?.name || "—"}
                    </button>
                  ) : (
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{order.user?.name || "—"}</p>
                  )}
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Email:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{order.user?.email || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Phone:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{order.user?.phone || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Address:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{order.user?.address || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">User ID:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{order.user_id}</p>
                </div>
                {order.store_id && (
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/stores/${order.store_id}`)}
                      className="mt-2"
                    >
                      View Store Details
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Delivery Boy Information */}
        {order.delivery_boy_id && order.delivery_boy && (
          <ComponentCard title="Delivery Boy Information">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Delivery Boy Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Name:</span>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{order.delivery_boy.name || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Email:</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{order.delivery_boy.email || "—"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Phone:</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{order.delivery_boy.phone || "—"}</p>
                  </div>
                  {order.delivery_boy.address && (
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Address:</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{order.delivery_boy.address}</p>
                    </div>
                  )}
                </div>
              </div>
              {order.delivery_boy.primary_location && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Primary Location</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Location Name:</span>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">{order.delivery_boy.primary_location.name || "—"}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Location Code:</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{order.delivery_boy.primary_location.code || "—"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ComponentCard>
        )}

        {/* Order Items */}
        <ComponentCard title="">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Order Items</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openEditItems}
              startIcon={<PencilIcon className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Edit Items</span>
              <span className="sm:hidden">Edit</span>
            </Button>
          </div>
          {order.order_items && order.order_items.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-5">Product</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-5">Price</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-5">Quantity</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-5 hidden md:table-cell">GST %</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-5 hidden md:table-cell">GST Amount</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-5">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {order.order_items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-4 sm:px-5">
                          <div className="flex items-center gap-2 sm:gap-3">
                            {item.product?.main_image_url && (
                              <img
                                src={item.product.main_image_url}
                                alt={item.product.name || "Product"}
                                className="h-10 w-10 rounded-lg object-cover sm:h-12 sm:w-12"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <button
                                onClick={() => item.product?.id && navigate(`/products/${item.product.id}`)}
                                className="text-left hover:text-brand-600 dark:hover:text-brand-400 transition-colors w-full"
                              >
                                <p className="text-sm font-medium text-gray-800 dark:text-white/90 hover:underline truncate">
                                  {item.product?.name || "—"}
                                </p>
                              </button>
                              {item.product?.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 hidden sm:block">
                                  {item.product.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 sm:px-5">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {item.price && !isNaN(parseFloat(item.price))
                              ? `₹${parseFloat(item.price).toFixed(2)}`
                              : "—"}
                          </span>
                        </td>
                        <td className="px-3 py-4 sm:px-5">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.quantity}</span>
                        </td>
                        <td className="px-3 py-4 sm:px-5 hidden md:table-cell">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {item.gst_percentage !== null && item.gst_percentage !== undefined && item.gst_percentage > 0
                              ? `${item.gst_percentage}%`
                              : "—"}
                          </span>
                        </td>
                        <td className="px-3 py-4 sm:px-5 hidden md:table-cell">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {item.gst_amount !== null && item.gst_amount !== undefined && !isNaN(item.gst_amount) && item.gst_amount > 0
                              ? `₹${item.gst_amount.toFixed(2)}`
                              : "—"}
                          </span>
                        </td>
                        <td className="px-3 py-4 sm:px-5 text-right">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                              {item.subtotal_with_gst && !isNaN(item.subtotal_with_gst)
                                ? `₹${item.subtotal_with_gst.toFixed(2)}`
                                : item.subtotal && !isNaN(item.subtotal)
                                ? `₹${item.subtotal.toFixed(2)}`
                                : "—"}
                            </span>
                            {item.subtotal_with_gst && item.subtotal && item.subtotal_with_gst !== item.subtotal && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                (Base: ₹{item.subtotal.toFixed(2)})
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-gray-100 dark:border-white/[0.05]">
                    {order.subtotal_amount && parseFloat(order.subtotal_amount) > 0 && (
                      <tr>
                        <td colSpan={order.order_items.some(item => item.gst_percentage !== null && item.gst_percentage !== undefined) ? 3 : 5} className="px-3 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300 sm:px-5">
                          Subtotal:
                        </td>
                        <td colSpan={order.order_items.some(item => item.gst_percentage !== null && item.gst_percentage !== undefined) ? 2 : 0} className="hidden md:table-cell"></td>
                        <td className="px-3 py-2 text-sm text-gray-800 dark:text-white/90 sm:px-5">
                          ₹{parseFloat(order.subtotal_amount).toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {order.total_gst_amount && parseFloat(order.total_gst_amount) > 0 ? (
                      <tr>
                        <td colSpan={order.order_items.some(item => item.gst_percentage !== null && item.gst_percentage !== undefined) ? 3 : 5} className="px-3 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300 sm:px-5">
                          Total GST:
                        </td>
                        <td colSpan={order.order_items.some(item => item.gst_percentage !== null && item.gst_percentage !== undefined) ? 2 : 0} className="hidden md:table-cell"></td>
                        <td className="px-3 py-2 text-sm text-gray-800 dark:text-white/90 sm:px-5">
                          ₹{parseFloat(order.total_gst_amount).toFixed(2)}
                        </td>
                      </tr>
                    ): null}
                    <tr>
                      <td colSpan={order.order_items.some(item => item.gst_percentage !== null && item.gst_percentage !== undefined) ? 3 : 5} className="px-3 py-4 text-right text-sm font-semibold text-gray-800 dark:text-white/90 sm:px-5">
                        Total:
                      </td>
                      <td colSpan={order.order_items.some(item => item.gst_percentage !== null && item.gst_percentage !== undefined) ? 2 : 0} className="hidden md:table-cell"></td>
                      <td className="px-3 py-4 text-sm font-semibold text-gray-800 dark:text-white/90 sm:px-5">
                        {order.total_amount && !isNaN(parseFloat(order.total_amount))
                          ? `₹${parseFloat(order.total_amount).toFixed(2)}`
                          : "—"}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">
              No items in this order
            </div>
          )}
        </ComponentCard>

        {/* Order Transactions */}
        <ComponentCard title="Order Transactions">
          {isLoadingTransactions ? (
            <div className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">Loading transactions...</div>
          ) : orderTransactions.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-5">ID</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-5">Amount</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-5">Payment Mode</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-5">Status</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-5 hidden sm:table-cell">Collected By</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-5 hidden md:table-cell">Added By</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-5 hidden md:table-cell">Date</th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 sm:px-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {orderTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-3 py-4 sm:px-5">
                          <span className="text-sm text-gray-700 dark:text-gray-300">#{transaction.id}</span>
                        </td>
                        <td className="px-3 py-4 sm:px-5">
                          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                            ₹{transaction.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-3 py-4 sm:px-5">
                          <Badge variant="light" color="info" size="sm">
                            {transaction.payment_mode?.charAt(0).toUpperCase() + transaction.payment_mode?.slice(1) || "—"}
                          </Badge>
                        </td>
                        <td className="px-3 py-4 sm:px-5">
                          {transaction.payment_status && (
                            <Badge 
                              variant="light" 
                              color={
                                transaction.payment_status === "fully_paid" ? "success" :
                                transaction.payment_status === "partially_paid" ? "warning" : "error"
                              } 
                              size="sm"
                            >
                              {transaction.payment_status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          )}
                        </td>
                        <td className="px-3 py-4 sm:px-5 hidden sm:table-cell">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {transaction.collected_by_user?.name || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-4 sm:px-5 hidden md:table-cell">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {transaction.added_by_user?.name || "—"}
                          </span>
                        </td>
                        <td className="px-3 py-4 sm:px-5 hidden md:table-cell">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleDateString() : "—"}
                          </span>
                        </td>
                        <td className="px-3 py-4 sm:px-5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditTransaction(transaction)}
                              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
                              aria-label="Edit"
                              title="Edit Transaction"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteTransaction(transaction)}
                              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-error-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
                              aria-label="Delete"
                              title="Delete Transaction"
                            >
                              <TrashBinIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-gray-100 dark:border-white/[0.05]">
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300 sm:px-5">
                        Total Paid:
                      </td>
                      <td className="px-3 py-4 text-sm font-semibold text-gray-800 dark:text-white/90 sm:px-5">
                        ₹{orderTransactions.reduce((sum, t) => sum + (t.amount || 0), 0).toFixed(2)}
                      </td>
                      <td colSpan={2} className="hidden sm:table-cell"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">
              No transactions found for this order
            </div>
          )}
        </ComponentCard>

        {/* Edit Order Modal */}
        <Modal isOpen={isEditOpen} onClose={closeEditModal} className="w-full max-w-md mx-4 sm:mx-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Update Order Status</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">
                    Status
                  </Label>
                  <Controller
                    name="status"
                    control={control}
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
                        onChange={(value) => field.onChange(value || undefined)}
                      />
                    )}
                  />
                  {errors.status && (
                    <p className="mt-1.5 text-xs text-error-500">{errors.status.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes">
                    Notes
                  </Label>
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <TextArea
                        placeholder="Enter order notes..."
                        rows={4}
                        value={field.value || ""}
                        onChange={(value) => field.onChange(value)}
                        error={!!errors.notes}
                        hint={errors.notes?.message}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row items-center gap-3">
                <Button variant="outline" onClick={closeEditModal} disabled={updateOrderStatusMutation.isPending} type="button" className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button variant="primary" disabled={updateOrderStatusMutation.isPending} type="submit" className="w-full sm:w-auto">
                  {updateOrderStatusMutation.isPending ? "Updating..." : "Update Status"}
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
                            checked={field.value}
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
                  <Label htmlFor="notes">
                    Notes (Optional)
                  </Label>
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

        {/* Add Payment Modal */}
        <Modal isOpen={isPaymentOpen} onClose={closePaymentModal} className="w-full max-w-lg mx-4 sm:mx-6">
          <form onSubmit={handlePaymentSubmit(onPaymentSubmit)}>
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Add Payment Details</h3>
              
              {order && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Order Amount</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    ₹{parseFloat(order.total_amount || "0").toFixed(2)}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">
                    Amount <span className="text-error-500">*</span>
                  </Label>
                  <Controller
                    name="amount"
                    control={paymentControl}
                    render={({ field }) => (
                      <InputField
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseFloat(e.currentTarget.value) || 0)}
                        error={!!paymentErrors.amount || (order && paymentAmount > parseFloat(order.total_amount || "0"))}
                        hint={
                          paymentErrors.amount?.message ||
                          (order && paymentAmount > parseFloat(order.total_amount || "0")
                            ? `Amount cannot exceed order amount (₹${parseFloat(order.total_amount || "0").toFixed(2)})`
                            : undefined)
                        }
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
                    control={paymentControl}
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
                  {paymentErrors.payment_mode && (
                    <p className="mt-1.5 text-xs text-error-500">{paymentErrors.payment_mode.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="payment_discount">Payment Discount (Optional)</Label>
                  <Controller
                    name="payment_discount"
                    control={paymentControl}
                    render={({ field }) => (
                      <InputField
                        id="payment_discount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.currentTarget.value ? parseFloat(e.currentTarget.value) : undefined)}
                        error={order && paymentDiscount > parseFloat(order.total_amount || "0")}
                        hint={
                          order && paymentDiscount > parseFloat(order.total_amount || "0")
                            ? `Discount cannot exceed order amount (₹${parseFloat(order.total_amount || "0").toFixed(2)})`
                            : undefined
                        }
                      />
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="transaction_date">
                    Transaction Date <span className="text-error-500">*</span>
                  </Label>
                  <Controller
                    name="transaction_date"
                    control={paymentControl}
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
                  {paymentErrors.transaction_date && (
                    <p className="mt-1.5 text-xs text-error-500">{paymentErrors.transaction_date.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="collected_by">
                    Collected By (Optional)
                  </Label>
                  <Controller
                    name="collected_by"
                    control={paymentControl}
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
                  {paymentErrors.collected_by && (
                    <p className="mt-1.5 text-xs text-error-500">{paymentErrors.collected_by.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="payment_note">Payment Note (Optional)</Label>
                  <Controller
                    name="payment_note"
                    control={paymentControl}
                    render={({ field }) => (
                      <TextArea
                        placeholder="Enter payment notes..."
                        rows={3}
                        value={field.value || ""}
                        onChange={(value) => field.onChange(value || null)}
                        error={!!paymentErrors.payment_note}
                        hint={paymentErrors.payment_note?.message}
                      />
                    )}
                  />
                </div>

                {order && paymentAmount + paymentDiscount > parseFloat(order.total_amount || "0") && (
                  <div className="p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
                    <p className="text-xs text-error-600 dark:text-error-400">
                      Total (Amount + Discount) cannot exceed order amount (₹{parseFloat(order.total_amount || "0").toFixed(2)})
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row items-center gap-3">
                <Button variant="outline" onClick={closePaymentModal} disabled={createTransactionMutation.isPending} type="button" className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  disabled={
                    createTransactionMutation.isPending ||
                    (order && (paymentAmount > parseFloat(order.total_amount || "0") || 
                               paymentDiscount > parseFloat(order.total_amount || "0") ||
                               paymentAmount + paymentDiscount > parseFloat(order.total_amount || "0")))
                  } 
                  type="submit"
                  className="w-full sm:w-auto"
                >
                  {createTransactionMutation.isPending ? "Recording..." : "Record Payment"}
                </Button>
              </div>
            </div>
          </form>
        </Modal>

        {/* Delete Order Confirmation Modal */}
        <Modal isOpen={isDeleteOpen} onClose={closeDeleteModal} className="w-full max-w-md mx-4 sm:mx-6">
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Confirm Delete</h3>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete order &quot;{order?.order_number || (order ? `#${order.id}` : "")}&quot;? This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
              <Button variant="outline" onClick={closeDeleteModal} disabled={deleteMutation.isPending} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button variant="primary" onClick={onDelete} disabled={deleteMutation.isPending} className="w-full sm:w-auto">
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Transaction Modal */}
        <Modal isOpen={isEditTransactionOpen} onClose={closeEditTransactionModal} className="w-full max-w-md mx-4 sm:mx-6">
          <form onSubmit={handleUpdateTransactionSubmit(onUpdateTransactionSubmit)}>
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Edit Transaction</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="update_amount">
                    Amount <span className="text-error-500">*</span>
                  </Label>
                  <Controller
                    name="amount"
                    control={updateTransactionControl}
                    render={({ field }) => (
                      <InputField
                        id="update_amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseFloat(e.currentTarget.value) || 0)}
                        error={!!updateTransactionErrors.amount}
                        hint={updateTransactionErrors.amount?.message}
                      />
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="update_payment_mode">
                    Payment Mode <span className="text-error-500">*</span>
                  </Label>
                  <Controller
                    name="payment_mode"
                    control={updateTransactionControl}
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
                  {updateTransactionErrors.payment_mode && (
                    <p className="mt-1.5 text-xs text-error-500">{updateTransactionErrors.payment_mode.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="update_payment_discount">Payment Discount (Optional)</Label>
                  <Controller
                    name="payment_discount"
                    control={updateTransactionControl}
                    render={({ field }) => (
                      <InputField
                        id="update_payment_discount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.currentTarget.value ? parseFloat(e.currentTarget.value) : 0)}
                        error={!!updateTransactionErrors.payment_discount}
                        hint={updateTransactionErrors.payment_discount?.message}
                      />
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="update_collected_by">Collected By (Optional)</Label>
                  <Controller
                    name="collected_by"
                    control={updateTransactionControl}
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
                  {updateTransactionErrors.collected_by && (
                    <p className="mt-1.5 text-xs text-error-500">{updateTransactionErrors.collected_by.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="update_transaction_date">
                    Transaction Date <span className="text-error-500">*</span>
                  </Label>
                  <Controller
                    name="transaction_date"
                    control={updateTransactionControl}
                    render={({ field }) => (
                      <DatePicker
                        id="update_transaction_date"
                        placeholder="Select Date"
                        defaultDate={field.value}
                        onChange={(_dates, currentDateString) => {
                          field.onChange(currentDateString || "");
                        }}
                      />
                    )}
                  />
                  {updateTransactionErrors.transaction_date && (
                    <p className="mt-1.5 text-xs text-error-500">{updateTransactionErrors.transaction_date.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="update_payment_note">Payment Note (Optional)</Label>
                  <Controller
                    name="payment_note"
                    control={updateTransactionControl}
                    render={({ field }) => (
                      <TextArea
                        placeholder="Enter payment notes..."
                        rows={3}
                        value={field.value || ""}
                        onChange={(value) => field.onChange(value || null)}
                        error={!!updateTransactionErrors.payment_note}
                        hint={updateTransactionErrors.payment_note?.message}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row items-center gap-3">
                <Button variant="outline" onClick={closeEditTransactionModal} disabled={updateTransactionMutation.isPending} type="button" className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button variant="primary" disabled={updateTransactionMutation.isPending} type="submit" className="w-full sm:w-auto">
                  {updateTransactionMutation.isPending ? "Updating..." : "Update Transaction"}
                </Button>
              </div>
            </div>
          </form>
        </Modal>

        {/* Delete Transaction Confirmation Modal */}
        <Modal isOpen={isDeleteTransactionOpen} onClose={closeDeleteTransactionModal} className="w-full max-w-md mx-4 sm:mx-6">
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Confirm Delete</h3>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete transaction #{selectedTransaction?.id}? This action cannot be undone.
            </p>
            <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
              <Button variant="outline" onClick={closeDeleteTransactionModal} disabled={deleteTransactionMutation.isPending} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button variant="primary" onClick={onDeleteTransaction} disabled={deleteTransactionMutation.isPending} className="w-full sm:w-auto">
                {deleteTransactionMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Order Items Modal */}
        <Modal isOpen={isEditItemsOpen} onClose={closeEditItemsModal} className="w-full max-w-4xl mx-4 sm:mx-6">
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Edit Order Items</h3>
            
            <div className="space-y-6">
              {/* Existing Items */}
              {editingItems.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Existing Items</h4>
                  <div className="space-y-3">
                    {editingItems.map((item, index) => {
                      const orderItem = order?.order_items?.find(oi => oi.id === item.id);
                      return (
                        <div key={`existing-${index}`} className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div>
                            <Label>Product</Label>
                            <div className="px-3 py-2 text-sm text-gray-800 dark:text-white/90 bg-gray-50 dark:bg-gray-800 rounded-md">
                              {orderItem?.product?.name || `Product ID: ${item.product_id}`}
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`existing_quantity_${index}`}>Quantity</Label>
                            <InputField
                              id={`existing_quantity_${index}`}
                              type="number"
                              placeholder="Quantity"
                              value={item.quantity || ""}
                              onChange={(e) => updateItem(index, "quantity", parseInt(e.currentTarget.value) || 0)}
                            />
                          </div>
                          <div>
                            <Label>Item ID</Label>
                            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-md">
                              #{item.id}
                            </div>
                          </div>
                          <div className="flex items-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(index)}
                              startIcon={<TrashBinIcon className="w-4 h-4" />}
                              className="text-error-600 hover:text-error-700"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* New Items */}
              <div>
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Add New Items</h4>
                <div className="space-y-3">
                  {newItems.map((item, index) => (
                    <div key={`new-${index}`} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                      <div>
                        <Label htmlFor={`new_product_${index}`}>Product</Label>
                        <Autocomplete
                          options={products.map(product => ({
                            value: String(product.id),
                            label: product.name
                          }))}
                          placeholder="Select Product"
                          value={item.product_id ? String(item.product_id) : ""}
                          onChange={(value) => updateNewItem(index, "product_id", value ? parseInt(value) : 0)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`new_quantity_${index}`}>Quantity</Label>
                        <InputField
                          id={`new_quantity_${index}`}
                          type="number"
                          placeholder="Quantity"
                          value={item.quantity || ""}
                          onChange={(e) => updateNewItem(index, "quantity", parseInt(e.currentTarget.value) || 0)}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeNewItem(index)}
                          startIcon={<TrashBinIcon className="w-4 h-4" />}
                          className="text-error-600 hover:text-error-700"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addNewItem}
                      startIcon={<PlusIcon className="w-4 h-4" />}
                    >
                      Add New Item
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center gap-3">
              <Button variant="outline" onClick={closeEditItemsModal} disabled={updateOrderItemsMutation.isPending} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={onSubmitItemsEdit} 
                disabled={updateOrderItemsMutation.isPending || (editingItems.length === 0 && newItems.length === 0)}
                className="w-full sm:w-auto"
              >
                {updateOrderItemsMutation.isPending ? "Updating..." : "Update Items"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}

