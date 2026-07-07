
import { useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldErrors } from "react-hook-form";
import { useEffect } from "react";
import Label from "../../../components/form/Label";
import InputField from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Switch from "../../../components/form/switch/Switch";
import Autocomplete from "../../../components/form/Autocomplete";
import Button from "../../../components/ui/button/Button";
import { CreateStoreSchema, UpdateStoreSchema } from "../../../types/store";
import type { CreateStoreInput, UpdateStoreInput } from "../../../types/store";
import type { Location } from "../../../types/location";

import { ChevronLeftIcon } from "../../../icons";
import { useToast } from "../../../context/ToastContext";

interface StoreFormProps {
  initialValues?: Partial<CreateStoreInput>;
  onSubmit: (values: CreateStoreInput | UpdateStoreInput) => void | Promise<void>;
  submitLabel?: string;
  locations: Location[];
  onLocationSearch?: (value: string) => void;

  isLoading?: boolean;
  isEdit?: boolean;
}

export default function StoreForm({
  initialValues,
  onSubmit,
  submitLabel = "Save",
  locations,
  onLocationSearch,

  isLoading = false,
  isEdit = false,
}: StoreFormProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, touchedFields },
  } = useForm<CreateStoreInput | UpdateStoreInput>({
    resolver: zodResolver(isEdit ? UpdateStoreSchema : CreateStoreSchema),
    defaultValues: initialValues || {
      store_name: "",
      store_description: "",
      store_phone: "",
      store_address: "",
      store_email: "",
      store_website: "",
      location_id: undefined,
      route_id: undefined,
      owner_name: "",
      owner_email: "",
      owner_phone: "",
      owner_password: "",
      is_active: true,
      gst_number: "",
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

  const storeName = watch("store_name");
  const storePhone = watch("store_phone");
  const storeEmail = watch("store_email");

  const isAddressTouched = !!touchedFields.store_address;
  const isOwnerTouched = !!touchedFields.owner_name;
  const isPhoneTouched = !!touchedFields.owner_phone;
  const isOwnerEmailTouched = !!touchedFields.owner_email;

  // Prefill store_address and owner_name with the value of store_name
  useEffect(() => {
    if (!storeName) return;

    if (!isAddressTouched) {
      setValue("store_address", storeName, { shouldValidate: true });
    }
    if (!isOwnerTouched) {
      setValue("owner_name", storeName, { shouldValidate: true });
    }
  }, [storeName, isAddressTouched, isOwnerTouched, setValue]);

  // Prefill store_phone to owner_phone
  useEffect(() => {
    if (!isPhoneTouched && storePhone) {
      setValue("owner_phone", storePhone, { shouldValidate: true });
    }
  }, [storePhone, isPhoneTouched, setValue]);

  // Prefill store_email to owner_email
  useEffect(() => {
    if (!isOwnerEmailTouched && storeEmail) {
      setValue("owner_email", storeEmail, { shouldValidate: true });
    }
  }, [storeEmail, isOwnerEmailTouched, setValue]);

  // Reset form when initialValues change
  useEffect(() => {
    if (initialValues) {
      // Ensure settings is an object, not an array
      const cleanedInitialValues = { ...initialValues };
      if (cleanedInitialValues.settings) {
        if (Array.isArray(cleanedInitialValues.settings)) {
          cleanedInitialValues.settings = undefined;
        } else if (typeof cleanedInitialValues.settings === 'object') {
          // Ensure it's a proper object
          const settings = cleanedInitialValues.settings as { min_order_amount?: number; delivery_fee?: number };
          cleanedInitialValues.settings = {
            min_order_amount: settings.min_order_amount,
            delivery_fee: settings.delivery_fee,
          };
        }
      }
      reset(cleanedInitialValues);
    }
  }, [initialValues, reset]);

  // Clean up form data before submission - remove undefined values from nested objects
  const cleanFormData = (data: CreateStoreInput | UpdateStoreInput): CreateStoreInput | UpdateStoreInput => {
    const cleaned = { ...data };

    // Clean settings object - ensure it's an object, not an array
    if (cleaned.settings) {
      // If settings is an array, convert to object or remove
      if (Array.isArray(cleaned.settings)) {
        delete cleaned.settings;
      } else if (typeof cleaned.settings === 'object') {
        const hasSettings = cleaned.settings.min_order_amount !== undefined || cleaned.settings.delivery_fee !== undefined;
        if (!hasSettings) {
          delete cleaned.settings;
        } else {
          // Remove undefined values from settings
          const cleanedSettings: { min_order_amount?: number; delivery_fee?: number } = {};
          if (cleaned.settings.min_order_amount !== undefined && cleaned.settings.min_order_amount !== null) {
            cleanedSettings.min_order_amount = Number(cleaned.settings.min_order_amount);
          }
          if (cleaned.settings.delivery_fee !== undefined && cleaned.settings.delivery_fee !== null) {
            cleanedSettings.delivery_fee = Number(cleaned.settings.delivery_fee);
          }
          // Only include settings if it has at least one value
          if (Object.keys(cleanedSettings).length > 0) {
            cleaned.settings = cleanedSettings;
          } else {
            delete cleaned.settings;
          }
        }
      } else {
        // If settings is not an object or array, remove it
        delete cleaned.settings;
      }
    }

    // Remove empty strings and convert to null/undefined as needed
    Object.keys(cleaned).forEach((key) => {
      const value = cleaned[key as keyof typeof cleaned];
      if (value === "" || value === null) {
        if (
          key === "store_name" ||
          key === "store_phone" ||
          key === "store_address" ||
          key === "owner_name" ||
          key === "owner_phone" ||
          (key === "owner_password" && !isEdit) ||
          key === "is_active"
        ) {
          // Don't remove required fields
          return;
        }
        if (isEdit && key !== "store_name") {
          // In edit mode, we can omit optional fields
          delete cleaned[key as keyof typeof cleaned];
        }
      }
    });

    return cleaned;
  };

  const formSubmit = handleSubmit(
    async (data) => {
      try {
        const cleanedData = cleanFormData(data);
        await onSubmit(cleanedData);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to save store";
        showToast("error", message, "Error");
      }
    },
    (formErrors: FieldErrors<CreateStoreInput | UpdateStoreInput>) => {
      console.error("Store form validation errors:", formErrors);
      const firstError = Object.values(formErrors)[0];
      if (firstError?.message) {
        showToast("error", firstError.message, "Validation Error");
      } else {
        showToast("error", "Please check the form for errors", "Validation Error");
      }
    },
  );

  return (
    <form className="space-y-6" onSubmit={formSubmit}>
      <div className="flex items-center gap-3 mb-4">
        <Button variant="outline" size="sm" type="button" onClick={() => navigate("/stores")} startIcon={<ChevronLeftIcon className="w-4 h-4" />}>
          Back to Outlets
        </Button>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Basic Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="store_name">
              Outlet Name <span className="text-error-500">*</span>
            </Label>
            <InputField
              id="store_name"
              placeholder="Outlet name"
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
                  onSearchChange={onLocationSearch}
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
                placeholder="Outlet description"
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
            <Label htmlFor="store_phone">
              Phone <span className="text-error-500">*</span>
            </Label>
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
          <Label htmlFor="store_address">
            Address <span className="text-error-500">*</span>
          </Label>
          <InputField
            id="store_address"
            placeholder="Outlet address"
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

        <div>
          <Label htmlFor="gst_number">GST Number</Label>
          <InputField
            id="gst_number"
            placeholder="GST Number"
            {...register("gst_number")}
            error={!!errors.gst_number}
            hint={errors.gst_number?.message}
          />
        </div>
      </div>

      {/* Owner Information */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Owner Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="owner_name">
              Owner Name <span className="text-error-500">*</span>
            </Label>
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
            <Label htmlFor="owner_phone">
              Owner Phone <span className="text-error-500">*</span>
            </Label>
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
          <Label htmlFor="owner_password">
            Owner Password {!isEdit && <span className="text-error-500">*</span>}
          </Label>
          <InputField
            id="owner_password"
            type="password"
            placeholder={isEdit ? "Leave empty to keep current password" : "Enter owner password"}
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

