import { useState } from "react";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useModal } from "../../../hooks/useModal";
import { Role } from "../../../types/role";
import { useRolesPaginatedQuery, useDeleteRoleMutation } from "../../../hooks/queries/roles";
import { useNavigate } from "react-router";

export function useRolesPage() {
    const navigate = useNavigate();
    const [pendingDelete, setPendingDelete] = useState<Role | null>(null);

    const { isOpen: isConfirmOpen, openModal: openConfirm, closeModal: closeConfirm } = useModal(false);

    const [page, setPage] = useState<number>(1);
    const [perPage, setPerPage] = useState<number>(15);
    const [search, setSearch] = useState<string>("");
    const debouncedSearch = useDebouncedValue(search, 400);

    const { data: rolesRes, isLoading, isError } = useRolesPaginatedQuery({ page, per_page: perPage, search: debouncedSearch });

    const roles: Role[] = rolesRes?.roles ?? [];
    const meta = rolesRes?.pagination;

    const deleteMutation = useDeleteRoleMutation();

    const onCreate = () => {
        navigate("/users/roles/new");
    };

    const onEdit = (role: Role) => {
        navigate(`/users/roles/${role.id}/edit`);
    };

    const onRequestDelete = (role: Role) => {
        setPendingDelete(role);
        openConfirm();
    };

    const confirmDelete = () => {
        if (pendingDelete) {
            deleteMutation.mutate(pendingDelete.id, {
                onSuccess: () => {
                    setPendingDelete(null);
                    closeConfirm();
                },
            });
        } else {
            closeConfirm();
        }
    };

    const onSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    return {
        roles,
        isLoading,
        isError,
        search,
        page,
        perPage,
        setPage,
        setPerPage,
        meta,
        isDeleting: deleteMutation.isPending,
        isConfirmOpen,
        openConfirm,
        closeConfirm,
        pendingDelete,
        onCreate,
        onEdit,
        onRequestDelete,
        confirmDelete,
        onSearchChange,
    };
}
