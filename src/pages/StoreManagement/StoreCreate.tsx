import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import StoreForm from "./components/StoreForm";
import { useCreateStoreMutation } from "../../hooks/queries/stores";
import { useLocationsQuery } from "../../hooks/queries/locations";

import type { CreateStoreInput, UpdateStoreInput } from "../../types/store";

export default function StoreCreate() {
  const navigate = useNavigate();
  const createMutation = useCreateStoreMutation();
  const { data: locations = [] } = useLocationsQuery();


  const handleSubmit = async (values: CreateStoreInput | UpdateStoreInput) => {
    try {
      await createMutation.mutateAsync(values as CreateStoreInput);
      navigate("/stores");
    } catch (error) {
      console.error("Failed to create outlet", error);
    }
  };

  return (
    <>
      <PageMeta title="Add Outlet | Lapina Bakers Admin" description="Create a new outlet" />
      <PageBreadcrumb pageTitle="Add Outlet" />
      <div className="space-y-6">
        <ComponentCard title="Add Outlet">
          <StoreForm
            onSubmit={handleSubmit}
            submitLabel="Create Outlet"
            locations={locations}

            isLoading={createMutation.isPending}
          />
        </ComponentCard>
      </div>
    </>
  );
}

