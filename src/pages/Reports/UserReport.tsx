import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";

export default function UserReport() {
  return (
    <>
      <PageMeta title="User Report | Lapina Bakes Admin" description="User activity and details report" />
      <PageBreadcrumb pageTitle="User Report" />
      <div className="space-y-6">
        <ComponentCard title="User Report">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Show user-based analytics and detailed reports.
          </p>
        </ComponentCard>
      </div>
    </>
  );
}