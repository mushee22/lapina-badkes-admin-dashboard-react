import * as http from "./http";
import { CreateTransactionSchema, UpdateTransactionSchema } from "../types/transaction";
import type { CreateTransactionInput, UpdateTransactionInput } from "../types/transaction";
import type { PaginatedResponse } from "../types/pagination";

export interface TransactionUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export interface TransactionOrder {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
}

export interface TransactionStore {
  id: number;
  name: string;
  slug?: string;
  total_amount?: number;
  status?: string;
}

export interface Transaction {
  id: number;
  transactionable_type: string;
  transactionable_id: number;
  transactionable?: TransactionOrder | TransactionStore;
  amount: number;
  payment_mode: string;
  payment_status?: string;
  payment_note: string | null;
  payment_discount: number | null;
  collected_by: number | null;
  collected_by_user?: TransactionUser | null;
  added_by?: number | null;
  added_by_user?: TransactionUser | null;
  transaction_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionListParams {
  page?: number;
  per_page?: number;
  type?: string;
  payment_mode?: string;
  payment_status?: string;
  collected_by?: number;
  added_by?: number;
  date_from?: string;
  date_to?: string;
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  const validated = CreateTransactionSchema.safeParse(input);
  if (!validated.success) {
    throw new Error("Invalid transaction payload");
  }
  const response = await http.post<{ data?: Transaction; transaction?: Transaction } | Transaction>(
    "/transactions",
    validated.data
  );
  
  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response && response.data) {
    return response.data as Transaction;
  }
  
  // Handle transaction key wrapper
  if (response && typeof response === "object" && "transaction" in response && response.transaction) {
    return response.transaction as Transaction;
  }
  
  // Direct response
  return response as Transaction;
}

export async function listTransactionsPaginated(params?: TransactionListParams): Promise<PaginatedResponse<Transaction>> {
  const qs = new URLSearchParams();
  if (params?.page !== undefined) qs.set("page", String(params.page));
  if (params?.per_page !== undefined) qs.set("per_page", String(params.per_page));
  if (params?.type) qs.set("type", params.type);
  if (params?.payment_mode) qs.set("payment_mode", params.payment_mode);
  if (params?.payment_status) qs.set("payment_status", params.payment_status);
  if (params?.collected_by !== undefined) qs.set("collected_by", String(params.collected_by));
  if (params?.added_by !== undefined) qs.set("added_by", String(params.added_by));
  if (params?.date_from) qs.set("date_from", params.date_from);
  if (params?.date_to) qs.set("date_to", params.date_to);
  const query = qs.toString();
  const path = query ? `/transactions?${query}` : "/transactions";
  const response = await http.get<Transaction[] | PaginatedResponse<Transaction>>(path);
  
  if (Array.isArray(response)) {
    return { data: response };
  }
  
  if (response && typeof response === "object" && Array.isArray(response.data)) {
    return response;
  }
  
  return { data: [] };
}

export async function getOrderTransactions(orderId: number): Promise<Transaction[]> {
  const response = await http.get<{ data?: Transaction[] } | Transaction[]>(`/orders/${orderId}/transactions`);
  
  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response && Array.isArray(response.data)) {
    return response.data;
  }
  
  // Handle direct array
  if (Array.isArray(response)) {
    return response;
  }
  
  return [];
}

export async function updateTransaction(id: number, input: UpdateTransactionInput): Promise<Transaction> {
  const validated = UpdateTransactionSchema.safeParse(input);
  if (!validated.success) {
    throw new Error("Invalid transaction payload");
  }
  const response = await http.put<{ data?: Transaction; transaction?: Transaction } | Transaction>(
    `/transactions/${id}`,
    validated.data
  );
  
  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response && response.data) {
    return response.data as Transaction;
  }
  
  // Handle transaction key wrapper
  if (response && typeof response === "object" && "transaction" in response && response.transaction) {
    return response.transaction as Transaction;
  }
  
  // Direct response
  return response as Transaction;
}

export async function deleteTransaction(id: number): Promise<void> {
  await http.del(`/transactions/${id}`);
}

