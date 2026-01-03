import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { Modal } from "../../../components/ui/modal";
import InputField from "../../../components/form/input/InputField";
import Button from "../../../components/ui/button/Button";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../../icons";
import { Role } from "../../../types/role";
import Pagination from "../../../components/common/Pagination";

type Props = {
    roles: Role[];
    isLoading: boolean;
    isError: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    onCreate: () => void;
    onEdit: (role: Role) => void;
    onRequestDelete: (role: Role) => void;
    isConfirmOpen: boolean;
    closeConfirm: () => void;
    confirmDelete: () => void;
    pendingDelete: Role | null;
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    page: number;
    setPage: (page: number) => void;
};

export function RolesView(props: Props) {
    const {
        roles,
        isLoading,
        isError,
        search,
        onSearchChange,
        onCreate,
        onEdit,
        onRequestDelete,
        isConfirmOpen,
        closeConfirm,
        confirmDelete,
        pendingDelete,
        meta,
        setPage,
    } = props;

    return (
        <>
            <PageMeta title="Roles | Lapina Bakes Admin" description="Manage user roles" />
            <PageBreadcrumb pageTitle="Roles" />

            <div className="space-y-6">
                <ComponentCard title="Roles">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Manage user roles and permissions.</p>
                        <div className="flex items-center gap-3">
                            <div className="w-64">
                                <InputField
                                    id="role-search"
                                    placeholder="Search roles..."
                                    value={search}
                                    onChange={(e) => onSearchChange(e.currentTarget.value)}
                                />
                            </div>
                            <Button size="sm" onClick={onCreate} startIcon={<PlusIcon className="w-4 h-4" />}>Create Role</Button>
                        </div>
                    </div>

                    {isLoading && (
                        <div className="px-5 py-4 text-gray-500">Loading roles...</div>
                    )}
                    {isError && (
                        <div className="px-5 py-4 text-error-600">Failed to load roles.</div>
                    )}

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Guard Name</TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Permissions Count</TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Created At</TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {Array.isArray(roles) && roles.length > 0 ? roles.map((role) => (
                                        <TableRow key={role.id}>
                                            <TableCell className="px-5 py-4 text-start">
                                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">{role.name}</span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {role.guard_name}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                    {role.permission_count || role.permissions?.length || 0} Permissions
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                {new Date(role.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-start">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-brand-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
                                                        aria-label="Edit"
                                                        onClick={() => onEdit(role)}
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:text-error-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]"
                                                        aria-label="Delete"
                                                        onClick={() => onRequestDelete(role)}
                                                    >
                                                        <TrashBinIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell className="px-5 py-4 text-center text-gray-500" colSpan={5}>
                                                No roles found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    {meta && (
                        <div className="flex justify-end mt-4">
                            <Pagination
                                meta={{
                                    current_page: meta.current_page,
                                    last_page: meta.last_page,
                                    per_page: meta.per_page,
                                    total: meta.total,
                                    from: (meta.current_page - 1) * meta.per_page + 1,
                                    to: Math.min(meta.current_page * meta.per_page, meta.total),
                                    path: "",
                                    links: Array.from({ length: meta.last_page }, (_, i) => {
                                        const p = i + 1;
                                        return {
                                            url: `?page=${p}`,
                                            label: p.toString(),
                                            active: p === meta.current_page,
                                        };
                                    }),
                                }}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </ComponentCard>
            </div>

            <Modal isOpen={isConfirmOpen} onClose={closeConfirm} className="w-full max-w-md mx-4 sm:mx-6">
                <div className="p-6">
                    <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white/90">Confirm Delete</h3>
                    <p className="mb-6 text-gray-600 dark:text-gray-400">Are you sure you want to delete role "{pendingDelete?.name}"? This action cannot be undone.</p>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={closeConfirm}>Cancel</Button>
                        <Button variant="primary" onClick={confirmDelete}>Delete</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
