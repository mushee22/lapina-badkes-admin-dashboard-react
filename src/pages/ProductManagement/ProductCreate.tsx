import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import ProductForm from "./components/ProductForm";
import { useCreateProductMutation } from "../../hooks/queries/products";
import { useCategoriesQuery } from "../../hooks/queries/categories";
import type { CreateProductInput } from "../../types/product";

export default function ProductCreate() {
  const navigate = useNavigate();
  const createMutation = useCreateProductMutation();
  const { data: categories = [] } = useCategoriesQuery();

  const handleSubmit = async (values: CreateProductInput) => {
    try {
      await createMutation.mutateAsync(values);
      navigate("/products");
    } catch (error) {
      console.error("Failed to create product", error);
    }
  };

  return (
    <>
      <PageMeta title="Add Product | Lapina Bakes Admin" description="Create a new product" />
      <PageBreadcrumb pageTitle="Add Product" />
      <div className="space-y-6">
        <ComponentCard title="Add Product">
          <ProductForm
            onSubmit={handleSubmit}
            submitLabel="Create Product"
            categories={categories}
            isLoading={createMutation.isPending}
          />
        </ComponentCard>
      </div>
    </>
  );
}
