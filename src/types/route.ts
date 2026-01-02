import { z } from "zod";

export const RouteSchema = z.object({
    id: z.number(),
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),
    description: z.string().nullable().optional(),
    is_active: z.boolean().optional().default(true),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
});

export const CreateRouteSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),
    description: z.string().nullable().optional(),
    is_active: z.boolean().optional(),
});

export const UpdateRouteSchema = CreateRouteSchema.partial();

export type Route = z.infer<typeof RouteSchema>;
export type CreateRouteInput = z.infer<typeof CreateRouteSchema>;
export type UpdateRouteInput = z.infer<typeof UpdateRouteSchema>;
