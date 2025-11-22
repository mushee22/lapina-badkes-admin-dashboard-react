import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import ProductForm from "./components/ProductForm";
import ProductImageUpload from "./components/ProductImageUpload";
import { useProductQuery, useUpdateProductMutation } from "../../hooks/queries/products";
import { useCategoriesQuery } from "../../hooks/queries/categories";
import type { CreateProductInput } from "../../types/product";

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading: isLoadingProduct } = useProductQuery(id ? Number(id) : null);
  const updateMutation = useUpdateProductMutation();
  const { data: categories = [] } = useCategoriesQuery();

  const handleSubmit = async (values: CreateProductInput) => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({ id: Number(id), data: values });
      navigate("/products");
    } catch (error) {
      console.error("Failed to update product", error);
    }
  };

  if (isLoadingProduct) {
    return (
      <>
        <PageMeta title="Edit Product | Lapina Bakes Admin" description="Edit product details" />
        <PageBreadcrumb pageTitle="Edit Product" />
        <div className="space-y-6">
          <ComponentCard title="Edit Product">
            <div className="px-5 py-4 text-center text-gray-500">Loading product details...</div>
          </ComponentCard>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <PageMeta title="Edit Product | Lapina Bakes Admin" description="Edit product details" />
        <PageBreadcrumb pageTitle="Edit Product" />
        <div className="space-y-6">
          <ComponentCard title="Edit Product">
            <div className="px-5 py-4 text-center text-gray-500">Product not found</div>
          </ComponentCard>
        </div>
      </>
    );
  }

  const initialValues: Partial<CreateProductInput> = {
    name: product.name,
    description: product.description ?? "",
    price: parseFloat(product.price),
    selling_price: parseFloat(product.selling_price),
    category_id: product.category_id,
    stock: product.stock,
    is_available: product.is_available,
    gst: product.gst ?? 0,
    primary_image_index: undefined,
  };

  return (
    <>
      <PageMeta title={`Edit Product | Lapina Bakes Admin`} description="Edit product details" />
      <PageBreadcrumb pageTitle="Edit Product" />
      <div className="space-y-6">
        <ComponentCard title={`Edit Product: ${product.name}`}>
          <ProductForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            categories={categories}
            isLoading={updateMutation.isPending}
          />
        </ComponentCard>
        
        {/* Product Images Section */}
        <ProductImageUpload product={product} />
      </div>
    </>
  );
}
