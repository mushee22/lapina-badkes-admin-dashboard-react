import { z } from "zod";

export const CreateTransactionSchema = z.object({
  transactionable_type: z.literal("order"),
  transactionable_id: z.number().min(1, "Order ID is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  payment_mode: z.string().min(1, "Payment mode is required"),
  payment_note: z.string().nullable().optional(),
  payment_discount: z.number().min(0).optional(),
  collected_by: z.number().min(1).optional(),
  transaction_date: z.string().min(1, "Transaction date is required"),
});

export const UpdateTransactionSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  payment_mode: z.string().min(1, "Payment mode is required"),
  payment_note: z.string().nullable().optional(),
  payment_discount: z.number().min(0).optional(),
  collected_by: z.number().min(1).optional(),
  transaction_date: z.string().min(1, "Transaction date is required"),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;

