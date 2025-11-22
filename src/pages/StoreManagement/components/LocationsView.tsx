import React from "react";
import { Link } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import Label from "../../../components/form/Label";
import InputField from "../../../components/form/input/InputField";
import Switch from "../../../components/form/switch/Switch";
import type { Location, CreateLocationInput } from "../../../types/location";
import type { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { EyeIcon, PencilIcon, TrashBinIcon, BoxIcon } from "../../../icons";

type Props = {
  locations: Location[];
  isLoading: boolean;
  search: string;

  register: UseFormRegister<CreateLocationInput>;
  errors: FieldErrors<CreateLocationInput>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  defaultValues: Partial<CreateLocationInput>;
  setValue: UseFormSetValue<CreateLocationInput>;
  onSearchChange: (value: string) => void;

  isFormOpen: boolean;
  isDetailOpen: boolean;
  isDeleteOpen: boolean;
  isStatusOpen: boolean;
  closeFormModal: () => void;
  closeDetailModal: () => void;
  closeDeleteModal: () => void;
  closeStatusModal: () => void;

  selectedLocation: Location | null;
  pendingStatus: boolean;

  openCreate: () => void;
  openEdit: (loc: Location) => void;
  openDetails: (loc: Location) => void;
  openDelete: (loc: Location) => void;
  confirmDelete: () => void;
  openToggleStatus: (loc: Location) => void;
  confirmStatusChange: () => void;
 
  isSaving: boolean;
  isDeletePending: boolean;
  isStatusPending: boolean;
};

export function LocationsView(props: Props) {
  const {
    locations,
    isLoading,
    search,
    register,
    errors,
    onSubmit,
    defaultValues,
    setValue,
    onSearchChange,
    isFormOpen,
    isDetailOpen,
    isDeleteOpen,
    isStatusOpen,
    closeFormModal,
    closeDetailModal,
    closeDeleteModal,
    closeStatusModal,
    selectedLocation,
    pendingStatus,
    openCreate,
    openEdit,
    openDetails,
    openDelete,
    confirmDelete,
    openToggleStatus,
    confirmStatusChange,
    isSaving,
    isDeletePending,
    isStatusPending,
  } = props;

  return (
    <>
      <PageMeta title="Store Locations | Lapina Bakes Admin" description="Manage store locations" />
      <PageBreadcrumb pageTitle="Store Locations" />
      <div className="space-y-6">
        <ComponentCard title="Locations">
          <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">Add and manage store locations here.</p>
            <div className="flex items-center gap-3">
              <div className="w-64">
                <InputField
                  id="search"
                  placeholder="Search locations..."
                  value={search}
                  onChange={(e) => onSearchChange(e.currentTarget.value)}
                />
              </div>
              <Button size="sm" onClick={openCreate}>Add Location</Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Address</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">City</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Phone</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {isLoading ? (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-gray-500">Loading locations...</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                    </TableRow>
                  ) : Array.isArray(locations) && locations.length > 0 ? (
                    locations.map((loc) => (
                      <TableRow key={loc.id}>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{loc.name}</span>
                          <span className="text-theme-xs text-gray-500 dark:text-gray-400">ID: {loc.id}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="text-gray-700 text-theme-sm dark:text-gray-300">{loc.address}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="text-gray-700 text-theme-sm dark:text-gray-300">{loc.city}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="text-gray-700 text-theme-sm dark:text-gray-300">{loc.phone || "—"}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Switch
                            label="Active"
                            checked={!!loc.is_active}
                            disabled={isStatusPending}
                            onChange={() => openToggleStatus(loc)}
                          />
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
                              aria-label="View"
                              onClick={() => openDetails(loc)}
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
                              aria-label="Edit"
                              onClick={() => openEdit(loc)}
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <Link
                              to={`/orders/all?location_id=${loc.id}`}
                              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
                              aria-label="View Orders"
                              title="View Orders for this Location"
                            >
                              <BoxIcon className="w-4 h-4" />
                            </Link>
                            <button
                              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-error-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
                              aria-label="Delete"
                              onClick={() => openDelete(loc)}
                            >
                              <TrashBinIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-gray-500">No locations found</TableCell>
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

      <Modal isOpen={isFormOpen} onClose={closeFormModal} className="w-full max-w-2xl mx-4 sm:mx-6">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">{selectedLocation ? "Edit Location" : "Add Location"}</h3>
          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="name">Name</Label>
              <InputField id="name" placeholder="e.g., Downtown Hub" {...register("name")} error={!!errors.name} hint={errors.name?.message} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <InputField id="address" placeholder="e.g., 123 Main Street" {...register("address")} error={!!errors.address} hint={errors.address?.message} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="city">City</Label>
                <InputField id="city" placeholder="e.g., New York" {...register("city")} error={!!errors.city} hint={errors.city?.message} />
              </div>
              <div>
                <Label htmlFor="code">Code</Label>
                <InputField id="code" placeholder="e.g., HUB-NY-01" {...register("code")} error={!!errors.code} hint={errors.code?.message} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="is_active">Active</Label>
                <Switch label="" defaultChecked={!!defaultValues.is_active} onChange={(checked) => setValue("is_active", checked)} />
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <Button variant="outline" onClick={closeFormModal}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>{selectedLocation ? "Save Changes" : "Create Location"}</Button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal isOpen={isDetailOpen} onClose={closeDetailModal} className="w-full max-w-md mx-4 sm:mx-6">
        {selectedLocation && (
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Location Details</h3>
            <p><strong>Name:</strong> {selectedLocation.name}</p>
            <p><strong>Address:</strong> {selectedLocation.address}</p>
            <p><strong>City:</strong> {selectedLocation.city}</p>
            <p><strong>State:</strong> {selectedLocation.state}</p>
            <p><strong>Postal Code:</strong> {selectedLocation.postal_code}</p>
            {selectedLocation.code ? <p><strong>Code:</strong> {selectedLocation.code}</p> : null}
            {selectedLocation.country ? <p><strong>Country:</strong> {selectedLocation.country}</p> : null}
            <p><strong>Phone:</strong> {selectedLocation.phone}</p>
            <p><strong>Status:</strong> {selectedLocation.is_active ? "Active" : "Inactive"}</p>
            <div className="mt-4">
              <Button variant="outline" onClick={closeDetailModal}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={closeDeleteModal} className="w-full max-w-md mx-4 sm:mx-6">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Confirm Delete</h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">Are you sure you want to delete this location? This action cannot be undone.</p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={closeDeleteModal}>Cancel</Button>
            <Button variant="primary" disabled={isDeletePending} onClick={confirmDelete}>Delete</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isStatusOpen} onClose={closeStatusModal} className="w-full max-w-md mx-4 sm:mx-6">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Confirm Status Change</h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">{pendingStatus ? "Activate" : "Deactivate"} this location?</p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={closeStatusModal}>Cancel</Button>
            <Button disabled={isStatusPending} onClick={confirmStatusChange}>{pendingStatus ? "Activate" : "Deactivate"}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}