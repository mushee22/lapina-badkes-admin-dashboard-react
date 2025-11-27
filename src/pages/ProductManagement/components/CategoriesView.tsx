import React from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import Label from "../../../components/form/Label";
import InputField from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Switch from "../../../components/form/switch/Switch";
import type { Category, CreateCategoryInput } from "../../../types/category";
import type { PaginationMeta } from "../../../types/pagination";
import type { UseFormRegister, FieldErrors, UseFormSetValue, Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { EyeIcon, PencilIcon, TrashBinIcon, PlusIcon, BoxIcon } from "../../../icons";
import { useNavigate } from "react-router";
import Pagination from "../../../components/common/Pagination";

type Props = {
  categories: Category[];
  isLoading: boolean;
  search: string;
  page: number;
  perPage: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  meta: PaginationMeta | undefined;

  register: UseFormRegister<CreateCategoryInput>;
  control: Control<CreateCategoryInput>;
  errors: FieldErrors<CreateCategoryInput>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  defaultValues: Partial<CreateCategoryInput>;
  setValue: UseFormSetValue<CreateCategoryInput>;
  onSearchChange: (value: string) => void;

  isFormOpen: boolean;
  isDetailOpen: boolean;
  isDeleteOpen: boolean;
  closeFormModal: () => void;
  closeDetailModal: () => void;
  closeDeleteModal: () => void;

  selectedCategory: Category | null;

  openCreate: () => void;
  openEdit: (category: Category) => void;
  openDetails: (category: Category) => void;
  openDelete: (category: Category) => void;
  confirmDelete: () => void;
  onToggleActive: (id: number, is_active: boolean) => void;

  isSaving: boolean;
  isDeletePending: boolean;
};

export function CategoriesView(props: Props) {
  const navigate = useNavigate();
  const {
    categories,
    isLoading,
    search,
    setPage,
    meta,
    register,
    control,
    errors,
    onSubmit,
    defaultValues,
    setValue,
    onSearchChange,
    isFormOpen,
    isDetailOpen,
    isDeleteOpen,
    closeFormModal,
    closeDetailModal,
    closeDeleteModal,
    selectedCategory,
    openCreate,
    openEdit,
    openDetails,
    openDelete,
    confirmDelete,
    onToggleActive,
    isSaving,
    isDeletePending,
  } = props;

  const viewProducts = (categoryId: number) => {
    navigate(`/products?category_id=${categoryId}`);
  };

  return (
    <>
      <PageMeta title="Product Categories | Lapina Bakes Admin" description="Manage product categories" />
      <PageBreadcrumb pageTitle="Product Categories" />
      <div className="space-y-6">
        <ComponentCard title="Categories">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">Create, edit, and organize product categories here.</p>
            <div className="flex items-center gap-3">
              <div className="w-64">
                <InputField
                  id="search"
                  placeholder="Search categories..."
                  value={search}
                  onChange={(e) => onSearchChange(e.currentTarget.value)}
                />
              </div>
              <Button size="sm" onClick={openCreate} startIcon={<PlusIcon className="w-4 h-4" />}>
                Add Category
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border-2 border-blue-100/60 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 dark:border-blue-800/40 dark:bg-gradient-to-br dark:from-gray-800/70 dark:via-blue-900/20 dark:to-indigo-900/30 shadow-lg">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b-2 border-blue-200/60 bg-gradient-to-r from-blue-100/40 via-indigo-100/50 to-purple-100/40 dark:border-blue-700/60 dark:bg-gradient-to-r dark:from-blue-900/30 dark:via-indigo-900/40 dark:to-purple-900/30">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">
                      Name
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">
                      Description
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">
                      Status
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-blue-100/60 dark:divide-blue-800/40">
                  {isLoading ? (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-gray-500">Loading categories...</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                    </TableRow>
                  ) : Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((category, index) => (
                      <TableRow key={category.id} className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/80 dark:bg-gray-800/40' : 'bg-blue-25/30 dark:bg-blue-950/20'}`}>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {category.name}
                          </span>
                          <span className="text-theme-xs text-gray-500 dark:text-gray-400">ID: {category.id}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="text-gray-700 text-theme-sm dark:text-gray-300">
                            {category.description || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Switch
                            label="Active"
                            checked={!!category.is_active}
                            disabled={isSaving}
                            onChange={() => onToggleActive(category.id, !category.is_active)}
                          />
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              className="inline-flex items-center justify-center rounded-md p-2 text-info-600 hover:text-info-800 hover:bg-info-50 dark:text-info-400 dark:hover:text-info-300 dark:hover:bg-info-900/20"
                              aria-label="View"
                              onClick={() => openDetails(category)}
                              title="View Details"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                              className="inline-flex items-center justify-center rounded-md p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/20"
                              aria-label="View Products"
                              onClick={() => viewProducts(category.id)}
                              title="View Products in this Category"
                            >
                              <BoxIcon className="w-4 h-4" />
                            </button>
                            <button
                              className="inline-flex items-center justify-center rounded-md p-2 text-warning-600 hover:text-warning-800 hover:bg-warning-50 dark:text-warning-400 dark:hover:text-warning-300 dark:hover:bg-warning-900/20"
                              aria-label="Edit"
                              onClick={() => openEdit(category)}
                              title="Edit Category"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              className="inline-flex items-center justify-center rounded-md p-2 text-error-600 hover:text-error-800 hover:bg-error-50 dark:text-error-400 dark:hover:text-error-300 dark:hover:bg-error-900/20"
                              aria-label="Delete"
                              onClick={() => openDelete(category)}
                              title="Delete Category"
                            >
                              <TrashBinIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-gray-500">No categories found</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {meta && meta.last_page > 1 && (
              <Pagination
                meta={meta}
                onPageChange={setPage}
                isLoading={isLoading}
              />
            )}
          </div>
        </ComponentCard>
      </div>

      <Modal isOpen={isFormOpen} onClose={closeFormModal} className="w-full max-w-2xl mx-4 sm:mx-6">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            {selectedCategory ? "Edit Category" : "Add Category"}
          </h3>
          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <Label htmlFor="name">
                Name <span className="text-error-500">*</span>
              </Label>
              <InputField
                id="name"
                placeholder="e.g., Electronics"
                {...register("name")}
                error={!!errors.name}
                hint={errors.name?.message}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextArea
                    placeholder="Category description (optional)"
                    value={field.value || ""}
                    onChange={field.onChange}
                    error={!!errors.description}
                    hint={errors.description?.message}
                    rows={4}
                  />
                )}
              />
            </div>
            <div>
              <Label htmlFor="is_active">Active</Label>
              <Switch
                label=""
                defaultChecked={!!defaultValues.is_active}
                onChange={(checked) => setValue("is_active", checked)}
              />
            </div>
            <div className="flex items-center gap-3 justify-end">
              <Button variant="outline" onClick={closeFormModal} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : selectedCategory ? "Save Changes" : "Create Category"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal isOpen={isDetailOpen} onClose={closeDetailModal} className="w-full max-w-md mx-4 sm:mx-6">
        {selectedCategory && (
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Category Details</h3>
            <div className="space-y-3">
              <div>
                <strong className="text-gray-700 dark:text-gray-300">ID:</strong>{" "}
                <span className="text-gray-600 dark:text-gray-400">{selectedCategory.id}</span>
              </div>
              <div>
                <strong className="text-gray-700 dark:text-gray-300">Name:</strong>{" "}
                <span className="text-gray-600 dark:text-gray-400">{selectedCategory.name}</span>
              </div>
              <div>
                <strong className="text-gray-700 dark:text-gray-300">Description:</strong>{" "}
                <span className="text-gray-600 dark:text-gray-400">
                  {selectedCategory.description || "—"}
                </span>
              </div>
              <div>
                <strong className="text-gray-700 dark:text-gray-300">Status:</strong>{" "}
                <span
                  className={`inline-block rounded-md px-2 py-1 text-xs font-medium ${
                    selectedCategory.is_active
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {selectedCategory.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              {selectedCategory.created_at && (
                <div>
                  <strong className="text-gray-700 dark:text-gray-300">Created:</strong>{" "}
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(selectedCategory.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {selectedCategory.updated_at && (
                <div>
                  <strong className="text-gray-700 dark:text-gray-300">Updated:</strong>{" "}
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(selectedCategory.updated_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-6">
              <Button variant="outline" onClick={closeDetailModal}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={closeDeleteModal} className="w-full max-w-md mx-4 sm:mx-6">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Confirm Delete</h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete the category &quot;{selectedCategory?.name}&quot;? This action cannot be
            undone.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={closeDeleteModal} disabled={isDeletePending}>
              Cancel
            </Button>
            <Button variant="primary" disabled={isDeletePending} onClick={confirmDelete}>
              {isDeletePending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

