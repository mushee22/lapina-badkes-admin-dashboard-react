import { useMemo, useState } from "react";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import type { FormEventHandler } from "react";
import { useModal } from "../../../hooks/useModal";
import {
  useLocationsQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useSetLocationStatusMutation,
} from "../../../hooks/queries/locations";
import type { Location, CreateLocationInput } from "../../../types/location";
import { useForm } from "react-hook-form";
import type { FieldError, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateLocationSchema } from "../../../types/location";

export function useLocationsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const { data: locations = [], isLoading } = useLocationsQuery({ search: debouncedSearch });

  const { isOpen: isFormOpen, openModal: openFormModal, closeModal: closeFormModal } = useModal();
  const { isOpen: isDetailOpen, openModal: openDetailModal, closeModal: closeDetailModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();
  const { isOpen: isStatusOpen, openModal: openStatusModal, closeModal: closeStatusModal } = useModal();

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [pendingStatus, setPendingStatus] = useState<boolean>(false);

  const createMutation = useCreateLocationMutation();
  const updateMutation = useUpdateLocationMutation();
  const deleteMutation = useDeleteLocationMutation();
  const setStatusMutation = useSetLocationStatusMutation();

  const defaultValues: Partial<CreateLocationInput> = useMemo(
    () => ({
      name: selectedLocation?.name ?? "",
      address: selectedLocation?.address ?? "",
      city: selectedLocation?.city ?? "",
      code: selectedLocation?.code ?? "",
      is_active: selectedLocation?.is_active ?? true,
    }),
    [selectedLocation],
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CreateLocationInput>({ resolver: zodResolver(CreateLocationSchema) });

  const openCreate = () => {
    setSelectedLocation(null);
    reset({
      name: "",
      address: "",
      city: "",
      code: "",
      is_active: true,
    });
    openFormModal();
  };

  const openEdit = (loc: Location) => {
    setSelectedLocation(loc);
    reset({
      name: loc.name,
      address: loc.address,
      city: loc.city,
      code: loc.code ?? "",
      is_active: loc.is_active,
    });
    openFormModal();
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {

    e.preventDefault();
    
    void handleSubmit(
      (data) => {
        console.log("Location form submit payload:", data);
        if (selectedLocation) {
          updateMutation.mutate(
            { id: selectedLocation.id, data },
            { onSuccess: () => closeFormModal() },
          );
        } else {
          createMutation.mutate(data, { onSuccess: () => closeFormModal() });
        }
      },
      (invalidErrors: FieldErrors<CreateLocationInput>) => {
        console.error("Location form validation errors:", invalidErrors);
        try {
          const messages: Record<string, string> = {};
          Object.keys(invalidErrors).forEach((field) => {
            const detail = invalidErrors[field as keyof CreateLocationInput] as FieldError | undefined;
            const message = detail?.message;
            messages[field] = message ?? JSON.stringify(detail ?? {});
          });
          console.table(messages);
        } catch {
          // noop
        }
        console.log("Current form values:", getValues());
      },
    )();
  };

  const openDetails = (loc: Location) => {
    setSelectedLocation(loc);
    openDetailModal();
  };

  const openDelete = (loc: Location) => {
    setSelectedLocation(loc);
    openDeleteModal();
  };

  const confirmDelete = () => {
    if (selectedLocation) {
      deleteMutation.mutate(selectedLocation.id, { onSuccess: () => closeDeleteModal() });
    }
  };

  const openToggleStatus = (loc: Location) => {
    setSelectedLocation(loc);
    setPendingStatus(!loc.is_active);
    openStatusModal();
  };

  const confirmStatusChange = () => {
    if (selectedLocation) {
      setStatusMutation.mutate(
        { id: selectedLocation.id, is_active: pendingStatus },
        { onSuccess: () => closeStatusModal() },
      );
    }
  };

  console.log(errors, 'validation error')

  return {
    locations,
    isLoading,
    search,
    onSearchChange: (value: string) => setSearch(value),
    register,
    errors,
    onSubmit,
    defaultValues,
    setValue,

    isFormOpen,
    isDetailOpen,
    isDeleteOpen,
    isStatusOpen,
    openFormModal,
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

    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeletePending: deleteMutation.isPending,
    isStatusPending: setStatusMutation.isPending,
  };
}