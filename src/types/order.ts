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

// Order Schema
export const OrderSchema = z.object({
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
});

export const UpdateOrderSchema = z.object({
  status: z.string().min(1, "Status is required").optional(),
  delivery_boy_id: z.number().optional(),
  notes: z.string().nullable().optional(),
});

export const ManualOrderItemSchema = z.object({
  product_id: z.number().min(1, "Product is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export const CreateManualOrderSchema = z.object({
  customer_id: z.number().min(1, "Customer is required"),
  delivery_boy_id: z.number().optional(),
  items: z.array(ManualOrderItemSchema).min(1, "At least one item is required"),
  phone: z.string().nullable().optional(),
  status: z.string().min(1, "Status is required"),
  notes: z.string().nullable().optional(),
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderUser = z.infer<typeof OrderUserSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type OrderItemProduct = z.infer<typeof OrderItemProductSchema>;
export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;
export type ManualOrderItem = z.infer<typeof ManualOrderItemSchema>;
export type CreateManualOrderInput = z.infer<typeof CreateManualOrderSchema>;

