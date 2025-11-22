import { useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import InputField from "../../../components/form/input/InputField";
import Switch from "../../../components/form/switch/Switch";
import Select from "../../../components/form/Select";
import Autocomplete from "../../../components/form/Autocomplete";
import Label from "../../../components/form/Label";
import type { Product } from "../../../types/product";
import type { Category } from "../../../types/category";
import type { PaginationMeta } from "../../../types/pagination";
import { PencilIcon, TrashBinIcon, PlusIcon, EyeIcon, DownloadIcon } from "../../../icons";
import Pagination from "../../../components/common/Pagination";

type Props = {
  products: Product[];
  isLoading: boolean;
  search: string;
  page: number;
  perPage: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  meta: PaginationMeta | undefined;
  categoryId: number | undefined;
  setCategoryId: (id: number | undefined) => void;
  isAvailable: boolean | undefined;
  setIsAvailable: (available: boolean | undefined) => void;
  categories: Category[];
  onSearchChange: (value: string) => void;
  onCategoryClick: (id: number) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;

  isDeleteOpen: boolean;
  closeDeleteModal: () => void;

  selectedProduct: Product | null;

  openDelete: (product: Product) => void;
  confirmDelete: () => void;

  isDeletePending: boolean;
  isToggleOpen: boolean;
  closeToggleModal: () => void;
  openToggleAvailability: (product: Product) => void;
  confirmToggleAvailability: () => void;
  isTogglePending: boolean;
  isStockOpen: boolean;
  closeStockModal: () => void;
  openUpdateStock: (product: Product) => void;
  confirmUpdateStock: () => void;
  stockValue: number;
  setStockValue: (value: number) => void;
  isStockPending: boolean;
  handleExport: () => void;
};

export function ProductsView(props: Props) {
  const navigate = useNavigate();
  const {
    products,
    isLoading,
    search,
    setPage,
    meta,
    categoryId,
    setCategoryId,
    isAvailable,
    setIsAvailable,
    categories,
    onSearchChange,
    onCategoryClick,
    clearFilters,
    hasActiveFilters,
    isDeleteOpen,
    closeDeleteModal,
    selectedProduct,
    openDelete,
    confirmDelete,
    isDeletePending,
    isToggleOpen,
    closeToggleModal,
    openToggleAvailability,
    confirmToggleAvailability,
    isTogglePending,
    isStockOpen,
    closeStockModal,
    openUpdateStock,
    confirmUpdateStock,
    stockValue,
    setStockValue,
    isStockPending,
    handleExport,
  } = props;

  return (
    <>
      <PageMeta title="Products | Lapina Bakes Admin" description="Manage products" />
      <PageBreadcrumb pageTitle="Products" />
      <div className="space-y-6">
        <ComponentCard title="">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">Create, edit, and manage products here.</p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleExport} startIcon={<DownloadIcon className="w-4 h-4" />}>
                Export Products
              </Button>
              <Button size="sm" onClick={() => navigate("/products/new")} startIcon={<PlusIcon className="w-4 h-4" />}>
                Add Product
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <InputField
                id="search"
                placeholder="Search products..."
                value={search}
                onChange={(e) => onSearchChange(e.currentTarget.value)}
              />
            </div>
            <div>
              <Autocomplete
                options={categories.map((cat) => ({ value: String(cat.id), label: cat.name }))}
                placeholder="Filter by Category"
                value={categoryId ? String(categoryId) : ""}
                onChange={(value) => setCategoryId(value ? Number(value) : undefined)}
              />
            </div>
            <div>
              <Select
                options={[
                  { value: "", label: "All Availability" },
                  { value: "true", label: "Available" },
                  { value: "false", label: "Unavailable" },
                ]}
                placeholder="Filter by Availability"
                defaultValue={isAvailable !== undefined ? String(isAvailable) : ""}
                onChange={(value) => setIsAvailable(value ? value === "true" : undefined)}
              />
            </div>
            <div>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Name
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Category
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Price
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Selling Price
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Stock
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Available
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {isLoading ? (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-gray-500">Loading products...</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                    </TableRow>
                  ) : Array.isArray(products) && products.length > 0 ? (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {product.name}
                          </span>
                          <span className="text-theme-xs text-gray-500 dark:text-gray-400">ID: {product.id}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {product.category ? (
                            <button
                              onClick={() => onCategoryClick(product.category!.id)}
                              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-300 dark:hover:bg-brand-900/30 transition-colors cursor-pointer"
                              title="Click to filter by this category"
                            >
                              {product.category.name}
                            </button>
                          ) : (
                            <span className="text-gray-700 text-theme-sm dark:text-gray-300">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="text-gray-700 text-theme-sm dark:text-gray-300">
                            {product.price && !isNaN(parseFloat(product.price)) 
                              ? `₹${parseFloat(product.price).toFixed(2)}` 
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="text-gray-700 text-theme-sm dark:text-gray-300">
                            {product.selling_price && !isNaN(parseFloat(product.selling_price)) 
                              ? `₹${parseFloat(product.selling_price).toFixed(2)}` 
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <button
                            onClick={() => openUpdateStock(product)}
                            className="flex items-center gap-2 text-gray-700 text-theme-sm dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer group"
                            title="Click to update stock"
                          >
                            <span>{product.stock}</span>
                            <PencilIcon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Switch
                            label="Available"
                            checked={product.is_available}
                            onChange={() => openToggleAvailability(product)}
                          />
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/products/${product.id}`)}
                              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
                              aria-label="View Details"
                              title="View Product Details"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/products/${product.id}/edit`)}
                              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
                              aria-label="Edit"
                              title="Edit Product"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-error-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
                              aria-label="Delete"
                              title="Delete Product"
                              onClick={() => openDelete(product)}
                            >
                              <TrashBinIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-gray-500">No products found</TableCell>
                      <TableCell>{null}</TableCell>
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
            {meta && meta.last_page > 1 && (
              <Pagination meta={meta} onPageChange={setPage} isLoading={isLoading} />
            )}
          </div>
        </ComponentCard>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={closeDeleteModal} className="w-full max-w-md mx-4 sm:mx-6">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Confirm Delete</h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete the product &quot;{selectedProduct?.name}&quot;? This action cannot be undone.
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

      {/* Toggle Availability Confirmation Modal */}
      <Modal isOpen={isToggleOpen} onClose={closeToggleModal} className="w-full max-w-md mx-4 sm:mx-6">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            {selectedProduct?.is_available ? "Mark as Unavailable" : "Mark as Available"}
          </h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to mark the product &quot;{selectedProduct?.name}&quot; as {selectedProduct?.is_available ? "unavailable" : "available"}?
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={closeToggleModal} disabled={isTogglePending}>
              Cancel
            </Button>
            <Button variant="primary" disabled={isTogglePending} onClick={confirmToggleAvailability}>
              {isTogglePending ? "Updating..." : "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Update Stock Modal */}
      <Modal isOpen={isStockOpen} onClose={closeStockModal} className="w-full max-w-md mx-4 sm:mx-6">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Update Stock</h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Update stock for product &quot;{selectedProduct?.name}&quot;
          </p>
          <div className="mb-6">
            <Label htmlFor="stock">
              Stock <span className="text-error-500">*</span>
            </Label>
            <InputField
              id="stock"
              type="number"
              placeholder="Enter stock quantity"
              value={stockValue.toString()}
              onChange={(e) => setStockValue(Number(e.target.value))}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={closeStockModal} disabled={isStockPending}>
              Cancel
            </Button>
            <Button variant="primary" disabled={isStockPending} onClick={confirmUpdateStock}>
              {isStockPending ? "Updating..." : "Update Stock"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

