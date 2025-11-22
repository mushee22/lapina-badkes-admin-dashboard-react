import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";

export default function StoreWiseReport() {
  return (
    <>
      <PageMeta title="Store Wise Report | Lapina Bakes Admin" description="Report aggregated by store" />
      <PageBreadcrumb pageTitle="Store Wise Report" />
      <div className="space-y-6">
        <ComponentCard title="Store Wise Report">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Analyze performance and metrics per store.
          </p>
        </ComponentCard>
      </div>
    </>
  );
}