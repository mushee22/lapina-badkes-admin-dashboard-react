import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";

export default function Uploads() {
  return (
    <>
      <PageMeta title="Product Uploads | Lapina Bakes Admin" description="Manage product uploads" />
      <PageBreadcrumb pageTitle="Product Uploads" />
      <div className="space-y-6">
        <ComponentCard title="Uploads">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload product images, files, and related assets here.
          </p>
        </ComponentCard>
      </div>
    </>
  );
}