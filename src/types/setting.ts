import { z } from "zod";

export type SettingType = "text" | "image";

export const SettingSchema = z.object({
  id: z.number(),
  key: z.string(),
  value: z.string().nullable(),
  type: z.enum(["text", "image"]),
  description: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Setting = z.infer<typeof SettingSchema>;

export interface UpdateSettingInput {
  id?: number;
  key: string;
  value: string | File | null;
  type: SettingType;
  description?: string | null;
}

export interface CreateSettingInput {
  key: string;
  value: string | File | null;
  type: SettingType;
  description?: string | null;
}

