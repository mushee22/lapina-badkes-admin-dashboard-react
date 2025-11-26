import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import InputField from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Autocomplete from "../../components/form/Autocomplete";
import TextArea from "../../components/form/input/TextArea";
import { useCreateManualOrderMutation, useOrderStoreOwnersQuery } from "../../hooks/queries/orders";
import { useProductsPaginatedQuery } from "../../hooks/queries/products";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { CreateManualOrderSchema, type CreateManualOrderInput } from "../../types/order";
import { PlusIcon, TrashBinIcon, ChevronLeftIcon } from "../../icons";

export default function ManualOrderCreate() {
  const navigate = useNavigate();
  const createMutation = useCreateManualOrderMutation();
  
  const [storeOwnerSearch, setStoreOwnerSearch] = useState("");
  const debouncedStoreOwnerSearch = useDebouncedValue(storeOwnerSearch, 400);
  const { data: storeOwners = [] } = useOrderStoreOwnersQuery(debouncedStoreOwnerSearch);
  const { data: productsRes } = useProductsPaginatedQuery({ per_page: 100, is_available: true });
  const products = productsRes?.data ?? [];

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateManualOrderInput>({
    resolver: zodResolver(CreateManualOrderSchema),
    defaultValues: {
      customer_id: undefined,
      items: [{ product_id: 0, quantity: 1 }],
      phone: "",
      status: "order_placed",
      notes: "",
    },
  });

  // Watch all items to validate stock and customer selection
  const watchedItems = watch("items");
  const watchedCustomerId = watch("customer_id");
  
  // Find selected store owner and auto-fill phone if available
  const selectedStoreOwner = storeOwners.find(owner => owner.id === watchedCustomerId);
  
  // Auto-fill phone number when store owner is selected
  React.useEffect(() => {
    if (selectedStoreOwner?.store?.phone) {
      setValue("phone", selectedStoreOwner.store.phone);
    } else if (selectedStoreOwner?.phone) {
      setValue("phone", selectedStoreOwner.phone);
    }
  }, [selectedStoreOwner, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Store raw input values for quantity fields to allow free typing
  const [quantityInputs, setQuantityInputs] = useState<Record<number, string>>({});


  const onSubmit = async (data: CreateManualOrderInput) => {
    try {
      const order = await createMutation.mutateAsync(data);
      navigate(`/orders/${order.id}`);
    } catch (error) {
      console.error("Failed to create manual order", error);
    }
  };

  const addItem = () => {
    append({ product_id: 0, quantity: 1 });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      // Clear stored input for removed item
      setQuantityInputs(prev => {
        const newState = { ...prev };
        delete newState[index];
        // Shift indices for items after the removed one
        const shifted: Record<number, string> = {};
        Object.keys(newState).forEach(key => {
          const keyNum = Number(key);
          if (keyNum > index) {
            shifted[keyNum - 1] = newState[keyNum];
          } else if (keyNum < index) {
            shifted[keyNum] = newState[keyNum];
          }
        });
        return shifted;
      });
    }
  };

  return (
    <>
      <PageMeta title="Create Manual Order | Lapina Bakes Admin" description="Create a manual order" />
      <PageBreadcrumb pageTitle="Create Manual Order" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigate("/orders/all")} startIcon={<ChevronLeftIcon className="w-4 h-4" />}>
            Back to Orders
          </Button>
        </div>

        <ComponentCard title="Create Manual Order">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Store Owner Selection */}
              <div>
                <Label htmlFor="customer_id">
                  Store Owner <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="customer_id"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={storeOwners.map((owner) => ({
                        value: String(owner.id),
                        label: owner.store ? `${owner.name} - ${owner.store.name}` : `${owner.name} (${owner.email})`,
                      }))}
                      placeholder="Search and select store owner..."
                      value={field.value ? String(field.value) : ""}
                      onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                    />
                  )}
                />
                {errors.customer_id && (
                  <p className="mt-1.5 text-xs text-error-500">{errors.customer_id.message}</p>
                )}
                <div className="mt-2">
                  <InputField
                    id="store_owner_search"
                    placeholder="Search store owners..."
                    value={storeOwnerSearch}
                    onChange={(e) => setStoreOwnerSearch(e.target.value)}
                  />
                </div>
                {selectedStoreOwner?.store && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Store: <span className="font-medium">{selectedStoreOwner.store.name}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Phone - Auto-filled from store */}
              <div>
                <Label htmlFor="phone">
                  Phone <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      id="phone"
                      placeholder="Phone number will be auto-filled from store"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      error={!!errors.phone}
                      hint={errors.phone?.message || (selectedStoreOwner?.store?.phone ? "Auto-filled from store" : "Manual entry required")}
                    />
                  )}
                />
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">
                  Status <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={[
                        { value: "order_placed", label: "Order Placed" },
                        { value: "ready_to_dispatch", label: "Ready to Dispatch" },
                        { value: "out_of_delivery", label: "Out of Delivery" },
                        { value: "delivered", label: "Delivered" },
                        { value: "cancelled", label: "Cancelled" },
                      ]}
                      placeholder="Select status"
                      value={field.value || ""}
                      onChange={(value) => field.onChange(value || undefined)}
                    />
                  )}
                />
                {errors.status && (
                  <p className="mt-1.5 text-xs text-error-500">{errors.status.message}</p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <Label>
                  Order Items <span className="text-error-500">*</span>
                </Label>
                <Button type="button" size="sm" variant="outline" onClick={addItem} startIcon={<PlusIcon className="w-4 h-4" />}>
                  Add Item
                </Button>
              </div>
              {errors.items && (
                <p className="mb-2 text-xs text-error-500">{errors.items.message}</p>
              )}
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`items.${index}.product_id`}>
                          Product <span className="text-error-500">*</span>
                        </Label>
                        <Controller
                          name={`items.${index}.product_id`}
                          control={control}
                          render={({ field: itemField }) => {
                            const selectedProduct = products.find((p) => p.id === itemField.value);
                            return (
                              <>
                                <Autocomplete
                                  options={products.map((product) => ({
                                    value: String(product.id),
                                    label: `${product.name} - ₹${product.selling_price || product.price || "0.00"} (Stock: ${product.stock})`,
                                  }))}
                                  placeholder="Select product..."
                                  value={itemField.value && itemField.value > 0 ? String(itemField.value) : ""}
                                  onChange={(value) => itemField.onChange(value ? Number(value) : 0)}
                                />
                                {selectedProduct && (
                                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                    Available stock: {selectedProduct.stock}
                                  </p>
                                )}
                              </>
                            );
                          }}
                        />
                        {errors.items?.[index]?.product_id && (
                          <p className="mt-1.5 text-xs text-error-500">
                            {errors.items[index]?.product_id?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`items.${index}.quantity`}>
                          Quantity <span className="text-error-500">*</span>
                        </Label>
                        <Controller
                          name={`items.${index}.quantity`}
                          control={control}
                          rules={{
                            validate: (value) => {
                              const productId = watchedItems[index]?.product_id;
                              if (!productId || productId === 0) {
                                return true; // Product validation will handle this
                              }
                              const product = products.find((p) => p.id === productId);
                              if (!product) {
                                return true; // Product not found, let product_id validation handle it
                              }
                              if (!value || value < 1) {
                                return "Quantity must be at least 1";
                              }
                              if (value > product.stock) {
                                return `Quantity cannot exceed available stock (${product.stock})`;
                              }
                              return true;
                            },
                          }}
                          render={({ field: itemField }) => {
                            const productId = watchedItems[index]?.product_id;
                            const product = productId ? products.find((p) => p.id === productId) : null;
                            const quantity = itemField.value || 0;
                            const exceedsStock = product ? quantity > product.stock : false;
                            
                            // Initialize input value from form value or stored input
                            const inputValue = quantityInputs[index] !== undefined 
                              ? quantityInputs[index] 
                              : (itemField.value !== undefined && itemField.value !== null ? String(itemField.value) : "");
                            
                            return (
                              <>
                                <InputField
                                  id={`items.${index}.quantity`}
                                  type="number"
                                  min="1"
                                  placeholder="Enter quantity"
                                  value={inputValue}
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    // Store the raw input value
                                    setQuantityInputs(prev => ({ ...prev, [index]: newValue }));
                                    
                                    // Update form value if it's a valid number
                                    if (newValue === "") {
                                      itemField.onChange(undefined);
                                    } else {
                                      const numValue = parseFloat(newValue);
                                      if (!isNaN(numValue) && numValue >= 0) {
                                        itemField.onChange(numValue);
                                      }
                                    }
                                  }}
                                  onBlur={(e) => {
                                    const inputValue = e.target.value;
                                    // Clear stored input on blur
                                    setQuantityInputs(prev => {
                                      const newState = { ...prev };
                                      delete newState[index];
                                      return newState;
                                    });
                                    
                                    // Ensure we have a valid number
                                    if (inputValue === "" || inputValue === "0") {
                                      itemField.onChange(undefined);
                                    } else {
                                      const numValue = parseFloat(inputValue);
                                      if (!isNaN(numValue) && numValue > 0) {
                                        itemField.onChange(numValue);
                                      } else {
                                        itemField.onChange(undefined);
                                      }
                                    }
                                  }}
                                  error={!!errors.items?.[index]?.quantity || exceedsStock}
                                  hint={errors.items?.[index]?.quantity?.message || (exceedsStock ? `Maximum available: ${product?.stock}` : undefined)}
                                />
                              </>
                            );
                          }}
                        />
                      </div>
                    </div>
                    <div className="pt-7">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={fields.length === 1}
                        className="inline-flex items-center justify-center rounded-md p-2 text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove item"
                      >
                        <TrashBinIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextArea
                    placeholder="Enter order notes..."
                    rows={4}
                    value={field.value || ""}
                    onChange={(value) => field.onChange(value || null)}
                    error={!!errors.notes}
                    hint={errors.notes?.message}
                  />
                )}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button variant="outline" type="button" onClick={() => navigate("/orders/all")}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Order"}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}

