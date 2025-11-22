import { useState } from "react";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useModal } from "../../../hooks/useModal";
import type { AdminUser, AdminUserInput } from "../../../types/userManagement";
import { Roles } from "../../../constants/roles";
import type { PaginationMeta } from "../../../services/adminUsers";
import {
  useDeliveryBoysPaginatedQuery,
  useCreateDeliveryBoyMutation,
  useUpdateDeliveryBoyMutation,
  useDeleteDeliveryBoyMutation,
  useSetDeliveryBoyActiveMutation,
} from "../../../hooks/queries/deliveryBoys";

export function useDeliveryBoysPage() {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
  const [selectedUserForLocations, setSelectedUserForLocations] = useState<AdminUser | null>(null);

  const { isOpen, openModal, closeModal } = useModal(false);
  const { isOpen: isConfirmOpen, openModal: openConfirm, closeModal: closeConfirm } = useModal(false);
  const { isOpen: isLocationModalOpen, openModal: openLocationModal, closeModal: closeLocationModal } = useModal(false);

  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(15);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const { data: usersRes, isLoading, isError } = useDeliveryBoysPaginatedQuery({ page, per_page: perPage, search: debouncedSearch, is_active: true });
  const users: AdminUser[] = usersRes?.data ?? [];
  const meta: PaginationMeta | undefined = usersRes?.meta;
  const createMutation = useCreateDeliveryBoyMutation();
  const updateMutation = useUpdateDeliveryBoyMutation();
  const deleteMutation = useDeleteDeliveryBoyMutation();
  const setActiveMutation = useSetDeliveryBoyActiveMutation();

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
      // Preserve existing roles on edit; otherwise default to delivery boy
      payload.roles = selectedUser.roles?.length ? selectedUser.roles : [Roles.DeliveryBoy];
      updateMutation.mutate(
        { id: selectedUser.id, data: payload },
        {
          onSuccess: () => {
            closeModal();
          },
        },
      );
    } else {
      // Ensure role defaults to delivery boy on create
      const createValues: AdminUserInput = { ...values, roles: values.roles ?? [Roles.DeliveryBoy] };
      createMutation.mutate(createValues, {
        onSuccess: () => {
          closeModal();
        },
      });
    }
  };

  const onAssignLocations = (user: AdminUser) => {
    setSelectedUserForLocations(user);
    openLocationModal();
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
    isLocationModalOpen,
    openModal,
    closeModal,
    openConfirm,
    closeConfirm,
    openLocationModal,
    closeLocationModal,
    selectedUser,
    selectedUserForLocations,
    pendingDelete,
    onSubmitData,
    onCreate,
    onEdit,
    onRequestDelete,
    confirmDelete,
    onToggleActive,
    onSearchChange,
    onAssignLocations,
  };
}