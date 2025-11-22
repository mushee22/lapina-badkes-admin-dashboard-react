import { z } from "zod";
import { CategorySchema } from "./category";

export const ProductCategorySchema = CategorySchema;

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  price: z.string(),
  selling_price: z.string(),
  market_price: z.string(),
  effective_selling_price: z.number().optional(),
  effective_market_price: z.number().optional(),
  is_on_sale: z.boolean().optional(),
  discount_percentage: z.number().nullable().optional(),
  savings_amount: z.number().nullable().optional(),
  category_id: z.number(),
  category: ProductCategorySchema.nullable().optional(),
  image: z.string().nullable().optional(),
  main_image_url: z.string().nullable().optional(),
  image_urls: z.array(z.string()).optional(),
  stock: z.number(),
  is_available: z.boolean(),
  gst: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Form input schema for create
export const CreateProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().nullable().optional(),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  selling_price: z.number().min(0, "Selling price must be greater than or equal to 0"),
  market_price: z.number().min(0, "Market price must be greater than or equal to 0").optional(),
  category_id: z.number().min(1, "Category is required"),
  stock: z.number().min(0, "Stock must be greater than or equal to 0"),
  is_available: z.boolean(),
  gst: z.number().min(0).max(100).optional(),
  primary_image_index: z.number().optional(),
}).refine((data) => data.selling_price <= data.price, {
  message: "Selling price must be less than or equal to price",
  path: ["selling_price"],
});

// Form input schema for update
export const UpdateProductSchema = z.object({
  name: z.string().min(1, "Product name is required").optional(),
  description: z.string().nullable().optional(),
  price: z.number().min(0, "Price must be greater than or equal to 0").optional(),
  selling_price: z.number().min(0, "Selling price must be greater than or equal to 0").optional(),
  market_price: z.number().min(0, "Market price must be greater than or equal to 0").optional(),
  stock: z.number().min(0, "Stock must be greater than or equal to 0").optional(),
  is_available: z.boolean().optional(),
  gst: z.number().min(0).max(100).optional(),
}).refine((data) => {
  // Only validate if both price and selling_price are provided
  if (data.price !== undefined && data.selling_price !== undefined) {
    return data.selling_price <= data.price;
  }
  return true;
}, {
  message: "Selling price must be less than or equal to price",
  path: ["selling_price"],
});

export const ProductImageSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  image_url: z.string(),
  image_path: z.string(),
  original_name: z.string(),
  mime_type: z.string(),
  file_size: z.number(),
  sort_order: z.number(),
  is_primary: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ProductImagesResponseSchema = z.object({
  images: z.array(ProductImageSchema),
});

export type Product = z.infer<typeof ProductSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductCategory = z.infer<typeof ProductCategorySchema>;
export type ProductImage = z.infer<typeof ProductImageSchema>;
export type ProductImagesResponse = z.infer<typeof ProductImagesResponseSchema>;
