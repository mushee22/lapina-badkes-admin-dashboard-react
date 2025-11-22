import { z } from "zod";

export const StoreLocationSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().optional(),
});

export const StoreOwnerSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
});

export const StoreSettingsSchema = z.object({
  min_order_amount: z.number().optional(),
  delivery_fee: z.number().optional(),
});

export const StoreDiscountSchema = z.object({
  percentage: z.number().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  has_active_discount: z.boolean().optional(),
  current_percentage: z.number().optional(),
});

export const StoreSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  is_active: z.boolean(),
  status: z.string().nullable().optional(),
  status_label: z.string().optional(),
  discount: StoreDiscountSchema.nullable().optional(),
  logo: z.string().nullable().optional(),
  settings: StoreSettingsSchema.nullable().optional(),
  location: StoreLocationSchema.nullable().optional(),
  owner: StoreOwnerSchema.nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Form input schema (flat structure for easier form handling)
export const CreateStoreSchema = z.object({
  store_name: z.string().min(1, "Store name is required"),
  store_description: z.string().nullable().optional(),
  store_phone: z.string().nullable().optional(),
  store_address: z.string().nullable().optional(),
  store_email: z.string().nullable().optional(),
  store_website: z.string().nullable().optional(),
  location_id: z.number().nullable().optional(),
  owner_name: z.string().nullable().optional(),
  owner_email: z.string().nullable().optional(),
  owner_phone: z.string().nullable().optional(),
  owner_password: z.string().nullable().optional(),
  is_active: z.boolean(),
  discount_percentage: z.number().nullable().optional(),
  discount_start_date: z.string().nullable().optional(),
  discount_end_date: z.string().nullable().optional(),
  discount_description: z.string().nullable().optional(),
  discount_is_active: z.boolean().nullable().optional(),
  settings: StoreSettingsSchema.nullable().optional(),
});
export const UpdateStoreSchema = CreateStoreSchema.partial();

export const UpdateStoreStatusSchema = z.object({
  status: z.string(),
});

export const SetStoreDiscountSchema = z.object({
  discount_percentage: z.number(),
  discount_start_date: z.string(),
  discount_end_date: z.string(),
  discount_description: z.string().optional(),
});

export type Store = z.infer<typeof StoreSchema>;
export type StoreLocation = z.infer<typeof StoreLocationSchema>;
export type StoreOwner = z.infer<typeof StoreOwnerSchema>;
export type CreateStoreInput = z.infer<typeof CreateStoreSchema>;
export type UpdateStoreInput = z.infer<typeof UpdateStoreSchema>;
export type UpdateStoreStatusInput = z.infer<typeof UpdateStoreStatusSchema>;
export type SetStoreDiscountInput = z.infer<typeof SetStoreDiscountSchema>;
export type StoreSettings = z.infer<typeof StoreSettingsSchema>;
export type StoreDiscount = z.infer<typeof StoreDiscountSchema>;

