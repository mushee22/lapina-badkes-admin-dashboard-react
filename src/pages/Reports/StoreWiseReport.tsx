import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";

export default function StoreWiseReport() {
  return (
    <>
      <PageMeta title="Outlet Wise Report | Lapina Bakers Admin" description="Report aggregated by outlet" />
      <PageBreadcrumb pageTitle="Outlet Wise Report" />
      <div className="space-y-6">
        <ComponentCard title="Outlet Wise Report">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Analyze performance and metrics per outlet.
          </p>
        </ComponentCard>
      </div>
    </>
  );
}