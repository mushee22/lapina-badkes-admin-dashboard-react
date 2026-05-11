import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import InputField from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { ReturnOrderSchema } from "../../../types/order";
import type { Order, OrderItem, ReturnOrderInput } from "../../../types/order";

interface ReturnOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ReturnOrderInput) => void;
    order: Order;
    isLoading?: boolean;
}

export default function ReturnOrderModal({
    isOpen,
    onClose,
    onSubmit,
    order,
    isLoading = false,
}: ReturnOrderModalProps) {
    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ReturnOrderInput>({
        resolver: zodResolver(ReturnOrderSchema),
        defaultValues: {
            items: [],
            reason: "",
        },
    });

    useFieldArray({
        control,
        name: "items",
    });

    // Initialize form with order items when modal opens
    useEffect(() => {
        if (isOpen && order.order_items) {
            // We don't pre-populate the items array because the user selects which ones to return
            // But for this UI, it might be better to list all items and let them validly set return quantities > 0
            // OR, have a selection mechanism.
            // Let's go with: List all items, but only submit those with returned_quantity > 0.
            // However, the schema expects an array of items to return.
            // Let's prepopulate the form with 0 quantities for all items, and filter on submit?
            // No, let's allow adding items to the return list dynamically or selecting from a list.

            // Strategy: Use a local state to track selected items to return, map them to form fields?
            // Simpler Strategy: List all order items with checkbox/toggle. If selected, show quantity inputs.

            // Let's try this: initialize the form with empty items array.
            // But we need to show the order items to the user so they can pick.
            // Let's use a local state for available items and manage the 'items' field array based on checking.
        }
        reset({ items: [], reason: "" });
    }, [isOpen, order, reset]);

    // Actually, a better UX:
    // Show a table of all order items. Each row has a checkbox "Return".
    // If checked, enable inputs for returned, defective, restocking, reason.
    // On submit, collect all checked rows.

    // Since react-hook-form's useFieldArray is good for dynamic lists, let's just push an item to the array when checked.
    // But that might be tricky to sync with the visual list.

    // Alternative: The form 'items' array holds ALL order items, but we validate that at least one has returned_quantity > 0.
    // But the backend expects only the items being returned.
    // So we can have a form state that mirrors all items, and transform on submit.

    // Let's go with:
    // Render the list of order items manually.
    // When a user selects an item to return, we add it to the form's `items` array.
    // OR, simply render the `items` array and have a button to "Add Item to Return".
    // Since an order usually doesn't have THAT many items, listing them all with checkboxes is best.

    const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

    const handleCheckboxChange = (orderItemId: number, checked: boolean) => {
        if (checked) {
            setSelectedItemIds((prev) => [...prev, orderItemId]);
            // Add to form items
            const currentItems = watch("items") || [];
            setValue("items", [
                ...currentItems,
                {
                    order_item_id: orderItemId,
                    returned_quantity: 1,
                    defective_quantity: 0,
                    restocking_quantity: 1,
                    reason: "",
                },
            ]);
        } else {
            setSelectedItemIds((prev) => prev.filter((id) => id !== orderItemId));
            // Remove from form items
            const currentItems = watch("items") || [];
            setValue(
                "items",
                currentItems.filter((item) => item.order_item_id !== orderItemId)
            );
        }
    };

    const getFormItemIndex = (orderItemId: number) => {
        const items = watch("items");
        return items.findIndex((item) => item.order_item_id === orderItemId);
    };

    const onFormSubmit = (data: ReturnOrderInput) => {
        if (data.items.length === 0) {
            // Show error or prevent submit
            return;
        }
        onSubmit(data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="4xl" className="w-[95vw]  mx-4 sm:mx-6">
            <div className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Return Order Items</h3>

                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Select items to return:</h4>

                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                                    <tr>
                                        <th className="px-4 py-3 w-10">
                                            Select
                                        </th>
                                        <th className="px-4 py-3">Product</th>
                                        <th className="px-4 py-3">Price</th>
                                        <th className="px-4 py-3">Qty Sold</th>
                                        <th className="px-4 py-3 w-32">Return Qty</th>
                                        <th className="px-4 py-3 w-32">Defective</th>
                                        <th className="px-4 py-3 w-32">Restock</th>
                                        <th className="px-4 py-3">Reason</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {order.order_items.map((orderItem: OrderItem) => {
                                        const isSelected = selectedItemIds.includes(orderItem.id);
                                        const formIndex = getFormItemIndex(orderItem.id);

                                        return (
                                            <tr key={orderItem.id} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                        checked={isSelected}
                                                        onChange={(e) => handleCheckboxChange(orderItem.id, e.target.checked)}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                    <div className="flex items-center gap-2">
                                                        {orderItem.product?.main_image_url && (
                                                            <img src={orderItem.product.main_image_url} alt="" className="w-8 h-8 rounded object-cover" />
                                                        )}
                                                        <div>
                                                            <p className="line-clamp-1">{orderItem.product?.name || `Item #${orderItem.id}`}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {orderItem.price}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {orderItem.quantity}
                                                </td>

                                                {/* Inputs just for selected items */}
                                                {isSelected && formIndex !== -1 ? (
                                                    <>
                                                        <td className="px-4 py-3">
                                                            <Controller
                                                                name={`items.${formIndex}.returned_quantity`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <InputField
                                                                        type="number"
                                                                        min="1"
                                                                        max={orderItem.quantity}
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                                        className="h-8 text-sm"
                                                                    />
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Controller
                                                                name={`items.${formIndex}.defective_quantity`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <InputField
                                                                        type="number"
                                                                        min="0"
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                                        className="h-8 text-sm"
                                                                    />
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Controller
                                                                name={`items.${formIndex}.restocking_quantity`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <InputField
                                                                        type="number"
                                                                        min="0"
                                                                        {...field}
                                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                                        className="h-8 text-sm"
                                                                    />
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Controller
                                                                name={`items.${formIndex}.reason`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <InputField
                                                                        placeholder="Reason"
                                                                        {...field}
                                                                        className="h-8 text-sm min-w-[150px]"
                                                                    />
                                                                )}
                                                            />
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-4 py-3 text-gray-400">—</td>
                                                        <td className="px-4 py-3 text-gray-400">—</td>
                                                        <td className="px-4 py-3 text-gray-400">—</td>
                                                        <td className="px-4 py-3 text-gray-400">—</td>
                                                    </>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {errors.items && <p className="text-sm text-error-500">{errors.items.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="reason">General Return Reason (Optional)</Label>
                        <div className="mt-1">
                            <Controller
                                name="reason"
                                control={control}
                                render={({ field }) => (
                                    <InputField
                                        {...field}
                                        placeholder="e.g. Customer cancelled order"
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || selectedItemIds.length === 0}>
                            {isLoading ? "Processing..." : "Process Return"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
