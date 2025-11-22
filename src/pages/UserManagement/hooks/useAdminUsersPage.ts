import { useState } from "react";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useModal } from "../../../hooks/useModal";
import type { AdminUser, AdminUserInput } from "../../../types/userManagement";
import { useAdminUsersPaginatedQuery, useCreateAdminUserMutation, useUpdateAdminUserMutation, useDeleteAdminUserMutation, useSetActiveMutation } from "../../../hooks/queries/adminUsers";
import type { PaginationMeta } from "../../../services/adminUsers";

export function useAdminUsersPage() {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
  // Local UI state: which user is selected and which is pending deletion

  const { isOpen, openModal, closeModal } = useModal(false);
  const { isOpen: isConfirmOpen, openModal: openConfirm, closeModal: closeConfirm } = useModal(false);

  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(15);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const { data: usersRes, isLoading, isError } = useAdminUsersPaginatedQuery({ page, per_page: perPage, search: debouncedSearch });
  const users: AdminUser[] = usersRes?.data ?? [];
  const meta: PaginationMeta | undefined = usersRes?.meta;
  const createMutation = useCreateAdminUserMutation();
  const updateMutation = useUpdateAdminUserMutation();
  const deleteMutation = useDeleteAdminUserMutation();
  const setActiveMutation = useSetActiveMutation();

  // Form state and validation are now handled by react-hook-form within the view

  const onCreate = () => {
    setSelectedUser(null);
    openModal();
  };

  const onEdit = (user: AdminUser) => {
    setSelectedUser(user);
    openModal();
  };

  const onRequestDelete = (user: AdminUser) => {
    setPendingDelete(user);
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

  const onToggleActive = (id: number, active: boolean) => {
    setActiveMutation.mutate({ id, active });
  };

  const onSearchChange = (value: string) => {
    setSearch(value);
    // Reset pagination when search changes
    setPage(1);
  };

  const onSubmitData = (values: AdminUserInput) => {
    if (selectedUser) {
      const payload: Partial<AdminUserInput> = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
      };
      if (values.password && values.password !== "") {
        payload.password = values.password;
      }
      if (values.active !== undefined) {
        payload.active = values.active;
      }
      updateMutation.mutate(
        { id: selectedUser.id, data: payload },
        {
          onSuccess: () => {
            closeModal();
          },
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          closeModal();
        },
      });
    }
  };

  return {
    users,
    isLoading,
    isError,
    search,
    page,
    perPage,
    setPage,
    setPerPage,
    meta,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdatingStatus: setActiveMutation.isPending,
    isOpen,
    isConfirmOpen,
    openModal,
    closeModal,
    openConfirm,
    closeConfirm,
    selectedUser,
    pendingDelete,
    onSubmitData,
    onCreate,
    onEdit,
    onRequestDelete,
    confirmDelete,
    onToggleActive,
    onSearchChange,
  };
}