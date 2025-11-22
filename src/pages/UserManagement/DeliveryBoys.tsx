import PageMeta from "../../components/common/PageMeta";
import { DeliveryBoysView } from "./components/DeliveryBoysView";
import { useDeliveryBoysPage } from "./hooks/useDeliveryBoysPage";

export default function DeliveryBoys() {
  const page = useDeliveryBoysPage();
  return (
    <>
      <PageMeta title="Delivery Boys | Lapina Bakes Admin" description="Manage delivery personnel" />
      <DeliveryBoysView
        users={page.users}
        isLoading={page.isLoading}
        isError={page.isError}
        search={page.search}
        isSubmitting={page.isSubmitting}
        isOpen={page.isOpen}
        isConfirmOpen={page.isConfirmOpen}
        isLocationModalOpen={page.isLocationModalOpen}
        selectedUser={page.selectedUser}
        selectedUserForLocations={page.selectedUserForLocations}
        pendingDelete={page.pendingDelete}
        onSubmitData={page.onSubmitData}
        onCreate={page.onCreate}
        onEdit={page.onEdit}
        onRequestDelete={page.onRequestDelete}
        confirmDelete={page.confirmDelete}
        onToggleActive={page.onToggleActive}
        closeModal={page.closeModal}
        closeConfirm={page.closeConfirm}
        closeLocationModal={page.closeLocationModal}
        onAssignLocations={page.onAssignLocations}
        onSearchChange={page.onSearchChange}
      />
    </>
  );
}