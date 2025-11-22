import { useParams, useNavigate } from "react-router";
import { useProductQuery, useDeleteProductMutation } from "../../hooks/queries/products";
import { useProductImagesQuery } from "../../hooks/queries/products";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { ChevronLeftIcon, PencilIcon, TrashBinIcon } from "../../icons";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProductQuery(id ? Number(id) : null);
  const { data: imagesData, isLoading: isLoadingImages } = useProductImagesQuery(id ? Number(id) : null);
  const deleteMutation = useDeleteProductMutation();
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();

  const images = imagesData?.images || [];

  const onDelete = () => {
    if (!id) return;
    deleteMutation.mutate(Number(id), {
      onSuccess: () => {
        closeDeleteModal();
        navigate("/products");
      },
    });
  };

  if (isLoading) {
    return (
      <>
        <PageMeta title="Product Details | Lapina Bakes Admin" description="Product details" />
        <PageBreadcrumb pageTitle="Product Details" />
        <div className="space-y-6">
          <ComponentCard title="">
            <div className="px-5 py-4 text-center text-gray-500">Loading product details...</div>
          </ComponentCard>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <PageMeta title="Product Details | Lapina Bakes Admin" description="Product details" />
        <PageBreadcrumb pageTitle="Product Details" />
        <div className="space-y-6">
          <ComponentCard title="">
            <div className="px-5 py-4 text-center text-gray-500">Product not found</div>
            <div className="mt-4 flex justify-center">
              <Button variant="outline" size="sm" onClick={() => navigate("/products")}>
                Back to Products
              </Button>
            </div>
          </ComponentCard>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title={`Product ${product.name} | Lapina Bakes Admin`} description="Product details" />
      <PageBreadcrumb pageTitle="Product Details" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigate("/products")} startIcon={<ChevronLeftIcon className="w-4 h-4" />}>
            Back to Products
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={() => navigate(`/products/${id}/edit`)} startIcon={<PencilIcon className="w-4 h-4" />}>
              Edit Product
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={openDeleteModal}
              startIcon={<TrashBinIcon className="w-4 h-4" />}
            >
              Delete Product
            </Button>
          </div>
        </div>

        {/* Product Information */}
        <ComponentCard title="Product Information">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Product Name:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">{product.name || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Slug:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{product.slug || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Description:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{product.description || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Category:</span>
                  <div className="mt-1">
                    {product.category ? (
                      <Badge variant="light" color="info" size="sm">
                        {product.category.name}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-700 dark:text-gray-300">—</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Product ID:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{product.id}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Pricing & Stock</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Price:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {product.price && !isNaN(parseFloat(product.price))
                      ? `₹${parseFloat(product.price).toFixed(2)}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Selling Price:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {product.selling_price && !isNaN(parseFloat(product.selling_price))
                      ? `₹${parseFloat(product.selling_price).toFixed(2)}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">GST Slab:</span>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {product.gst !== undefined && product.gst !== null
                      ? product.gst === 0
                        ? "No GST"
                        : `${product.gst}%`
                      : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Stock:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{product.stock ?? "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Availability:</span>
                  <div className="mt-1">
                    <Badge 
                      variant="light" 
                      color={product.is_available ? "success" : "error"} 
                      size="sm"
                    >
                      {product.is_available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Created At:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {product.created_at ? new Date(product.created_at).toLocaleString() : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Updated At:</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {product.updated_at ? new Date(product.updated_at).toLocaleString() : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Product Images */}
        <ComponentCard title="Product Images">
          {isLoadingImages ? (
            <div className="px-5 py-4 text-center text-gray-500">Loading images...</div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className={`relative rounded-lg border-2 overflow-hidden ${
                    image.is_primary
                      ? "border-brand-500 ring-2 ring-brand-500/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={image.original_name || `Product image ${image.id}`}
                    className="w-full h-48 object-cover"
                  />
                  {image.is_primary && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-brand-500 text-white text-xs font-medium rounded">
                      Primary
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">
              No images uploaded
            </div>
          )}
        </ComponentCard>

        {/* Delete Product Confirmation Modal */}
        <Modal isOpen={isDeleteOpen} onClose={closeDeleteModal} className="w-full max-w-md mx-4 sm:mx-6">
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Confirm Delete</h3>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete product &quot;{product?.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={closeDeleteModal} disabled={deleteMutation.isPending}>
                Cancel
              </Button>
              <Button variant="primary" onClick={onDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}

