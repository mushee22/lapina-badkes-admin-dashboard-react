import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { Modal } from "../../../components/ui/modal";
import Label from "../../../components/form/Label";
import InputField from "../../../components/form/input/InputField";
import Switch from "../../../components/form/switch/Switch";
import Button from "../../../components/ui/button/Button";
import Checkbox from "../../../components/form/input/Checkbox";
import Radio from "../../../components/form/input/Radio";
import { PlusIcon, PencilIcon, TrashBinIcon, BoxIcon, EyeIcon } from "../../../icons";
import type { AdminUser, AdminUserInput } from "../../../types/userManagement";
import { AdminUserCreateSchema } from "../../../types/userManagement";
import { Roles } from "../../../constants/roles";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { useToast } from "../../../context/ToastContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocationsQuery } from "../../../hooks/queries/locations";
import { useAssignDeliveryBoyLocationsMutation } from "../../../hooks/queries/deliveryBoys";
import type { AssignUserLocationsInput } from "../../../services/adminUsers";

const DeliveryBoyFormSchema = AdminUserCreateSchema.extend({
  password: z.union([
    z.string().min(6, "Password must be at least 6 characters"),
    z.string().length(0),
  ]),
});
type DeliveryBoyFormInput = z.input<typeof DeliveryBoyFormSchema>;

type Props = {
  users: AdminUser[];
  isLoading: boolean;
  isError: boolean;
  isSubmitting?: boolean;
  isOpen: boolean;
  isConfirmOpen: boolean;
  isLocationModalOpen: boolean;
  selectedUser: AdminUser | null;
  selectedUserForLocations: AdminUser | null;
  pendingDelete: AdminUser | null;
  onSubmitData: (values: AdminUserInput) => void;
  onCreate: () => void;
  onEdit: (user: AdminUser) => void;
  onRequestDelete: (user: AdminUser) => void;
  confirmDelete: () => void;
  onToggleActive: (id: number, active: boolean) => void;
  closeModal: () => void;
  closeConfirm: () => void;
  closeLocationModal: () => void;
  onAssignLocations: (user: AdminUser) => void;
  search: string;
  onSearchChange: (value: string) => void;
};

export function DeliveryBoysView(props: Props) {
  const {
    users,
    isLoading,
    isError,
    isSubmitting = false,
    isOpen,
    isConfirmOpen,
    isLocationModalOpen,
    selectedUser,
    selectedUserForLocations,
    pendingDelete,
    onSubmitData,
    onCreate,
    onEdit,
    onRequestDelete,
    confirmDelete,
    onToggleActive,
    closeModal,
    closeConfirm,
    closeLocationModal,
    onAssignLocations,
    search,
    onSearchChange,
  } = props;

  const formSchema = DeliveryBoyFormSchema;
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { data: locations = [] } = useLocationsQuery();
  const assignLocationsMutation = useAssignDeliveryBoyLocationsMutation();
  
  // Location assignment state (for location assignment modal)
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);
  const [primaryLocationId, setPrimaryLocationId] = useState<number | undefined>(undefined);
  
  // Location selection state (for creation modal)
  const [formLocationIds, setFormLocationIds] = useState<number[]>([]);
  const [formPrimaryLocationId, setFormPrimaryLocationId] = useState<number | undefined>(undefined);

  const initialValues: DeliveryBoyFormInput = selectedUser
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
  } = useForm<DeliveryBoyFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
    mode: "onTouched",
    reValidateMode: "onBlur",
  });

  function toDeliveryBoyInput(values: DeliveryBoyFormInput): AdminUserInput & { location_ids?: number[]; primary_location_id?: number } {
    const normalizedRoles = selectedUser?.roles ?? [Roles.DeliveryBoy];
    const baseInput: AdminUserInput = {
      name: values.name,
      email: values.email,
      phone: values.phone ? values.phone : undefined,
      address: values.address ? values.address : undefined,
      roles: normalizedRoles,
      password: values.password ? values.password : undefined,
      active: values.active,
    };
    
    // Add location data when creating (not editing)
    if (!selectedUser) {
      return {
        ...baseInput,
        location_ids: formLocationIds.length > 0 ? formLocationIds : undefined,
        primary_location_id: formPrimaryLocationId,
      } as AdminUserInput & { location_ids?: number[]; primary_location_id?: number };
    }
    
    return baseInput;
  }
  
  const handleFormLocationToggle = (locationId: number) => {
    setFormLocationIds((prev) => {
      if (prev.includes(locationId)) {
        // Remove location
        const newIds = prev.filter((id) => id !== locationId);
        // If it was the primary location, clear primary
        if (formPrimaryLocationId === locationId) {
          setFormPrimaryLocationId(undefined);
        }
        return newIds;
      } else {
        // Add location
        return [...prev, locationId];
      }
    });
  };

  const handleFormPrimaryLocationChange = (locationId: string) => {
    const id = Number(locationId);
    setFormPrimaryLocationId(id);
    // Ensure the primary location is in selected locations
    if (!formLocationIds.includes(id)) {
      setFormLocationIds((prev) => [...prev, id]);
    }
  };

  const formSubmit = handleSubmit(
    (values: DeliveryBoyFormInput) => onSubmitData(toDeliveryBoyInput(values)),
    (formErrors: FieldErrors<DeliveryBoyFormInput>) => {
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
      // Reset location selection when modal opens
      setFormLocationIds([]);
      setFormPrimaryLocationId(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedUser]);

  useEffect(() => {
    if (isLocationModalOpen && selectedUserForLocations) {
      // Reset location selection when modal opens
      setSelectedLocationIds([]);
      setPrimaryLocationId(undefined);
    }
  }, [isLocationModalOpen, selectedUserForLocations]);

  const handleLocationToggle = (locationId: number) => {
    setSelectedLocationIds((prev) => {
      if (prev.includes(locationId)) {
        // Remove location
        const newIds = prev.filter((id) => id !== locationId);
        // If it was the primary location, clear primary
        if (primaryLocationId === locationId) {
          setPrimaryLocationId(undefined);
        }
        return newIds;
      } else {
        // Add location
        return [...prev, locationId];
      }
    });
  };

  const handlePrimaryLocationChange = (locationId: string) => {
    const id = Number(locationId);
    setPrimaryLocationId(id);
    // Ensure the primary location is in selected locations
    if (!selectedLocationIds.includes(id)) {
      setSelectedLocationIds((prev) => [...prev, id]);
    }
  };

  const handleAssignLocations = () => {
    if (!selectedUserForLocations) return;
    
    if (selectedLocationIds.length === 0) {
      showToast("error", "Please select at least one location", "Validation Error");
      return;
    }

    const input: AssignUserLocationsInput = {
      location_ids: selectedLocationIds,
      primary_location_id: primaryLocationId,
    };

    assignLocationsMutation.mutate(
      { id: selectedUserForLocations.id, input },
      {
        onSuccess: () => {
          closeLocationModal();
          setSelectedLocationIds([]);
          setPrimaryLocationId(undefined);
        },
      }
    );
  };

  return (
    <>
      <PageMeta title="Delivery Boys | Lapina Bakes Admin" description="Manage delivery personnel" />
      <PageBreadcrumb pageTitle="Delivery Boys" />

      <div className="space-y-6">
        <ComponentCard title="">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage delivery personnel.</p>
            <div className="flex items-center gap-3">
              <div className="w-64">
                <InputField
                  id="delivery-search"
                  placeholder="Search delivery boys..."
                  value={search}
                  onChange={(e) => onSearchChange(e.currentTarget.value)}
                />
              </div>
              <Button size="sm" onClick={onCreate} startIcon={<PlusIcon className="w-4 h-4" />}>Create Delivery Boy</Button>
            </div>
          </div>

          {isLoading && (
            <div className="px-5 py-4 text-gray-500">Loading users...</div>
          )}
          {isError && (
            <div className="px-5 py-4 text-error-600">Failed to load users.</div>
          )}

          <div className="overflow-hidden rounded-xl border-2 border-blue-100/60 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 dark:border-blue-800/40 dark:bg-gradient-to-br dark:from-gray-800/70 dark:via-blue-900/20 dark:to-indigo-900/30 shadow-lg">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b-2 border-blue-200/60 bg-gradient-to-r from-blue-100/40 via-indigo-100/50 to-purple-100/40 dark:border-blue-700/60 dark:bg-gradient-to-r dark:from-blue-900/30 dark:via-indigo-900/40 dark:to-purple-900/30">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">Email</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">Phone</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">Roles</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">Status</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-blue-100/60 dark:divide-blue-800/40">
                  {Array.isArray(users) ? users.map((user, index) => (
                    <TableRow key={user.id} className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/80 dark:bg-gray-800/40' : 'bg-blue-25/30 dark:bg-blue-950/20'}`}>
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
                            className="inline-flex items-center justify-center rounded-md p-2 text-info-600 hover:text-info-800 hover:bg-info-50 dark:text-info-400 dark:hover:text-info-300 dark:hover:bg-info-900/20"
                            aria-label="View Details"
                            onClick={() => navigate(`/users/delivery-boys/${user.id}`)}
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            className="inline-flex items-center justify-center rounded-md p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/20"
                            aria-label="Assign Locations"
                            onClick={() => onAssignLocations(user)}
                            title="Assign Locations"
                          >
                            <BoxIcon className="w-4 h-4" />
                          </button>
                          <button
                            className="inline-flex items-center justify-center rounded-md p-2 text-warning-600 hover:text-warning-800 hover:bg-warning-50 dark:text-warning-400 dark:hover:text-warning-300 dark:hover:bg-warning-900/20"
                            aria-label="Edit"
                            onClick={() => onEdit(user)}
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            className="inline-flex items-center justify-center rounded-md p-2 text-error-600 hover:text-error-800 hover:bg-error-50 dark:text-error-400 dark:hover:text-error-300 dark:hover:bg-error-900/20"
                            aria-label="Delete"
                            onClick={() => onRequestDelete(user)}
                            title="Delete"
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
            {selectedUser ? "Edit Delivery Boy" : "Create Delivery Boy"}
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
                      placeholder={selectedUser ? "Leave empty to keep current password" : "Enter password"}
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.password}
                      hint={errors.password?.message as string}
                    />
                  )}
                />
              </div>
              <div>
                <Label htmlFor="active">Active</Label>
                <Controller
                  name="active"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      label=""
                      defaultChecked={field.value ?? true}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              
              {!selectedUser && (
                <>
                  <div>
                    <Label className="mb-3 block">Select Locations (Optional)</Label>
                    {locations.length === 0 ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400">No locations available.</p>
                    ) : (
                      <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
                        {locations.map((location) => (
                          <div key={location.id} className="flex items-center justify-between py-2">
                            <Checkbox
                              id={`form-location-${location.id}`}
                              checked={formLocationIds.includes(location.id)}
                              onChange={() => handleFormLocationToggle(location.id)}
                              label={`${location.name} - ${location.address}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {formLocationIds.length > 0 && (
                    <div>
                      <Label className="mb-3 block">Primary Location (Optional)</Label>
                      <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
                        {formLocationIds.map((locationId) => {
                          const location = locations.find((l) => l.id === locationId);
                          if (!location) return null;
                          return (
                            <Radio
                              key={location.id}
                              id={`form-primary-${location.id}`}
                              name="form_primary_location"
                              value={String(location.id)}
                              checked={formPrimaryLocationId === location.id}
                              onChange={handleFormPrimaryLocationChange}
                              label={`${location.name} - ${location.address}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
              
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

      <Modal isOpen={isLocationModalOpen} onClose={closeLocationModal} className="w-full max-w-2xl mx-4 sm:mx-6">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Assign Locations to {selectedUserForLocations?.name}
          </h3>
          
          {locations.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No locations available.</p>
          ) : (
            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Select Locations</Label>
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
                  {locations.map((location) => (
                    <div key={location.id} className="flex items-center justify-between py-2">
                      <Checkbox
                        id={`location-${location.id}`}
                        checked={selectedLocationIds.includes(location.id)}
                        onChange={() => handleLocationToggle(location.id)}
                        label={`${location.name} - ${location.address}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {selectedLocationIds.length > 0 && (
                <div>
                  <Label className="mb-3 block">Primary Location (Optional)</Label>
                  <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
                    {selectedLocationIds.map((locationId) => {
                      const location = locations.find((l) => l.id === locationId);
                      if (!location) return null;
                      return (
                        <Radio
                          key={location.id}
                          id={`primary-${location.id}`}
                          name="primary_location"
                          value={String(location.id)}
                          checked={primaryLocationId === location.id}
                          onChange={handlePrimaryLocationChange}
                          label={`${location.name} - ${location.address}`}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeLocationModal}
                  disabled={assignLocationsMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAssignLocations}
                  disabled={assignLocationsMutation.isPending || selectedLocationIds.length === 0}
                >
                  {assignLocationsMutation.isPending ? "Assigning..." : "Assign Locations"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}