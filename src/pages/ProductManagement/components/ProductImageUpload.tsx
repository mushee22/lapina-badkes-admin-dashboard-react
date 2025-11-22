import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Button from "../../../components/ui/button/Button";
import ComponentCard from "../../../components/common/ComponentCard";
import Label from "../../../components/form/Label";
import { Modal } from "../../../components/ui/modal";
import { useProductImagesQuery, useUploadProductImagesMutation, useDeleteProductImageMutation, useSetProductImagePrimaryMutation } from "../../../hooks/queries/products";
import type { Product, ProductImage } from "../../../types/product";
import { TrashBinIcon, CheckCircleIcon } from "../../../icons";
import { useModal } from "../../../hooks/useModal";

interface ProductImageUploadProps {
  product: Product;
}

export default function ProductImageUpload({ product }: ProductImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState<number | undefined>(undefined);
  const [imageToDelete, setImageToDelete] = useState<ProductImage | null>(null);
  const uploadMutation = useUploadProductImagesMutation();
  const deleteImageMutation = useDeleteProductImageMutation();
  const setPrimaryMutation = useSetProductImagePrimaryMutation();
  const { data: imagesData, isLoading: isLoadingImages } = useProductImagesQuery(product.id);
  // Sort images by sort_order
  const existingImages = (imagesData?.images || []).sort((a, b) => a.sort_order - b.sort_order);
  const { isOpen: isDeleteOpen, openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "image/svg+xml": [".svg"],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    // Reset primary index if the removed file was the primary
    if (primaryIndex === index) {
      setPrimaryIndex(undefined);
    } else if (primaryIndex !== undefined && primaryIndex > index) {
      // Adjust primary index if a file before it was removed
      setPrimaryIndex(primaryIndex - 1);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      await uploadMutation.mutateAsync({
        id: product.id,
        data: {
          images: selectedFiles,
          primary_index: primaryIndex !== undefined ? primaryIndex : undefined,
        },
      });
      setSelectedFiles([]);
      setPrimaryIndex(undefined);
    } catch (error) {
      console.error("Failed to upload images", error);
    }
  };

  const handleSetExistingPrimary = async (imageId: number) => {
    try {
      await setPrimaryMutation.mutateAsync({
        productId: product.id,
        imageId: imageId,
      });
    } catch (error) {
      console.error("Failed to set primary image", error);
    }
  };

  const handleDeleteClick = (image: ProductImage) => {
    setImageToDelete(image);
    openDeleteModal();
  };

  const confirmDelete = () => {
    if (imageToDelete) {
      deleteImageMutation.mutate(
        { productId: product.id, imageId: imageToDelete.id },
        {
          onSuccess: () => {
            closeDeleteModal();
            setImageToDelete(null);
          },
        }
      );
    }
  };

  if (isLoadingImages) {
    return (
      <ComponentCard title="Product Images">
        <div className="px-5 py-4 text-center text-gray-500">Loading images...</div>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Product Images">
      <div className="space-y-6">
        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <Label>Existing Images ({existingImages.length})</Label>
            <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {existingImages.map((image) => (
                <div
                  key={image.id}
                  className={`relative group rounded-lg border-2 overflow-hidden ${
                    image.is_primary
                      ? "border-brand-500 ring-2 ring-brand-500/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={image.original_name || `Product image ${image.id}`}
                    className="w-full h-32 object-cover"
                  />
                  {image.is_primary && (
                    <>
                      <div className="absolute top-2 left-2 px-2 py-1 bg-brand-500 text-white text-xs font-medium rounded flex items-center gap-1">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        Primary
                      </div>
                      <div className="absolute top-2 right-2 p-1.5 bg-brand-500 text-white rounded-full shadow-lg">
                        <CheckCircleIcon className="w-5 h-5" />
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
                    {!image.is_primary && (
                      <button
                        type="button"
                        onClick={() => handleSetExistingPrimary(image.id)}
                        disabled={uploadMutation.isPending || deleteImageMutation.isPending || setPrimaryMutation.isPending}
                        className="px-3 py-1.5 text-xs font-medium rounded bg-white/90 text-gray-700 hover:bg-brand-500 hover:text-white transition-colors disabled:opacity-50"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(image)}
                      disabled={uploadMutation.isPending || deleteImageMutation.isPending}
                      className="p-1.5 bg-error-500 text-white rounded hover:bg-error-600 transition-colors disabled:opacity-50"
                      title="Delete image"
                    >
                      <TrashBinIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {existingImages.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No images uploaded yet</p>
          </div>
        )}

        {/* Upload New Images */}
        <div>
          <Label>Upload New Images</Label>
          <div
            {...getRootProps()}
            className={`mt-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors ${
              isDragActive
                ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
                : "border-gray-300 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-600"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <svg
                  className="h-6 w-6 text-gray-600 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {isDragActive ? "Drop images here" : "Drag & drop images here"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                or click to browse (PNG, JPG, WebP, SVG)
              </p>
            </div>
          </div>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div>
            <Label>Selected Images ({selectedFiles.length})</Label>
            <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {selectedFiles.map((file, index) => {
                const previewUrl = URL.createObjectURL(file);
                return (
                  <div
                    key={index}
                    className={`relative group rounded-lg border-2 overflow-hidden ${
                      primaryIndex === index
                        ? "border-brand-500 ring-2 ring-brand-500/20"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <img
                      src={previewUrl}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    {primaryIndex === index && (
                      <div className="absolute top-2 right-2 p-1.5 bg-brand-500 text-white rounded-full shadow-lg z-10">
                        <CheckCircleIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPrimaryIndex(index)}
                        className={`px-3 py-1.5 text-xs font-medium rounded ${
                          primaryIndex === index
                            ? "bg-brand-500 text-white"
                            : "bg-white/90 text-gray-700 hover:bg-brand-500 hover:text-white"
                        } transition-colors`}
                      >
                        {primaryIndex === index ? "Primary" : "Set Primary"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1.5 bg-error-500 text-white rounded hover:bg-error-600 transition-colors"
                      >
                        <TrashBinIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {selectedFiles.length > 0 && (
          <div className="flex items-center justify-end">
            <Button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              size="sm"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload Images"}
            </Button>
          </div>
        )}
      </div>

      {/* Delete Image Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={closeDeleteModal} className="w-full max-w-md mx-4 sm:mx-6">
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">Confirm Delete</h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this image? This action cannot be undone.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={closeDeleteModal} disabled={deleteImageMutation.isPending}>
              Cancel
            </Button>
            <Button variant="primary" disabled={deleteImageMutation.isPending} onClick={confirmDelete}>
              {deleteImageMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </ComponentCard>
  );
}

