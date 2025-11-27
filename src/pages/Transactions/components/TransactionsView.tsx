import { useState } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Autocomplete from "../../../components/form/Autocomplete";
import DatePicker from "../../../components/form/date-picker";
import Badge from "../../../components/ui/badge/Badge";
import { Modal } from "../../../components/ui/modal";
import Label from "../../../components/form/Label";
import InputField from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import { EyeIcon, PencilIcon, TrashBinIcon, PlusIcon } from "../../../icons";
import type { Transaction } from "../../../services/transactions";
import type { PaginationMeta } from "../../../types/pagination";
import Pagination from "../../../components/common/Pagination";
import { useDeliveryBoysListQuery } from "../../../hooks/queries/deliveryBoys";
import { useAdminUsersQuery } from "../../../hooks/queries/adminUsers";
import { useStoresPaginatedQuery } from "../../../hooks/queries/stores";
import { useUpdateTransactionMutation, useDeleteTransactionMutation, useCreateStoreTransactionMutation } from "../../../hooks/queries/transactions";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateTransactionSchema, CreateStoreTransactionSchema, type UpdateTransactionInput, type CreateStoreTransactionInput } from "../../../types/transaction";
import { useModal } from "../../../hooks/useModal";

type Props = {
  transactions: Transaction[];
  isLoading: boolean;
  page: number;
  perPage: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  meta: PaginationMeta | undefined;
  type: string | undefined;
  setType: (type: string | undefined) => void;
  paymentMode: string | undefined;
  setPaymentMode: (mode: string | undefined) => void;
  paymentStatus: string | undefined;
  setPaymentStatus: (status: string | undefined) => void;
  collectedBy: number | undefined;
  setCollectedBy: (id: number | undefined) => void;
  addedBy: number | undefined;
  setAddedBy: (id: number | undefined) => void;
  dateFrom: string | undefined;
  setDateFrom: (date: string | undefined) => void;
  dateTo: string | undefined;
  setDateTo: (date: string | undefined) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
};

export function TransactionsView(props: Props) {
  const navigate = useNavigate();
  const { data: deliveryBoys = [] } = useDeliveryBoysListQuery({});
  const { data: adminUsers = [] } = useAdminUsersQuery();
  const { data: storesRes } = useStoresPaginatedQuery({ per_page: 100 });
  const stores = storesRes?.data ?? [];
  const updateMutation = useUpdateTransactionMutation();
  const deleteMutation = useDeleteTransactionMutation();
  const createStoreTransactionMutation = useCreateStoreTransactionMutation();
  const { isOpen: isEditOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const { isOpen: isCreateOpen, openModal: openCreateModal, closeModal: closeCreateModal } = useModal();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  const {
    transactions,
    isLoading,
    setPage,
    meta,
    type,
    setType,
    paymentMode,
    setPaymentMode,
    paymentStatus,
    setPaymentStatus,
    collectedBy,
    setCollectedBy,
    addedBy,
    setAddedBy,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    clearFilters,
    hasActiveFilters,
  } = props;

  const allUsers = [...deliveryBoys, ...adminUsers];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateTransactionInput>({
    resolver: zodResolver(UpdateTransactionSchema),
    defaultValues: {
      amount: 0,
      payment_mode: undefined,
      payment_note: "",
      payment_discount: 0,
      collected_by: undefined,
      transaction_date: "",
    },
  });

  const {
    control: createControl,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<CreateStoreTransactionInput>({
    resolver: zodResolver(CreateStoreTransactionSchema),
    defaultValues: {
      store_id: undefined,
      amount: 0,
      payment_mode: "cash",
      payment_note: "",
      collected_by: undefined,
      transaction_date: new Date().toISOString().split('T')[0],
    },
  });

  const openEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    reset({
      amount: transaction.amount,
      payment_mode: transaction.payment_mode as "cash" | "card" | "online" | "upi" | "bank_transfer" | "other" | undefined,
      payment_note: transaction.payment_note || "",
      payment_discount: transaction.payment_discount || 0,
      collected_by: transaction.collected_by || undefined,
      transaction_date: transaction.transaction_date ? transaction.transaction_date.split('T')[0] : "",
    });
    openEditModal();
  };

  const openDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    openDeleteModal();
  };

  const onSubmit = (data: UpdateTransactionInput) => {
    if (!selectedTransaction) return;
    updateMutation.mutate(
      { id: selectedTransaction.id, data },
      {
        onSuccess: () => {
          closeEditModal();
          setSelectedTransaction(null);
        },
      }
    );
  };

  const onDelete = () => {
    if (!selectedTransaction) return;
    deleteMutation.mutate(selectedTransaction.id, {
      onSuccess: () => {
        closeDeleteModal();
        setSelectedTransaction(null);
      },
    });
  };

  const onCreate = () => {
    resetCreate({
      store_id: undefined,
      amount: 0,
      payment_mode: "cash",
      payment_note: "",
      collected_by: undefined,
      transaction_date: new Date().toISOString().split('T')[0],
    });
    openCreateModal();
  };

  const onCreateSubmit = (data: CreateStoreTransactionInput) => {
    createStoreTransactionMutation.mutate(data, {
      onSuccess: () => {
        closeCreateModal();
      },
    });
  };

  return (
    <>
      <PageMeta title="Transactions | Lapina Bakes Admin" description="View and manage transactions" />
      <PageBreadcrumb pageTitle="Transactions" />
      <div className="space-y-6">
        <ComponentCard title="">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">View and manage all transactions here.</p>
            <Button size="sm" onClick={onCreate} startIcon={<PlusIcon className="w-4 h-4" />}>
              Add Transaction
            </Button>
          </div>

          {/* Filters */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Type</label>
              <Select
                options={[
                  { value: "order", label: "Order" },
                  { value: "store", label: "Store" },
                ]}
                placeholder="All Types"
                value={type || ""}
                onChange={(value) => setType(value || undefined)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Payment Mode</label>
              <Select
                options={[
                  { value: "cash", label: "Cash" },
                  { value: "card", label: "Card" },
                  { value: "online", label: "Online" },
                  { value: "upi", label: "UPI" },
                  { value: "bank_transfer", label: "Bank Transfer" },
                ]}
                placeholder="All Modes"
                value={paymentMode || ""}
                onChange={(value) => setPaymentMode(value || undefined)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Payment Status</label>
              <Select
                options={[
                  { value: "fully_paid", label: "Fully Paid" },
                  { value: "partially_paid", label: "Partially Paid" },
                  { value: "unpaid", label: "Unpaid" },
                ]}
                placeholder="All Statuses"
                value={paymentStatus || ""}
                onChange={(value) => setPaymentStatus(value || undefined)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Collected By</label>
              <Autocomplete
                options={allUsers.map((user) => ({
                  value: String(user.id),
                  label: user.name,
                }))}
                placeholder="All Users"
                value={collectedBy ? String(collectedBy) : ""}
                onChange={(value) => setCollectedBy(value ? Number(value) : undefined)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Added By</label>
              <Autocomplete
                options={allUsers.map((user) => ({
                  value: String(user.id),
                  label: user.name,
                }))}
                placeholder="All Users"
                value={addedBy ? String(addedBy) : ""}
                onChange={(value) => setAddedBy(value ? Number(value) : undefined)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Date From</label>
              <DatePicker
                id="date_from"
                placeholder="Select Date"
                defaultDate={dateFrom}
                onChange={(_dates, currentDateString) => {
                  setDateFrom(currentDateString || undefined);
                }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">Date To</label>
              <DatePicker
                id="date_to"
                placeholder="Select Date"
                defaultDate={dateTo}
                onChange={(_dates, currentDateString) => {
                  setDateTo(currentDateString || undefined);
                }}
              />
            </div>
            <div>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-6">
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sm:px-5">
                      ID / Related To
                    </TableCell>
                    <TableCell isHeader className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sm:px-5">
                      Amount
                    </TableCell>
                    <TableCell isHeader className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sm:px-5">
                      Payment Mode
                    </TableCell>
                    <TableCell isHeader className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sm:px-5">
                      Status
                    </TableCell>
                    <TableCell isHeader className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sm:px-5 hidden md:table-cell">
                      Collected / Added By
                    </TableCell>
                    <TableCell isHeader className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sm:px-5 hidden lg:table-cell">
                      Date
                    </TableCell>
                    <TableCell isHeader className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sm:px-5">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        Loading transactions...
                      </TableCell>
                    </TableRow>
                  ) : transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="px-3 py-4 sm:px-5">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-700 dark:text-gray-300">#{transaction.id}</span>
                            {(transaction.transactionable_type === "order" || transaction.transactionable_type === "App\\Models\\Order") && transaction.transactionable && "order_number" in transaction.transactionable ? (
                              <button
                                onClick={() => navigate(`/orders/${transaction.transactionable_id}`)}
                                className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline text-left"
                              >
                                {transaction.transactionable.order_number || `Order #${transaction.transactionable.id}`}
                              </button>
                            ) : (transaction.transactionable_type === "store" || transaction.transactionable_type === "App\\Models\\Store") && transaction.transactionable && "name" in transaction.transactionable ? (
                              <button
                                onClick={() => navigate(`/stores/${transaction.transactionable_id}`)}
                                className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline text-left"
                              >
                                {transaction.transactionable.name || `Store #${transaction.transactionable.id}`}
                              </button>
                            ) : (
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {transaction.transactionable_type === "order" || transaction.transactionable_type === "App\\Models\\Order" ? "Order" : 
                                 transaction.transactionable_type === "store" || transaction.transactionable_type === "App\\Models\\Store" ? "Store" : 
                                 transaction.transactionable_type}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-4 sm:px-5">
                          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                            ₹{transaction.amount.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 py-4 sm:px-5">
                          <Badge variant="light" color="info" size="sm">
                            {transaction.payment_mode?.charAt(0).toUpperCase() + transaction.payment_mode?.slice(1) || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3 py-4 sm:px-5">
                          {transaction.payment_status && (
                            <Badge 
                              variant="light" 
                              color={
                                transaction.payment_status === "fully_paid" ? "success" :
                                transaction.payment_status === "partially_paid" ? "warning" : "error"
                              } 
                              size="sm"
                            >
                              {transaction.payment_status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-3 py-4 sm:px-5 hidden md:table-cell">
                          <div className="flex flex-col gap-1">
                            {transaction.collected_by_user?.name && (
                              <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Collected:</span>
                                <span className="text-sm text-gray-700 dark:text-gray-300 ml-1">{transaction.collected_by_user.name}</span>
                              </div>
                            )}
                            {transaction.added_by_user?.name && (
                              <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Added:</span>
                                <span className="text-sm text-gray-700 dark:text-gray-300 ml-1">{transaction.added_by_user.name}</span>
                              </div>
                            )}
                            {!transaction.collected_by_user?.name && !transaction.added_by_user?.name && (
                              <span className="text-sm text-gray-700 dark:text-gray-300">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-4 sm:px-5 hidden lg:table-cell">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleDateString() : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 py-4 sm:px-5">
                          <div className="flex items-center gap-2">
                            {(transaction.transactionable_type === "order" || transaction.transactionable_type === "App\\Models\\Order") && (
                              <button
                                onClick={() => navigate(`/orders/${transaction.transactionable_id}`)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
                                aria-label="View Order"
                                title="View Order"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                            )}
                            {(transaction.transactionable_type === "store" || transaction.transactionable_type === "App\\Models\\Store") && (
                              <button
                                onClick={() => navigate(`/stores/${transaction.transactionable_id}`)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
                                aria-label="View Store"
                                title="View Store"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => openEdit(transaction)}
                              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
                              aria-label="Edit"
                              title="Edit Transaction"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDelete(transaction)}
                              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-error-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
                              aria-label="Delete"
                              title="Delete Transaction"
                            >
                              <TrashBinIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {meta && (
            <div className="mt-4">
              <Pagination
                meta={meta}
                onPageChange={setPage}
                onPerPageChange={(perPage) => {
                  props.setPerPage(perPage);
                  setPage(1);
                }}
                isLoading={isLoading}
              />
            </div>
          )}
        </ComponentCard>
      </div>

      {/* Edit Transaction Modal */}
      <Modal isOpen={isEditOpen} onClose={closeEditModal} className="w-full max-w-md mx-4 sm:mx-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Edit Transaction</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">
                  Amount <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(parseFloat(e.currentTarget.value) || 0)}
                      error={!!errors.amount}
                      hint={errors.amount?.message}
                    />
                  )}
                />
              </div>

              <div>
                <Label htmlFor="payment_mode">
                  Payment Mode <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="payment_mode"
                  control={control}
                  render={({ field }) => (
                    <Select
                      options={[
                        { value: "cash", label: "Cash" },
                        { value: "card", label: "Card" },
                        { value: "online", label: "Online" },
                        { value: "upi", label: "UPI" },
                        { value: "bank_transfer", label: "Bank Transfer" },
                      ]}
                      placeholder="Select Payment Mode"
                      value={field.value || ""}
                      onChange={(value) => field.onChange(value || "")}
                    />
                  )}
                />
                {errors.payment_mode && (
                  <p className="mt-1.5 text-xs text-error-500">{errors.payment_mode.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="payment_discount">Payment Discount (Optional)</Label>
                <Controller
                  name="payment_discount"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      id="payment_discount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.currentTarget.value ? parseFloat(e.currentTarget.value) : 0)}
                      error={!!errors.payment_discount}
                      hint={errors.payment_discount?.message}
                    />
                  )}
                />
              </div>

              <div>
                <Label htmlFor="collected_by">Collected By (Optional)</Label>
                <Controller
                  name="collected_by"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={allUsers.map((user) => ({
                        value: String(user.id),
                        label: user.name,
                      }))}
                      placeholder="Select Person (Optional)"
                      value={field.value ? String(field.value) : ""}
                      onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                    />
                  )}
                />
                {errors.collected_by && (
                  <p className="mt-1.5 text-xs text-error-500">{errors.collected_by.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="transaction_date">
                  Transaction Date <span className="text-error-500">*</span>
                </Label>
                <Controller
                  name="transaction_date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      id="transaction_date"
                      placeholder="Select Date"
                      defaultDate={field.value}
                      onChange={(_dates, currentDateString) => {
                        field.onChange(currentDateString || "");
                      }}
                    />
                  )}
                />
                {errors.transaction_date && (
                  <p className="mt-1.5 text-xs text-error-500">{errors.transaction_date.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="payment_note">Payment Note (Optional)</Label>
                <Controller
                  name="payment_note"
                  control={control}
                  render={({ field }) => (
                    <TextArea
                      placeholder="Enter payment notes..."
                      rows={3}
                      value={field.value || ""}
                      onChange={(value) => field.onChange(value || null)}
                      error={!!errors.payment_note}
                      hint={errors.payment_note?.message}
                    />
                  )}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center gap-3">
              <Button variant="outline" onClick={closeEditModal} disabled={updateMutation.isPending} type="button" className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button variant="primary" disabled={updateMutation.isPending} type="submit" className="w-full sm:w-auto">
                {updateMutation.isPending ? "Updating..." : "Update Transaction"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Transaction Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={closeDeleteModal} className="w-full max-w-md mx-4 sm:mx-6">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Confirm Delete</h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete transaction #{selectedTransaction?.id}? This action cannot be undone.
          </p>
          <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
            <Button variant="outline" onClick={closeDeleteModal} disabled={deleteMutation.isPending} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="primary" onClick={onDelete} disabled={deleteMutation.isPending} className="w-full sm:w-auto">
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Store Transaction Modal */}
      <Modal isOpen={isCreateOpen} onClose={closeCreateModal} className="w-full max-w-2xl mx-4 sm:mx-6">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Add Store Transaction
          </h3>
          <form noValidate onSubmit={handleCreateSubmit(onCreateSubmit)}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="store_id">Store <span className="text-error-500">*</span></Label>
                <Controller
                  name="store_id"
                  control={createControl}
                  render={({ field }) => (
                    <Autocomplete
                      options={[
                        { value: "", label: "Select Store" },
                        ...stores.map((store) => ({ value: String(store.id), label: store.name }))
                      ]}
                      placeholder="Select Store"
                      value={field.value ? String(field.value) : ""}
                      onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                    />
                  )}
                />
                {createErrors.store_id && (
                  <p className="mt-1.5 text-xs text-error-500">{createErrors.store_id.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="amount">Amount <span className="text-error-500">*</span></Label>
                <Controller
                  name="amount"
                  control={createControl}
                  render={({ field }) => (
                    <InputField
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Enter amount"
                      value={field.value ? String(field.value) : ""}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                      error={!!createErrors.amount}
                      hint={createErrors.amount?.message as string}
                    />
                  )}
                />
              </div>

              <div>
                <Label htmlFor="payment_mode">Payment Mode</Label>
                <Controller
                  name="payment_mode"
                  control={createControl}
                  render={({ field }) => (
                    <Select
                      options={[
                        { value: "cash", label: "Cash" },
                        { value: "online", label: "Online" },
                        { value: "bank_transfer", label: "Bank Transfer" },
                        { value: "other", label: "Other" },
                      ]}
                      placeholder="Select Payment Mode"
                      value={field.value || ""}
                      onChange={(value) => field.onChange(value || undefined)}
                    />
                  )}
                />
                {createErrors.payment_mode && (
                  <p className="mt-1.5 text-xs text-error-500">{createErrors.payment_mode.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="payment_note">Payment Note (Optional)</Label>
                <Controller
                  name="payment_note"
                  control={createControl}
                  render={({ field }) => (
                    <TextArea
                      placeholder="Enter payment notes..."
                      value={field.value || ""}
                      onChange={(value) => field.onChange(value || null)}
                      rows={3}
                    />
                  )}
                />
                {createErrors.payment_note && (
                  <p className="mt-1.5 text-xs text-error-500">{createErrors.payment_note.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="collected_by">Collected By (Optional)</Label>
                <Controller
                  name="collected_by"
                  control={createControl}
                  render={({ field }) => (
                    <Autocomplete
                      options={[
                        { value: "", label: "Select User" },
                        ...allUsers.map((user) => ({ value: String(user.id), label: user.name }))
                      ]}
                      placeholder="Select User"
                      value={field.value ? String(field.value) : ""}
                      onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                    />
                  )}
                />
                {createErrors.collected_by && (
                  <p className="mt-1.5 text-xs text-error-500">{createErrors.collected_by.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="transaction_date">Transaction Date <span className="text-error-500">*</span></Label>
                <Controller
                  name="transaction_date"
                  control={createControl}
                  render={({ field }) => (
                    <DatePicker
                      id="transaction_date"
                      placeholder="Select Transaction Date"
                      defaultDate={field.value || undefined}
                      onChange={(_dates, currentDateString) => {
                        field.onChange(currentDateString || "");
                      }}
                    />
                  )}
                />
                {createErrors.transaction_date && (
                  <p className="mt-1.5 text-xs text-error-500">{createErrors.transaction_date.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeCreateModal} disabled={createStoreTransactionMutation.isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createStoreTransactionMutation.isPending}>
                  {createStoreTransactionMutation.isPending ? "Creating..." : "Create Transaction"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}

