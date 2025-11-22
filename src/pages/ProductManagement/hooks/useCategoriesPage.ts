import { useMemo, useState } from "react";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import type { FormEventHandler } from "react";
import { useModal } from "../../../hooks/useModal";
import {
  useCategoriesPaginatedQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../../hooks/queries/categories";
import type { Category, CreateCategoryInput } from "../../../types/category";
import type { PaginationMeta } from "../../../types/pagination";
import { useForm } from "react-hook-form";
import type { FieldError, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateCategorySchema } from "../../../types/category";

export function useCategoriesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(15);
  const debouncedSearch = useDebouncedValue(search, 400);
  const { data: categoriesRes, isLoading } = useCategoriesPaginatedQuery({ 
    page, 
    per_page: perPage, 
    search: debouncedSearch 
  });
  const categories: Category[] = categoriesRes?.data ?? [];
  const meta: PaginationMeta | undefined = categoriesRes?.meta;

  const { isOpen: isFormOpen, openModal: openFormModal, closeModal: closeFormModal } = useModal();
  const { isOpen: isDetailOpen, openModal: openDetailModal, closeModal: closeDetailModal } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();

  const defaultValues: Partial<CreateCategoryInput> = useMemo(
    () => ({
      name: selectedCategory?.name ?? "",
      description: selectedCategory?.description ?? "",
      is_active: selectedCategory?.is_active ?? true,
    }),
    [selectedCategory],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CreateCategoryInput>({ resolver: zodResolver(CreateCategorySchema) });

  const openCreate = () => {
    setSelectedCategory(null);
    reset({
      name: "",
      description: "",
      is_active: true,
    });
    openFormModal();
  };

  const openEdit = (category: Category) => {
    setSelectedCategory(category);
    reset({
      name: category.name,
      description: category.description ?? "",
      is_active: category.is_active,
    });
    openFormModal();
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    
    void handleSubmit(
      (data) => {
        if (selectedCategory) {
          updateMutation.mutate(
            { id: selectedCategory.id, data },
            { onSuccess: () => closeFormModal() },
          );
        } else {
          createMutation.mutate(data, { onSuccess: () => closeFormModal() });
        }
      },
      (invalidErrors: FieldErrors<CreateCategoryInput>) => {
        console.error("Category form validation errors:", invalidErrors);
        try {
          const messages: Record<string, string> = {};
          Object.keys(invalidErrors).forEach((field) => {
            const detail = invalidErrors[field as keyof CreateCategoryInput] as FieldError | undefined;
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

  const openDetails = (category: Category) => {
    setSelectedCategory(category);
    openDetailModal();
  };

  const openDelete = (category: Category) => {
    setSelectedCategory(category);
    openDeleteModal();
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      deleteMutation.mutate(selectedCategory.id, { onSuccess: () => closeDeleteModal() });
    }
  };

  const onToggleActive = (id: number, is_active: boolean) => {
    updateMutation.mutate({ id, data: { is_active } });
  };

  const onSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page when search changes
  };

  return {
    categories,
    isLoading,
    search,
    page,
    perPage,
    setPage,
    setPerPage,
    meta,
    onSearchChange,
    register,
    control,
    errors,
    onSubmit,
    defaultValues,
    setValue,

    isFormOpen,
    isDetailOpen,
    isDeleteOpen,
    openFormModal,
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

    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeletePending: deleteMutation.isPending,
  };
}

