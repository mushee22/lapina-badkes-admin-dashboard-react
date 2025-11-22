import { z } from "zod";
import { Roles } from "../constants/roles";

export interface DeliveryBoyLocation {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  description?: string | null;
  is_active: boolean;
  is_primary: number;
  assigned_at: string;
}

export interface PrimaryLocation {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  state?: string | null;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions?: string[];
  phone?: string;
  address?: string;
  is_active?: number;
  locations?: DeliveryBoyLocation[];
  primary_location?: PrimaryLocation | null;
  locations_count?: number;
  created_at: string;
  updated_at: string;
}

// Type for creating/updating admin users (includes fields not in API response)
export interface AdminUserInput {
  name: string;
  email: string;
  roles?: string[];
  phone?: string;
  address?: string;
  password?: string;
  active?: boolean;
}

// Zod validation schemas
const RoleSchema = z.union([
  z.literal(Roles.Admin),
  z.literal(Roles.DeliveryBoy),
  z.literal(Roles.StoreOwner),
]);

export const AdminUserSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
  roles: z.array(RoleSchema),
  permissions: z.array(z.string()),
  phone: z.string().optional(),
  address: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const AdminUserCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: RoleSchema.default(Roles.Admin),
  active: z.boolean().optional(),
});

export type AdminUserModel = z.infer<typeof AdminUserSchema>;
export type AdminUserCreateInput = z.infer<typeof AdminUserCreateSchema>;