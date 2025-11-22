import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import StoreForm from "./components/StoreForm";
import { useStoreQuery, useUpdateStoreMutation } from "../../hooks/queries/stores";
import { useLocationsQuery } from "../../hooks/queries/locations";
import type { CreateStoreInput } from "../../types/store";

export default function StoreEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: store, isLoading: isLoadingStore } = useStoreQuery(id ? Number(id) : null);
  const updateMutation = useUpdateStoreMutation();
  const { data: locations = [] } = useLocationsQuery();

  const handleSubmit = async (values: CreateStoreInput) => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({ id: Number(id), data: values });
      navigate("/stores");
    } catch (error) {
      console.error("Failed to update store", error);
    }
  };

  if (isLoadingStore) {
    return (
      <>
        <PageMeta title="Edit Store | Lapina Bakes Admin" description="Edit store details" />
        <PageBreadcrumb pageTitle="Edit Store" />
        <div className="space-y-6">
          <ComponentCard title="Edit Store">
            <div className="px-5 py-4 text-center text-gray-500">Loading store details...</div>
          </ComponentCard>
        </div>
      </>
    );
  }

  if (!store) {
    return (
      <>
        <PageMeta title="Edit Store | Lapina Bakes Admin" description="Edit store details" />
        <PageBreadcrumb pageTitle="Edit Store" />
        <div className="space-y-6">
          <ComponentCard title="Edit Store">
            <div className="px-5 py-4 text-center text-gray-500">Store not found</div>
          </ComponentCard>
        </div>
      </>
    );
  }

  const initialValues: Partial<CreateStoreInput> = {
    store_name: store.name,
    store_description: store.description ?? "",
    store_phone: store.phone ?? "",
    store_address: store.address ?? "",
    store_email: store.email ?? "",
    store_website: store.website ?? "",
    location_id: store.location?.id ?? undefined,
    owner_name: store.owner?.name ?? "",
    owner_email: store.owner?.email ?? "",
    owner_phone: store.owner?.phone ?? "",
    owner_password: "",
    is_active: store.is_active,
    discount_percentage: store.discount?.percentage ?? undefined,
    discount_start_date: store.discount?.start_date ?? undefined,
    discount_end_date: store.discount?.end_date ?? undefined,
    discount_description: store.discount?.description ?? undefined,
    discount_is_active: store.discount?.is_active ?? false,
    settings: store.settings ?? {
      min_order_amount: undefined,
      delivery_fee: undefined,
    },
  };

  return (
    <>
      <PageMeta title={`Edit Store | Lapina Bakes Admin`} description="Edit store details" />
      <PageBreadcrumb pageTitle="Edit Store" />
      <div className="space-y-6">
        <ComponentCard title={`Edit Store: ${store.name}`}>
          <StoreForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            locations={locations}
            isLoading={updateMutation.isPending}
          />
        </ComponentCard>
      </div>
    </>
  );
}

