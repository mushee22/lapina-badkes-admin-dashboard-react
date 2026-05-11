import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../../../components/ui/modal";
import Button from "../../../components/ui/button/Button";
import InputField from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Select from "../../../components/form/Select";
import DatePicker from "../../../components/form/date-picker";
import Label from "../../../components/form/Label";
import { type UpdateInvoiceInput, UpdateInvoiceSchema, type Invoice } from "../../../types/order";
import { useUpdateInvoiceMutation } from "../../../hooks/queries/orders";

interface EditInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  orderId: number;
}

export default function EditInvoiceModal({ isOpen, onClose, invoice, orderId }: EditInvoiceModalProps) {
  const updateInvoiceMutation = useUpdateInvoiceMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateInvoiceInput>({
    resolver: zodResolver(UpdateInvoiceSchema),
    defaultValues: {
      invoice_number: invoice.invoice_number,
      status: invoice.status,
      notes: invoice.notes || "",
      due_date: invoice.due_date ? invoice.due_date.split("T")[0] : "",
      subtotal: invoice.subtotal,
      discount_amount: invoice.discount_amount,
      tax_amount: invoice.tax_amount,
      total_amount: invoice.total_amount,
    },
  });

  const subtotal = watch("subtotal") || 0;
  const discountAmount = watch("discount_amount") || 0;
  const taxAmount = watch("tax_amount") || 0;

  // Auto-calculate total amount
  useEffect(() => {
    const total = Number(subtotal) - Number(discountAmount) + Number(taxAmount);
    setValue("total_amount", Number(total.toFixed(2)));
  }, [subtotal, discountAmount, taxAmount, setValue]);

  useEffect(() => {
    if (isOpen) {
      reset({
        invoice_number: invoice.invoice_number,
        status: invoice.status,
        notes: invoice.notes || "",
        due_date: invoice.due_date ? invoice.due_date.split("T")[0] : "",
        subtotal: invoice.subtotal,
        discount_amount: invoice.discount_amount,
        tax_amount: invoice.tax_amount,
        total_amount: invoice.total_amount,
      });
    }
  }, [isOpen, invoice, reset]);

  const onSubmit = (data: UpdateInvoiceInput) => {
    updateInvoiceMutation.mutate(
      { id: invoice.id, orderId, data },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Update Invoice
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Invoice Number</Label>
              <InputField
                {...register("invoice_number")}
                hint={errors.invoice_number?.message}
                error={!!errors.invoice_number}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "paid", label: "Paid" },
                  { value: "cancelled", label: "Cancelled" },
                  { value: "overdue", label: "Overdue" },
                ]}
                value={watch("status")}
                onChange={(value) => setValue("status", value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DatePicker
              id="due_date"
              label="Due Date"
              defaultDate={watch("due_date") || undefined}
              onChange={(_dates, dateStr) => setValue("due_date", dateStr)}
            />
            <div className="space-y-1.5">
              <Label>Subtotal</Label>
              <InputField
                type="number"
                step="0.01"
                {...register("subtotal", { valueAsNumber: true })}
                hint={errors.subtotal?.message}
                error={!!errors.subtotal}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Discount Amount</Label>
              <InputField
                type="number"
                step="0.01"
                {...register("discount_amount", { valueAsNumber: true })}
                hint={errors.discount_amount?.message}
                error={!!errors.discount_amount}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tax Amount</Label>
              <InputField
                type="number"
                step="0.01"
                {...register("tax_amount", { valueAsNumber: true })}
                hint={errors.tax_amount?.message}
                error={!!errors.tax_amount}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Total Amount (Auto-calculated)</Label>
            <InputField
              type="number"
              step="0.01"
              readOnly
              {...register("total_amount", { valueAsNumber: true })}
              hint={errors.total_amount?.message}
              error={!!errors.total_amount}
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <TextArea
              {...register("notes")}
              hint={errors.notes?.message}
              error={!!errors.notes}
              rows={3}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={updateInvoiceMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
