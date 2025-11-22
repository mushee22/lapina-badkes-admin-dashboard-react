
import { useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldErrors } from "react-hook-form";
import Label from "../../../components/form/Label";
import InputField from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Switch from "../../../components/form/switch/Switch";
import Autocomplete from "../../../components/form/Autocomplete";
import Button from "../../../components/ui/button/Button";
import { CreateStoreSchema } from "../../../types/store";
import type { CreateStoreInput } from "../../../types/store";
import type { Location } from "../../../types/location";
import { ChevronLeftIcon } from "../../../icons";

interface StoreFormProps {
  initialValues?: Partial<CreateStoreInput>;
  onSubmit: (values: CreateStoreInput) => void | Promise<void>;
  submitLabel?: string;
  locations: Location[];
  isLoading?: boolean;
}

export default function StoreForm({
  initialValues,
  onSubmit,
  submitLabel = "Save",
  locations,
  isLoading = false,
}: StoreFormProps) {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateStoreInput>({
    resolver: zodResolver(CreateStoreSchema),
    defaultValues: initialValues || {
      store_name: "",
      store_description: "",
      store_phone: "",
      store_address: "",
      store_email: "",
      store_website: "",
      location_id: undefined,
      owner_name: "",
      owner_email: "",
      owner_phone: "",
      owner_password: "",
      is_active: true,
      discount_percentage: undefined,
      discount_start_date: undefined,
      discount_end_date: undefined,
      discount_description: undefined,
      discount_is_active: false,
      settings: {
        min_order_amount: undefined,
        delivery_fee: undefined,
      },
    },
  });

  const formSubmit = handleSubmit(
    async (data) => {
      await onSubmit(data);
    },
    (formErrors: FieldErrors<CreateStoreInput>) => {
      console.error("Store form validation errors:", formErrors);
    },
  );

  return (
    <form className="space-y-6" onSubmit={formSubmit}>
      <div className="flex items-center gap-3 mb-4">
        <Button variant="outline" size="sm" type="button" onClick={() => navigate("/stores")} startIcon={<ChevronLeftIcon className="w-4 h-4" />}>
          Back to Stores
        </Button>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Basic Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="store_name">
              Store Name <span className="text-error-500">*</span>
            </Label>
            <InputField
              id="store_name"
              placeholder="Store name"
              {...register("store_name")}
              error={!!errors.store_name}
              hint={errors.store_name?.message}
            />
          </div>
          <div>
            <Label htmlFor="location_id">Location</Label>
            <Controller
              name="location_id"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={locations.map((loc) => ({ value: String(loc.id), label: loc.name }))}
                  placeholder="Select Location"
                  value={field.value ? String(field.value) : ""}
                  onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                />
              )}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="store_description">Description</Label>
          <Controller
            name="store_description"
            control={control}
            render={({ field }) => (
              <TextArea
                placeholder="Store description"
                value={field.value || ""}
                onChange={field.onChange}
                error={!!errors.store_description}
                hint={errors.store_description?.message}
                rows={3}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="store_phone">Phone</Label>
            <InputField
              id="store_phone"
              placeholder="+1234567890"
              {...register("store_phone")}
              error={!!errors.store_phone}
              hint={errors.store_phone?.message}
            />
          </div>
          <div>
            <Label htmlFor="store_email">Email</Label>
            <InputField
              id="store_email"
              type="email"
              placeholder="store@example.com"
              {...register("store_email")}
              error={!!errors.store_email}
              hint={errors.store_email?.message}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="store_address">Address</Label>
          <InputField
            id="store_address"
            placeholder="Store address"
            {...register("store_address")}
            error={!!errors.store_address}
            hint={errors.store_address?.message}
          />
        </div>

        <div>
          <Label htmlFor="store_website">Website</Label>
          <InputField
            id="store_website"
            type="url"
            placeholder="https://example.com"
            {...register("store_website")}
            error={!!errors.store_website}
            hint={errors.store_website?.message}
          />
        </div>
      </div>

      {/* Owner Information */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Owner Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="owner_name">Owner Name</Label>
            <InputField
              id="owner_name"
              placeholder="Owner name"
              {...register("owner_name")}
              error={!!errors.owner_name}
              hint={errors.owner_name?.message}
            />
          </div>
          <div>
            <Label htmlFor="owner_email">Owner Email</Label>
            <InputField
              id="owner_email"
              type="email"
              placeholder="owner@example.com"
              {...register("owner_email")}
              error={!!errors.owner_email}
              hint={errors.owner_email?.message}
            />
          </div>
          <div>
            <Label htmlFor="owner_phone">Owner Phone</Label>
            <InputField
              id="owner_phone"
              placeholder="+1234567890"
              {...register("owner_phone")}
              error={!!errors.owner_phone}
              hint={errors.owner_phone?.message}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="owner_password">Owner Password</Label>
          <InputField
            id="owner_password"
            type="password"
            placeholder="Enter owner password"
            {...register("owner_password")}
            error={!!errors.owner_password}
            hint={errors.owner_password?.message}
          />
        </div>
      </div>

      {/* Settings */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Store Settings</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="min_order_amount">Min Order Amount</Label>
            <Controller
              name="settings.min_order_amount"
              control={control}
              render={({ field }) => (
                <InputField
                  id="min_order_amount"
                  type="number"
                  step="0.01"
                  placeholder="30.00"
                  value={field.value ? String(field.value) : ""}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
            />
          </div>
          <div>
            <Label htmlFor="delivery_fee">Delivery Fee</Label>
            <Controller
              name="settings.delivery_fee"
              control={control}
              render={({ field }) => (
                <InputField
                  id="delivery_fee"
                  type="number"
                  step="0.01"
                  placeholder="5.00"
                  value={field.value ? String(field.value) : ""}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Status</h3>
        <div>
          <Label htmlFor="is_active">Active</Label>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Switch
                label=""
                checked={field.value ?? true}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center gap-3 justify-end border-t border-gray-200 dark:border-gray-700 pt-6">
        <Button variant="outline" type="button" onClick={() => navigate("/stores")} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

