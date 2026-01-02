import { useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";
import { useModal } from "../../hooks/useModal";
import { useToast } from "../../context/ToastContext";
import {
    useRoutesQuery,
    useCreateRouteMutation,
    useUpdateRouteMutation,
    useDeleteRouteMutation,
} from "../../services/routes";
import { type Route, type CreateRouteInput } from "../../types/route";
import RouteModal from "./components/RouteModal";
import { Modal } from "../../components/ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";

export default function Routes() {
    const { data: routes, isLoading } = useRoutesQuery();
    const createMutation = useCreateRouteMutation();
    const updateMutation = useUpdateRouteMutation();
    const deleteMutation = useDeleteRouteMutation();
    const { showToast } = useToast();

    const { isOpen, openModal, closeModal } = useModal();
    const {
        isOpen: isDeleteOpen,
        openModal: openDeleteModal,
        closeModal: closeDeleteModal,
    } = useModal();

    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
    const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);

    const handleCreate = () => {
        setSelectedRoute(null);
        openModal();
    };

    const handleEdit = (route: Route) => {
        setSelectedRoute(route);
        openModal();
    };

    const handleDeleteClick = (route: Route) => {
        setRouteToDelete(route);
        openDeleteModal();
    };

    const handleDeleteConfirm = () => {
        if (!routeToDelete) return;

        deleteMutation.mutate(routeToDelete.id, {
            onSuccess: () => {
                showToast("success", "Route deleted successfully");
                closeDeleteModal();
                setRouteToDelete(null);
            },
            onError: () => {
                showToast("error", "Failed to delete route");
            },
        });
    };

    const handleSubmit = (data: CreateRouteInput) => {
        if (selectedRoute) {
            updateMutation.mutate(
                { id: selectedRoute.id, ...data },
                {
                    onSuccess: () => {
                        showToast("success", "Route updated successfully");
                        closeModal();
                    },
                    onError: () => {
                        showToast("error", "Failed to update route");
                    },
                }
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    showToast("success", "Route created successfully");
                    closeModal();
                },
                onError: () => {
                    showToast("error", "Failed to create route");
                },
            });
        }
    };

    return (
        <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                        Routes
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage delivery routes and areas
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="primary" startIcon={<PlusIcon className="w-5 h-5" />} onClick={handleCreate}>
                        Add Route
                    </Button>
                </div>
            </div>

            <div className="mt-6">
                <ComponentCard title="All Routes">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Loading routes...</div>
                    ) : routes && routes.length > 0 ? (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                            <div className="max-w-full overflow-x-auto">
                                <Table>
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                                Name
                                            </TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                                Code
                                            </TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                                Description
                                            </TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                                Status
                                            </TableCell>
                                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                                                Actions
                                            </TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                        {routes.map((route: Route) => (
                                            <TableRow
                                                key={route.id}
                                                className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                                            >
                                                <TableCell className="px-5 py-4 text-start">
                                                    <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {route.name}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start">
                                                    <span className="text-gray-700 text-theme-sm dark:text-gray-300">
                                                        {route.code}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start">
                                                    <span className="text-gray-700 text-theme-sm dark:text-gray-300">
                                                        {route.description || "—"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start">
                                                    <Badge color={route.is_active ? "success" : "error"} size="sm">
                                                        {route.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-end">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(route)}
                                                            className="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-700"
                                                            title="Edit"
                                                        >
                                                            <PencilIcon className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(route)}
                                                            className="rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-error-600 dark:text-gray-400 dark:hover:bg-gray-700"
                                                            title="Delete"
                                                        >
                                                            <TrashBinIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">No routes found. Create one to get started.</div>
                    )}
                </ComponentCard>
            </div>

            <RouteModal
                isOpen={isOpen}
                onClose={closeModal}
                onSubmit={handleSubmit}
                initialData={selectedRoute}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            <Modal isOpen={isDeleteOpen} onClose={closeDeleteModal} size="sm">
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Delete Route</h3>
                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete <span className="font-bold">{routeToDelete?.name}</span>? This
                        action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={closeDeleteModal}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleDeleteConfirm}
                            disabled={deleteMutation.isPending}
                            className="bg-error-600 text-white hover:bg-error-700"
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
