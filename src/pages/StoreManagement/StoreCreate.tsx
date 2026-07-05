import { useNavigate } from "react-router";
import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import StoreForm from "./components/StoreForm";
import { useCreateStoreMutation } from "../../hooks/queries/stores";
import { useLocationsQuery } from "../../hooks/queries/locations";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

import type { CreateStoreInput, UpdateStoreInput } from "../../types/store";

export default function StoreCreate() {
  const navigate = useNavigate();
  const createMutation = useCreateStoreMutation();
  const [locationSearch, setLocationSearch] = useState("");
  const debouncedLocationSearch = useDebouncedValue(locationSearch, 400);
  const { data: locations = [] } = useLocationsQuery({ search: debouncedLocationSearch, per_page: 100 });


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
            onLocationSearch={setLocationSearch}

            isLoading={createMutation.isPending}
          />
        </ComponentCard>
      </div>
    </>
  );
}

