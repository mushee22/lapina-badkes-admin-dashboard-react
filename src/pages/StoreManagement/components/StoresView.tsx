import { Link, useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import InputField from "../../../components/form/input/InputField";
import Switch from "../../../components/form/switch/Switch";
import Select from "../../../components/form/Select";
import type { Store } from "../../../types/store";
import type { Location } from "../../../types/location";
import type { PaginationMeta } from "../../../types/pagination";
import { EyeIcon, PencilIcon, TrashBinIcon, PlusIcon, BoxIcon } from "../../../icons";
import Pagination from "../../../components/common/Pagination";

type Props = {
  stores: Store[];
  isLoading: boolean;
  search: string;
  page: number;
  perPage: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  meta: PaginationMeta | undefined;
  locationId: number | undefined;
  setLocationId: (id: number | undefined) => void;
  isActive: boolean | undefined;
  setIsActive: (active: boolean | undefined) => void;
  status: string | undefined;
  setStatus: (status: string | undefined) => void;
  locations: Location[];
  onSearchChange: (value: string) => void;
  clearFilters: () => void;

  isDeleteOpen: boolean;
  closeDeleteModal: () => void;

  selectedStore: Store | null;

  openDelete: (store: Store) => void;
  confirmDelete: () => void;

  isDeletePending: boolean;
};

export function StoresView(props: Props) {
  const navigate = useNavigate();
  const {
    stores,
    isLoading,
    search,
    setPage,
    meta,
    locationId,
    setLocationId,
    isActive,
    setIsActive,
    status,
    setStatus,
    locations,
    onSearchChange,
    clearFilters,
    isDeleteOpen,
    closeDeleteModal,
    selectedStore,
    openDelete,
    confirmDelete,
    isDeletePending,
  } = props;

  return (
    <>
      <PageMeta title="Stores | Lapina Bakes Admin" description="Manage stores" />
      <PageBreadcrumb pageTitle="Stores" />
      <div className="space-y-6">
        <ComponentCard title="">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">Create, edit, and configure store information here.</p>
            <Button size="sm" onClick={() => navigate("/stores/new")} startIcon={<PlusIcon className="w-4 h-4" />}>
              Add Store
            </Button>
          </div>

          {/* Filters */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <InputField
                id="search"
                placeholder="Search stores..."
                value={search}
                onChange={(e) => onSearchChange(e.currentTarget.value)}
              />
            </div>
            <div>
              <Select
                options={[
                  { value: "", label: "All Locations" },
                  ...locations.map((loc) => ({ value: String(loc.id), label: loc.name })),
                ]}
                placeholder="Filter by Location"
                defaultValue={locationId ? String(locationId) : ""}
                onChange={(value) => setLocationId(value ? Number(value) : undefined)}
              />
            </div>
            <div>
              <Select
                options={[
                  { value: "", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "maintenance", label: "Maintenance" },
                  { value: "closed", label: "Closed" },
                ]}
                placeholder="Filter by Status"
                defaultValue={status || ""}
                onChange={(value) => setStatus(value || undefined)}
              />
            </div>
            <div>
              <Select
                options={[
                  { value: "", label: "All Active Status" },
                  { value: "true", label: "Active" },
                  { value: "false", label: "Inactive" },
                ]}
                placeholder="Filter by Active"
                defaultValue={isActive !== undefined ? String(isActive) : ""}
                onChange={(value) => setIsActive(value ? value === "true" : undefined)}
              />
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
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
                      Location
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">
                      Owner
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">
                      Active
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-semibold text-blue-700 dark:text-blue-300 text-start text-theme-xs uppercase tracking-wider">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-blue-100/60 dark:divide-blue-800/40">
                  {isLoading ? (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-gray-500">Loading stores...</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                    </TableRow>
                  ) : Array.isArray(stores) && stores.length > 0 ? (
                    stores.map((store, index) => (
                      <TableRow key={store.id} className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/80 dark:bg-gray-800/40' : 'bg-blue-25/30 dark:bg-blue-950/20'}`}>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {store.name}
                          </span>
                          <span className="text-theme-xs text-gray-500 dark:text-gray-400">ID: {store.id}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="text-gray-700 text-theme-sm dark:text-gray-300">
                            {store.location?.name || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="text-gray-700 text-theme-sm dark:text-gray-300">
                            {store.owner?.name || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Switch
                            label="Active"
                            defaultChecked={true}
                            checked={store.is_active}
                            onChange={() => {}}
                          />
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/stores/${store.id}`}
                              className="inline-flex items-center justify-center rounded-md p-2 text-info-600 hover:text-info-800 hover:bg-info-50 dark:text-info-400 dark:hover:text-info-300 dark:hover:bg-info-900/20"
                              aria-label="View"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/stores/${store.id}/edit`}
                              className="inline-flex items-center justify-center rounded-md p-2 text-warning-600 hover:text-warning-800 hover:bg-warning-50 dark:text-warning-400 dark:hover:text-warning-300 dark:hover:bg-warning-900/20"
                              aria-label="Edit"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/orders/all?store_id=${store.id}`}
                              className="inline-flex items-center justify-center rounded-md p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/20"
                              aria-label="View Orders"
                              title="View Orders for this Store"
                            >
                              <BoxIcon className="w-4 h-4" />
                            </Link>
                            <button
                              className="inline-flex items-center justify-center rounded-md p-2 text-error-600 hover:text-error-800 hover:bg-error-50 dark:text-error-400 dark:hover:text-error-300 dark:hover:bg-error-900/20"
                              aria-label="Delete"
                              onClick={() => openDelete(store)}
                            >
                              <TrashBinIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-gray-500">No stores found</TableCell>
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
            Are you sure you want to delete the store &quot;{selectedStore?.name}&quot;? This action cannot be undone.
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

