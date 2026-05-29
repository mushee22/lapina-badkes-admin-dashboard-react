import { z } from "zod";
import { RouteSchema } from "./route";

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

export const StoreProductSchema = z.object({
  product_id: z.number(),
  product_name: z.string(),
  product_slug: z.string().optional(),
  price: z.number(),
  discount_percentage: z.number(),
  selling_price: z.number(),
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
  gst_number: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  status_label: z.string().optional(),
  discount: StoreDiscountSchema.nullable().optional(),
  logo: z.string().nullable().optional(),
  settings: StoreSettingsSchema.nullable().optional(),
  location: StoreLocationSchema.nullable().optional(),
  route: RouteSchema.nullable().optional(),
  owner: StoreOwnerSchema.nullable().optional(),
  store_products: z.array(StoreProductSchema).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Form input schema (flat structure for easier form handling)
export const CreateStoreSchema = z.object({
  store_name: z.string().min(1, "Store name is required"),
  store_description: z.string().nullable().optional(),
  store_phone: z.string().min(1, "Store phone is required"),
  store_address: z.string().min(1, "Store address is required"),
  store_email: z.string().nullable().optional(),
  gst_number: z.string().nullable().optional(),
  store_website: z.string().nullable().optional(),
  location_id: z.number().nullable().optional(),
  route_id: z.number().nullable().optional(),
  owner_name: z.string().min(1, "Owner name is required"),
  owner_email: z.string().nullable().optional(),
  owner_phone: z.string().min(1, "Owner phone is required"),
  owner_password: z.string().min(1, "Owner password is required"),
  is_active: z.boolean(),
  discount_percentage: z.number().nullable().optional(),
  discount_start_date: z.string().nullable().optional(),
  discount_end_date: z.string().nullable().optional(),
  discount_description: z.string().nullable().optional(),
  discount_is_active: z.boolean().nullable().optional(),
  settings: StoreSettingsSchema.nullable().optional(),
});
export const UpdateStoreSchema = CreateStoreSchema.partial().extend({
  store_name: z.string().min(1, "Store name is required"),
  store_phone: z.string().min(1, "Store phone is required"),
  store_address: z.string().min(1, "Store address is required"),
  owner_name: z.string().min(1, "Owner name is required"),
  owner_phone: z.string().min(1, "Owner phone is required"),
  owner_password: z.string().optional(),
});

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
export type StoreProduct = z.infer<typeof StoreProductSchema>;

export interface StoreUserOwner {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  roles: string[];
  plain_password: string | null;
}

export interface StoreUser {
  store_id: number;
  store_name: string;
  store_slug: string;
  store_status: string;
  store_is_active: boolean;
  location: {
    id: number;
    name: string;
    code: string;
  } | null;
  route: any | null;
  owner: StoreUserOwner;
}

export interface StoreUsersResponse {
  store_id: number;
  store_name: string;
  users: StoreUserOwner[];
}

export interface StoreUserListParams {
  page?: number;
  per_page?: number;
  location_id?: number;
  search?: string;
}

