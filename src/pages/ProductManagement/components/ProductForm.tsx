import { useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldErrors } from "react-hook-form";
import Label from "../../../components/form/Label";
import InputField from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Switch from "../../../components/form/switch/Switch";
import Autocomplete from "../../../components/form/Autocomplete";
import Radio from "../../../components/form/input/Radio";
import Button from "../../../components/ui/button/Button";
import { CreateProductSchema } from "../../../types/product";
import type { CreateProductInput } from "../../../types/product";
import type { Category } from "../../../types/category";
import { ChevronLeftIcon } from "../../../icons";

interface ProductFormProps {
  initialValues?: Partial<CreateProductInput>;
  onSubmit: (values: CreateProductInput) => void | Promise<void>;
  submitLabel?: string;
  categories: Category[];
  isLoading?: boolean;
}

export default function ProductForm({
  initialValues,
  onSubmit,
  submitLabel = "Save",
  categories,
  isLoading = false,
}: ProductFormProps) {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: initialValues || {
      name: "",
      description: "",
      price: 0,
      selling_price: 0,
      category_id: undefined,
      stock: 0,
      is_available: true,
      gst: 0,
      primary_image_index: undefined,
    },
  });

  const formSubmit = handleSubmit(
    async (data) => {
      // Ensure gst is always a number (0, 5, or 18)
      const submitData = {
        ...data,
        gst: data.gst ?? 0,
      };
      await onSubmit(submitData);
    },
    (formErrors: FieldErrors<CreateProductInput>) => {
      console.error("Product form validation errors:", formErrors);
    },
  );

  return (
    <form className="space-y-6" onSubmit={formSubmit}>
      <div className="flex items-center gap-3 mb-4">
        <Button variant="outline" size="sm" type="button" onClick={() => navigate("/products")} startIcon={<ChevronLeftIcon className="w-4 h-4" />}>
          Back to Products
        </Button>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Basic Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">
              Product Name <span className="text-error-500">*</span>
            </Label>
            <InputField
              id="name"
              placeholder="Product name"
              {...register("name")}
              error={!!errors.name}
              hint={errors.name?.message}
            />
          </div>
          <div>
            <Label htmlFor="category_id">
              Category <span className="text-error-500">*</span>
            </Label>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={categories.map((cat) => ({ value: String(cat.id), label: cat.name }))}
                  placeholder="Select Category"
                  value={field.value ? String(field.value) : ""}
                  onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                />
              )}
            />
            {errors.category_id && (
              <p className="mt-1.5 text-xs text-error-500">{errors.category_id.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextArea
                placeholder="Product description"
                rows={4}
                value={field.value || ""}
                onChange={field.onChange}
                error={!!errors.description}
                hint={errors.description?.message}
              />
            )}
          />
        </div>
      </div>

      {/* Pricing Information */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Pricing Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="price">
              Price <span className="text-error-500">*</span>
            </Label>
            <InputField
              id="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("price", { valueAsNumber: true })}
              error={!!errors.price}
              hint={errors.price?.message}
            />
          </div>
          <div>
            <Label htmlFor="selling_price">
              Selling Price <span className="text-error-500">*</span>
            </Label>
            <InputField
              id="selling_price"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("selling_price", { valueAsNumber: true })}
              error={!!errors.selling_price}
              hint={errors.selling_price?.message}
            />
          </div>
          <div>
            <Label htmlFor="gst">
              GST Slab
            </Label>
            <Controller
              name="gst"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <Radio
                    id="gst-0"
                    name="gst"
                    value="0"
                    checked={field.value === 0}
                    onChange={(value) => field.onChange(Number(value))}
                    label="No GST"
                  />
                  <Radio
                    id="gst-5"
                    name="gst"
                    value="5"
                    checked={field.value === 5}
                    onChange={(value) => field.onChange(Number(value))}
                    label="5%"
                  />
                  <Radio
                    id="gst-18"
                    name="gst"
                    value="18"
                    checked={field.value === 18}
                    onChange={(value) => field.onChange(Number(value))}
                    label="18%"
                  />
                </div>
              )}
            />
            {errors.gst && (
              <p className="mt-1.5 text-xs text-error-500">{errors.gst.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stock & Availability */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Stock & Availability</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="stock">
              Stock <span className="text-error-500">*</span>
            </Label>
            <InputField
              id="stock"
              type="number"
              placeholder="0"
              {...register("stock", { valueAsNumber: true })}
              error={!!errors.stock}
              hint={errors.stock?.message}
            />
          </div>
          <div>
            <Label htmlFor="is_available">Availability</Label>
            <Controller
              name="is_available"
              control={control}
              render={({ field }) => (
                <Switch
                  label={field.value ? "Available" : "Unavailable"}
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center gap-3 justify-end border-t border-gray-200 dark:border-gray-700 pt-6">
        <Button variant="outline" type="button" onClick={() => navigate("/products")} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
