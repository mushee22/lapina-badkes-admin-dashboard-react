import { z } from "zod";

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().nullable().optional(),
  is_active: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const CreateCategorySchema = CategorySchema.omit({ id: true, created_at: true, updated_at: true });
export const UpdateCategorySchema = CreateCategorySchema.partial();

export type Category = z.infer<typeof CategorySchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

