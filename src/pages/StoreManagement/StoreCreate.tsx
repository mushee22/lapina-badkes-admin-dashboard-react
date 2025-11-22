import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import StoreForm from "./components/StoreForm";
import { useCreateStoreMutation } from "../../hooks/queries/stores";
import { useLocationsQuery } from "../../hooks/queries/locations";
import type { CreateStoreInput } from "../../types/store";

export default function StoreCreate() {
  const navigate = useNavigate();
  const createMutation = useCreateStoreMutation();
  const { data: locations = [] } = useLocationsQuery();

  const handleSubmit = async (values: CreateStoreInput) => {
    try {
      await createMutation.mutateAsync(values);
      navigate("/stores");
    } catch (error) {
      console.error("Failed to create store", error);
    }
  };

  return (
    <>
      <PageMeta title="Add Store | Lapina Bakes Admin" description="Create a new store" />
      <PageBreadcrumb pageTitle="Add Store" />
      <div className="space-y-6">
        <ComponentCard title="Add Store">
          <StoreForm
            onSubmit={handleSubmit}
            submitLabel="Create Store"
            locations={locations}
            isLoading={createMutation.isPending}
          />
        </ComponentCard>
      </div>
    </>
  );
}

