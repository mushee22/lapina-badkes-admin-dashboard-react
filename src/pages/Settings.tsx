import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";

export default function Settings() {
  return (
    <>
      <PageMeta title="Settings | Lapina Bakes Admin" description="Configure application settings" />
      <PageBreadcrumb pageTitle="Settings" />
      <div className="space-y-6">
        <ComponentCard title="General Settings">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Adjust general configuration for your application.
          </p>
        </ComponentCard>
      </div>
    </>
  );
}