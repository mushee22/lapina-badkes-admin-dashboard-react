import { z } from "zod";

// Order User Schema (simplified user object in order)
export const OrderUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  is_active: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Order Item Product Schema (simplified product object in order item)
export const OrderItemProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  price: z.string(),
  selling_price: z.string(),
  effective_selling_price: z.number().optional(),
  is_on_sale: z.boolean().optional(),
  discount_percentage: z.number().nullable().optional(),
  savings_amount: z.number().nullable().optional(),
  category_id: z.number().optional(),
  image: z.string().nullable().optional(),
  main_image_url: z.string().nullable().optional(),
  image_urls: z.array(z.string()).optional(),
  stock: z.number().optional(),
  is_available: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Order Item Schema
export const OrderItemSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  product_id: z.number(),
  product: OrderItemProductSchema,
  quantity: z.number(),
  price: z.string(),
  gst_percentage: z.number().nullable().optional(),
  gst_amount: z.number().nullable().optional(),
  subtotal: z.number(),
  subtotal_with_gst: z.number().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Delivery Boy Schema
export const OrderDeliveryBoySchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  is_active: z.number().optional(),
  roles: z.array(z.string()).optional(),
  locations: z.array(z.any()).optional(),
  primary_location: z.object({
    id: z.number(),
    name: z.string(),
    code: z.string(),
  }).nullable().optional(),
});

// Order Audit User Schema
export const OrderAuditUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  roles: z.array(z.string()),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  user_type: z.string().optional(), // 'admin', 'delivery_boy', 'store_owner' etc. - helpful for UI
});

// Order Audit Schema
export const OrderAuditSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  user_id: z.number(),
  action: z.string(),
  field: z.string().nullable().optional(),
  old_value: z.string().nullable().optional(),
  new_value: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
  user: OrderAuditUserSchema.optional(),
  created_at: z.string(),
  updated_at: z.string(),
  time_ago: z.string().optional(),
});

// Invoice Item Schema
export const InvoiceItemSchema = z.object({
  quantity: z.number(),
  unit_price: z.string(),
  total_price: z.number(),
  product_name: z.string(),
});

// Invoice Billing Details Schema
export const InvoiceBillingDetailsSchema = z.object({
  phone: z.string().nullable().optional(),
  customer_name: z.string().nullable().optional(),
  customer_email: z.string().nullable().optional(),
  customer_phone: z.string().nullable().optional(),
  delivery_address: z.string().nullable().optional(),
  customer_gst: z.string().nullable().optional(),
});

// Invoice Schema
export const InvoiceSchema: z.ZodType<any> = z.object({
  id: z.number(),
  invoice_number: z.string(),
  formatted_invoice_number: z.string().nullable().optional(),
  invoice_date: z.string(),
  due_date: z.string().nullable().optional(),
  subtotal: z.number(),
  discount_amount: z.number(),
  tax_amount: z.number(),
  total_amount: z.number(),
  status: z.string(),
  status_label: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  billing_details: InvoiceBillingDetailsSchema.nullable().optional(),
  items: z.array(InvoiceItemSchema),
  pdf_path: z.string().nullable().optional(),
  is_overdue: z.boolean().optional(),
  order_id: z.number().optional(),
  order: z.lazy((): z.ZodType<any> => OrderSchema).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Order Schema
export const OrderSchema: z.ZodType<any> = z.object({
  id: z.number(),
  user_id: z.number(),
  user: OrderUserSchema,
  store_id: z.number().optional(),
  store: z.any().optional(),
  location_id: z.number().optional(),
  location: z.any().optional(),
  order_number: z.string(),
  total_amount: z.string(),
  subtotal_amount: z.string().nullable().optional(),
  total_gst_amount: z.string().nullable().optional(),
  discount_percentage: z.number().nullable().optional(),
  discount_amount: z.number().nullable().optional(),
  discount_description: z.string().nullable().optional(),
  total_paid_amount: z.number().nullable().optional(),
  payment_status: z.string().nullable().optional(),
  status: z.string(),
  delivery_boy_id: z.number().nullable().optional(),
  delivery_boy: OrderDeliveryBoySchema.nullable().optional(),
  delivery_address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  has_invoice: z.boolean().optional(),
  order_items: z.array(OrderItemSchema),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  audits: z.array(OrderAuditSchema).optional(),
  invoice: InvoiceSchema.nullable().optional(),
});

export const UpdateOrderSchema = z.object({
  status: z.string().min(1, "Status is required").optional(),
  delivery_boy_id: z.number().optional(),
  delivery_address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  discount_amount: z.number().nullable().optional(),
  discount_description: z.string().nullable().optional(),
});

export const UpdateInvoiceSchema = z.object({
  invoice_number: z.string().min(1, "Invoice number is required"),
  status: z.string().min(1, "Status is required"),
  notes: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  subtotal: z.number(),
  discount_amount: z.number(),
  tax_amount: z.number(),
  total_amount: z.number(),
});

export const ManualOrderItemSchema = z.object({
  product_id: z.number().min(1, "Product is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export const CreateManualOrderSchema = z.object({
  customer_id: z.number().min(1, "Store owner is required"),
  items: z.array(ManualOrderItemSchema).min(1, "At least one item is required"),
  phone: z.string().min(1, "Phone number is required"),
  status: z.string().min(1, "Status is required"),
  notes: z.string().nullable().optional(),
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderUser = z.infer<typeof OrderUserSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type OrderAudit = z.infer<typeof OrderAuditSchema>;
export type OrderAuditUser = z.infer<typeof OrderAuditUserSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;
export type OrderItemProduct = z.infer<typeof OrderItemProductSchema>;
export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;
export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>;
export type ManualOrderItem = z.infer<typeof ManualOrderItemSchema>;
export type CreateManualOrderInput = z.infer<typeof CreateManualOrderSchema>;

export const ReturnOrderItemSchema = z.object({
  order_item_id: z.number(),
  returned_quantity: z.number(),
  defective_quantity: z.number(),
  restocking_quantity: z.number(),
  reason: z.string(),
});

export const ReturnOrderSchema = z.object({
  items: z.array(ReturnOrderItemSchema),
  reason: z.string().optional(),
});

export type ReturnOrderItem = z.infer<typeof ReturnOrderItemSchema>;
export type ReturnOrderInput = z.infer<typeof ReturnOrderSchema>;

export const ReturnOrderDetailsSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  order_item_id: z.number(),
  product_id: z.number(),
  returned_quantity: z.number(),
  defective_quantity: z.number(),
  restocking_quantity: z.number(),
  reason: z.string().nullable(),
  status: z.string(),
  processed_by: z.number().nullable(),
  processed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  order_item: OrderItemSchema.optional(),
});

export const OrderReturnsResponseSchema = z.object({
  order: OrderSchema,
  returns: z.array(ReturnOrderDetailsSchema),
  summary: z.object({
    total_returns: z.number(),
    pending: z.number(),
    processed: z.number(),
    cancelled: z.number(),
  }),
});

export type ReturnOrderDetails = z.infer<typeof ReturnOrderDetailsSchema>;
export type OrderReturnsResponse = z.infer<typeof OrderReturnsResponseSchema>;



