import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";

export default function OrdersInvoice() {
  return (
    <>
      <PageMeta title="Orders Invoice | Lapina Bakes Admin" description="Generate and view order invoices" />
      <PageBreadcrumb pageTitle="Orders Invoice" />
      <div className="space-y-6">
        <ComponentCard title="Invoices">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generate, download, and manage invoices for orders.
          </p>
        </ComponentCard>
      </div>
    </>
  );
}