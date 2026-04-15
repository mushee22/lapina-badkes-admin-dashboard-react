import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import InputField from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import type { StoreUser, StoreUserOwner } from "../../../types/store";
import type { Location } from "../../../types/location";
import type { PaginationMeta } from "../../../types/pagination";
import Pagination from "../../../components/common/Pagination";
import Badge from "../../../components/ui/badge/Badge";
import { DownloadIcon, EyeIcon, CopyIcon } from "../../../icons";
import { Modal } from "../../../components/ui/modal";
import { useToast } from "../../../context/ToastContext";

type Props = {
  users: StoreUser[];
  isLoading: boolean;
  search: string;
  page: number;
  perPage: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  meta: PaginationMeta | undefined;
  locationId: number | undefined;
  setLocationId: (id: number | undefined) => void;
  locations: Location[];
  onSearchChange: (value: string) => void;
  clearFilters: () => void;
  handleExport: () => void;
  isDetailOpen: boolean;
  closeDetailModal: () => void;
  viewPassword: (storeId: number) => void;
  userDetails: StoreUserOwner[];
  isDetailsLoading: boolean;
};

export function OutletUsersView(props: Props) {
  const {
    users,
    isLoading,
    search,
    setPage,
    meta,
    locationId,
    setLocationId,
    locations,
    onSearchChange,
    clearFilters,
    handleExport,
    isDetailOpen,
    closeDetailModal,
    viewPassword,
    userDetails,
    isDetailsLoading,
  } = props;

  const { showToast } = useToast();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast("success", `${label} copied to clipboard`, "Copied");
  };

  return (
    <>
      <PageMeta title="Outlet Users | Lapina Bakers Admin" description="Manage Outlet Users" />
      <PageBreadcrumb pageTitle="Outlet Users" />
      <div className="space-y-6">
        <ComponentCard title="">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">View and manage users associated with outlets.</p>
          </div>

          {/* Filters */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <InputField
                id="search"
                placeholder="Search users..."
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
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
            <div>
              <Button variant="primary" size="sm" onClick={handleExport} startIcon={<DownloadIcon className="w-4 h-4" />}>
                Export to Excel
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Store
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Owner
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Contact
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Location
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Password
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Status
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {isLoading ? (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-gray-500">Loading users...</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                      <TableCell>{null}</TableCell>
                    </TableRow>
                  ) : Array.isArray(users) && users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.store_id}>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {user.store_name}
                          </span>
                          <span className="text-theme-xs text-gray-500 dark:text-gray-400">ID: {user.store_id}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {user.owner.name}
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.owner.roles.map((role) => (
                              <Badge key={role} color="info" variant="light" size="sm">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="block text-gray-700 text-theme-sm dark:text-gray-300">
                            {user.owner.email}
                          </span>
                          {user.owner.phone && (
                            <span className="text-theme-xs text-gray-500 dark:text-gray-400">{user.owner.phone}</span>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="text-gray-700 text-theme-sm dark:text-gray-300">
                            {user.location?.name || "—"}
                          </span>
                          {user.location?.code && (
                            <span className="block text-theme-xs text-gray-500 dark:text-gray-400">Code: {user.location.code}</span>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <button
                            onClick={() => viewPassword(user.store_id)}
                            className="text-gray-500 hover:text-brand-500 transition-colors"
                            title="View Password"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Badge color={user.store_is_active ? "success" : "error"} variant="light" size="sm">
                            {user.store_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell className="px-5 py-4 text-center text-gray-500">No users found</TableCell>
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

      {/* User details Modal */}
      <Modal isOpen={isDetailOpen} onClose={closeDetailModal} className="max-w-[500px]">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Store User Details</h3>

          {isDetailsLoading ? (
            <div className="flex justify-center py-8">
              <span className="text-gray-500">Loading details...</span>
            </div>
          ) : userDetails.length > 0 ? (
            <div className="space-y-4">
              {userDetails.map((detail, index) => (
                <div key={detail.id || index} className={index > 0 ? "pt-4 border-t border-gray-100 dark:border-gray-800" : ""}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase">Name</p>
                      <p className="text-sm text-gray-800 dark:text-white/90">{detail.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase">Email</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-800 dark:text-white/90">{detail.email}</p>
                        <button
                          onClick={() => handleCopy(detail.email, "Email")}
                          className="text-gray-400 hover:text-brand-500 transition-colors"
                          title="Copy Email"
                        >
                          <CopyIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase">Phone</p>
                      <p className="text-sm text-gray-800 dark:text-white/90">{detail.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-red-500 uppercase">Password</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded select-all">
                          {detail.plain_password || "N/A"}
                        </p>
                        {detail.plain_password && (
                          <button
                            onClick={() => handleCopy(detail.plain_password ?? "", "Password")}
                            className="text-gray-400 hover:text-brand-500 transition-colors"
                            title="Copy Password"
                          >
                            <CopyIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No users found for this store.
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button variant="outline" size="sm" onClick={closeDetailModal}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
