import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Order, UpdateOrderInput, CreateManualOrderInput } from "../../types/order";
import { 
  listOrdersPaginated, 
  getOrder, 
  updateOrder, 
  deleteOrder, 
  generateOrderInvoice,
  downloadOrderInvoice,
  createManualOrder,
  getOrderCustomers,
  getOrderStores,
  getOrderDeliveryBoys,
  updateOrderStatus,
  assignDeliveryBoy,
  type OrderListParams 
} from "../../services/orders";
import type { PaginatedResponse } from "../../types/pagination";
import { useToast } from "../../context/ToastContext";

export const ordersKey = ["orders"] as const;

export function useOrdersPaginatedQuery(params?: OrderListParams) {
  const { showToast } = useToast();
  const effectiveParams = params ?? {};
  return useQuery<PaginatedResponse<Order>>({
    queryKey: [...ordersKey, "paginated", effectiveParams],
    queryFn: async () => {
      try {
        return await listOrdersPaginated(effectiveParams);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load orders";
        showToast("error", message, "Error");
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useOrderQuery(id: number | null) {
  const { showToast } = useToast();
  return useQuery<Order>({
    queryKey: [...ordersKey, id],
    queryFn: async () => {
      try {
        return await getOrder(id!);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load order";
        showToast("error", message, "Error");
        throw error;
      }
    },
    enabled: id !== null,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useUpdateOrderMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation<Order, Error, { id: number; data: UpdateOrderInput }>({
    mutationFn: ({ id, data }) => updateOrder(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ordersKey });
      qc.invalidateQueries({ queryKey: [...ordersKey, id] });
      showToast("success", "Order updated successfully", "Success");
    },
    onError: (error) => {
      const message = error.message || "Failed to update order";
      showToast("error", message, "Error");
    },
  });
}

export function useGenerateOrderInvoiceMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation<void, Error, number>({
    mutationFn: (id) => generateOrderInvoice(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ordersKey });
      qc.invalidateQueries({ queryKey: [...ordersKey, id] });
      showToast("success", "Invoice generated successfully", "Success");
    },
    onError: (error) => {
      const message = error.message || "Failed to generate invoice";
      showToast("error", message, "Error");
    },
  });
}

export function useDownloadOrderInvoiceMutation() {
  const { showToast } = useToast();
  return useMutation<Blob, Error, number>({
    mutationFn: (id) => downloadOrderInvoice(id),
    onSuccess: (blob, id) => {
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast("success", "Invoice downloaded successfully", "Success");
    },
    onError: (error) => {
      const message = error.message || "Failed to download invoice";
      showToast("error", message, "Error");
    },
  });
}

export function useDeleteOrderMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation<void, Error, number>({
    mutationFn: (id) => deleteOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ordersKey });
      showToast("success", "Order deleted successfully", "Success");
    },
    onError: (error) => {
      const message = error.message || "Failed to delete order";
      showToast("error", message, "Error");
    },
  });
}

export function useOrderCustomersQuery(search?: string) {
  return useQuery({
    queryKey: [...ordersKey, "customers", search],
    queryFn: () => getOrderCustomers(search),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useOrderStoresQuery() {
  return useQuery({
    queryKey: [...ordersKey, "stores"],
    queryFn: () => getOrderStores(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useOrderDeliveryBoysQuery() {
  return useQuery({
    queryKey: [...ordersKey, "delivery-boys"],
    queryFn: () => getOrderDeliveryBoys(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useCreateManualOrderMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation<Order, Error, CreateManualOrderInput>({
    mutationFn: (input) => createManualOrder(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ordersKey });
      showToast("success", "Manual order created successfully", "Success");
    },
    onError: (error) => {
      const message = error.message || "Failed to create manual order";
      showToast("error", message, "Error");
    },
  });
}

export function useUpdateOrderStatusMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation<Order, Error, { id: number; status: string; notes: string }>({
    mutationFn: ({ id, status, notes }) => updateOrderStatus(id, status, notes),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ordersKey });
      qc.invalidateQueries({ queryKey: [...ordersKey, id] });
      showToast("success", "Order status updated successfully", "Success");
    },
    onError: (error) => {
      const message = error.message || "Failed to update order status";
      showToast("error", message, "Error");
    },
  });
}

export function useAssignDeliveryBoyMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation<Order, Error, { id: number; delivery_boy_id: number; auto_update_status: boolean; notes: string }>({
    mutationFn: ({ id, delivery_boy_id, auto_update_status, notes }) =>
      assignDeliveryBoy(id, delivery_boy_id, auto_update_status, notes),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ordersKey });
      qc.invalidateQueries({ queryKey: [...ordersKey, id] });
      showToast("success", "Delivery boy assigned successfully", "Success");
    },
    onError: (error) => {
      const message = error.message || "Failed to assign delivery boy";
      showToast("error", message, "Error");
    },
  });
}

