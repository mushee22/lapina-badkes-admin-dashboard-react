import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTransactionInput, UpdateTransactionInput } from "../../types/transaction";
import * as api from "../../services/transactions";
import type { TransactionListParams } from "../../services/transactions";
import type { PaginatedResponse } from "../../types/pagination";
import { useToast } from "../../context/ToastContext";

export const transactionsKey = ["transactions"] as const;

export function useCreateTransactionMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (input: CreateTransactionInput) => api.createTransaction(input),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: transactionsKey });
      qc.invalidateQueries({ queryKey: ["orders"] }); // Invalidate orders to refresh order data
      qc.invalidateQueries({ queryKey: [...transactionsKey, "order", variables.transactionable_id] }); // Invalidate order transactions
      showToast("success", "Payment recorded successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to record payment";
      showToast("error", message, "Error");
    },
  });
}

export function useTransactionsPaginatedQuery(params?: TransactionListParams) {
  const { showToast } = useToast();
  const effectiveParams = params ?? {};
  return useQuery<PaginatedResponse<api.Transaction>>({
    queryKey: [...transactionsKey, "paginated", effectiveParams],
    queryFn: async () => {
      try {
        return await api.listTransactionsPaginated(effectiveParams);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load transactions";
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

export function useOrderTransactionsQuery(orderId: number | null) {
  const { showToast } = useToast();
  return useQuery<api.Transaction[]>({
    queryKey: [...transactionsKey, "order", orderId],
    queryFn: async () => {
      try {
        return await api.getOrderTransactions(orderId!);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load order transactions";
        showToast("error", message, "Error");
        throw error;
      }
    },
    enabled: orderId !== null,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useUpdateTransactionMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTransactionInput }) => api.updateTransaction(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transactionsKey });
      qc.invalidateQueries({ queryKey: ["orders"] }); // Invalidate orders to refresh order data
      qc.invalidateQueries({ queryKey: [...transactionsKey, "order"] }); // Invalidate all order transactions
      showToast("success", "Transaction updated successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to update transaction";
      showToast("error", message, "Error");
    },
  });
}

export function useDeleteTransactionMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: number) => api.deleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transactionsKey });
      qc.invalidateQueries({ queryKey: ["orders"] }); // Invalidate orders to refresh order data
      qc.invalidateQueries({ queryKey: [...transactionsKey, "order"] }); // Invalidate all order transactions
      showToast("success", "Transaction deleted successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to delete transaction";
      showToast("error", message, "Error");
    },
  });
}

