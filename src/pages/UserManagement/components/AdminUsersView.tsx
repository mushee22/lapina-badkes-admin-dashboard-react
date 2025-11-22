import { useEffect } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { Modal } from "../../../components/ui/modal";
import Label from "../../../components/form/Label";
import InputField from "../../../components/form/input/InputField";
import Switch from "../../../components/form/switch/Switch";
import Button from "../../../components/ui/button/Button";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../../icons";
import type { AdminUser, AdminUserInput } from "../../../types/userManagement";
import { AdminUserCreateSchema } from "../../../types/userManagement";
import { Roles } from "../../../constants/roles";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { useToast } from "../../../context/ToastContext";
import { zodResolver } from "@hookform/resolvers/zod";

// Unified form schema: allow empty password for edit; enforce via Controller on create
const AdminUserFormSchema = AdminUserCreateSchema.extend({
  password: z.union([
    z.string().min(6, "Password must be at least 6 characters"),
    z.string().length(0),
  ]),
});
type AdminUserFormInput = z.input<typeof AdminUserFormSchema>;


type Props = {
  users: AdminUser[];
  isLoading: boolean;
  isError: boolean;
  isSubmitting?: boolean;
  isOpen: boolean;
  isConfirmOpen: boolean;
  selectedUser: AdminUser | null;
  pendingDelete: AdminUser | null;
  onSubmitData: (values: AdminUserInput) => void;
  onCreate: () => void;
  onEdit: (user: AdminUser) => void;
  onRequestDelete: (user: AdminUser) => void;
  confirmDelete: () => void;
  onToggleActive: (id: number, active: boolean) => void;
  closeModal: () => void;
  closeConfirm: () => void;
  search: string;
  onSearchChange: (value: string) => void;
};

export function AdminUsersView(props: Props) {
  const {
    users,
    isLoading,
    isError,
    isSubmitting = false,
    isOpen,
    isConfirmOpen,
    selectedUser,
    pendingDelete,
    onSubmitData,
    onCreate,
    onEdit,
    onRequestDelete,
    confirmDelete,
    onToggleActive,
    closeModal,
    closeConfirm,
    search,
    onSearchChange,
  } = props;

  const formSchema = AdminUserFormSchema;
  const { showToast } = useToast();

  const initialValues: AdminUserFormInput = selectedUser
    ? {
        name: selectedUser.name,
        email: selectedUser.email,
        phone: selectedUser.phone || "",
        address: selectedUser.address || "",
        password: "",
        active: true,
      }
    : {
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      active: true,
    };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminUserFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
    mode: "onTouched",
    reValidateMode: "onBlur",
  });

  // Normalize form values to AdminUserInput shape for API layer
  function toAdminUserInput(values: AdminUserFormInput): AdminUserInput {
    const normalizedRoles = selectedUser?.roles ?? [Roles.Admin];
    return {
      name: values.name,
      email: values.email,
      phone: values.phone ? values.phone : undefined,
      address: values.address ? values.address : undefined,
      roles: normalizedRoles,
      password: values.password ? values.password : undefined,
      active: values.active,
    };
  }

  const formSubmit = handleSubmit(
    (values: AdminUserFormInput) => onSubmitData(toAdminUserInput(values)),
    (formErrors: FieldErrors<AdminUserFormInput>) => {
      const message =
        formErrors.name?.message ||
        formErrors.email?.message ||
        formErrors.password?.message ||
        formErrors.phone?.message ||
        formErrors.address?.message ||
        formErrors.active?.message ||
        "Please check the form fields";
      showToast("error", message, "Validation Error");
    },
  );

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [isOpen, selectedUser]);

  return (
    <>
      <PageMeta title="Admin Users | Lapina Bakes Admin" description="Manage admin users" />
      <PageBreadcrumb pageTitle="Admin Users" />

      <div className="space-y-6">
        <ComponentCard title="Admin Users">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage admin users for your store.</p>
            <div className="flex items-center gap-3">
              <div className="w-64">
                <InputField
                  id="admin-search"
                  placeholder="Search admin users..."
                  value={search}
                  onChange={(e) => onSearchChange(e.currentTarget.value)}
                />
              </div>
              <Button size="sm" onClick={onCreate} startIcon={<PlusIcon className="w-4 h-4" />}>Create Admin User</Button>
            </div>
          </div>

          {isLoading && (
            <div className="px-5 py-4 text-gray-500">Loading users...</div>
          )}
          {isError && (
            <div className="px-5 py-4 text-error-600">Failed to load users.</div>
          )}

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Phone</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Roles</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {Array.isArray(users) ? users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{user.name}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {user.email}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {user.phone || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <span
                              key={role}
                              className="inline-block rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Switch
                          label="Active"
                          defaultChecked={true}
                          onChange={(checked) => onToggleActive(user.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <div className="flex items-center gap-2">
                          <button
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
                            aria-label="Edit"
                            onClick={() => onEdit(user)}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-error-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
                            aria-label="Delete"
                            onClick={() => onRequestDelete(user)}
                          >
                            <TrashBinIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-gray-500">
                        No users found or invalid data format
                      </TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </ComponentCard>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="w-full max-w-2xl mx-4 sm:mx-6">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            {selectedUser ? "Edit Admin User" : "Create Admin User"}
          </h3>
          <form noValidate onSubmit={formSubmit}>
            <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <InputField
                    id="name"
                    name={field.name}
                    placeholder="Enter name"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.name}
                    hint={errors.name?.message as string}
                  />
                )}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <InputField
                    id="email"
                    name={field.name}
                    type="email"
                    placeholder="Enter email"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.email}
                    hint={errors.email?.message as string}
                  />
                )}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <InputField
                    id="phone"
                    name={field.name}
                    type="tel"
                    placeholder="Enter phone number"
                    value={field.value || ""}
                    onChange={field.onChange}
                    error={!!errors.phone}
                    hint={errors.phone?.message as string}
                  />
                )}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <InputField
                    id="address"
                    name={field.name}
                    placeholder="Enter address"
                    value={field.value || ""}
                    onChange={field.onChange}
                    error={!!errors.address}
                    hint={errors.address?.message as string}
                  />
                )}
              />
            </div>
            {null}
            <div>
              <Label htmlFor="password">Password</Label>
              <Controller
                name="password"
                control={control}
                rules={
                  selectedUser
                    ? undefined
                    : {
                        required: "Password is required",
                        minLength: { value: 6, message: "Password must be at least 6 characters" },
                      }
                }
                render={({ field }) => (
                  <InputField
                    id="password"
                    name={field.name}
                    type="password"
                    placeholder={selectedUser ? "Leave blank to keep current" : "Enter password"}
                    value={field.value || ""}
                    onChange={field.onChange}
                    error={!!errors.password}
                    hint={errors.password?.message as string}
                  />
                )}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Loading..." : selectedUser ? "Save Changes" : "Create"}
              </Button>
            </div>
          </div>
          </form>
        </div>
      </Modal>
      <Modal isOpen={isConfirmOpen} onClose={closeConfirm} className="w-full max-w-md mx-4 sm:mx-6">
        <div className="p-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white/90">Confirm Delete</h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">Are you sure you want to delete {pendingDelete?.name}?</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeConfirm}>Cancel</Button>
            <Button variant="primary" onClick={confirmDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}