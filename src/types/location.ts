import { z } from "zod";

export const LocationSchema = z.object({
  id: z.number(),
  name: z.string().min(1, { message: "Name is required" }),
  code: z
    .string()
    .min(1, { message: "Code is required" })
    .regex(/^[A-Za-z0-9-]+$/, { message: "Code must be alphanumeric" })
    .optional(),
  address: z.string().min(1, { message: "Address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().max(100).nullable().optional(),
  postal_code: z
    .string()
    .max(20, { message: "Postal code is too long" })
    .nullable()
    .optional(),
  country: z.string().min(1, { message: "Country is required" }).nullable().optional(),
  latitude: z.string().nullable().optional(),
  longitude: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  phone: z
    .string()
    .min(7, { message: "Phone must be at least 7 digits" })
    .max(30, { message: "Phone is too long" })
    .regex(/^\+?[0-9\s\-()]+$/, { message: "Phone must be numeric" })
    .nullable()
    .optional(),
  is_active: z.boolean(),
  users_count: z.number().optional(),
  delivery_boys_count: z.number().optional(),
  orders_count: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// For creation: Phone and State are not required; require code (postal_code optional)
export const CreateLocationSchema = LocationSchema
  .omit({ id: true, users_count: true, delivery_boys_count: true, orders_count: true, created_at: true, updated_at: true })
  .extend({
    state: z.string().optional(),
    postal_code: z.string().max(20, { message: "Postal code is too long" }).optional(),
    code: z
      .string()
      .min(1, { message: "Code is required" })
      .regex(/^[A-Za-z0-9-]+$/, { message: "Code must be alphanumeric" }),
  });
export const UpdateLocationSchema = CreateLocationSchema.partial();

export type Location = z.infer<typeof LocationSchema>;
export type CreateLocationInput = z.infer<typeof CreateLocationSchema>;
export type UpdateLocationInput = z.infer<typeof UpdateLocationSchema>;