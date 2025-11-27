import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";
import Label from "../components/form/Label";
import InputField from "../components/form/input/InputField";
import FileInput from "../components/form/input/FileInput";
import Button from "../components/ui/button/Button";
import { useSettingsQuery, useUpdateSettingMutation, useCreateSettingMutation } from "../hooks/queries/settings";
import { useToast } from "../context/ToastContext";

export default function Settings() {
  const { data: settings = [], isLoading } = useSettingsQuery();
  const updateMutation = useUpdateSettingMutation();
  const createMutation = useCreateSettingMutation();
  const { showToast } = useToast();

  // Find settings by key
  const paymentScannerSetting = settings.find((s) => s.key === "payment_scanner");
  const supportNumberSetting = settings.find((s) => s.key === "support_number");
  const supportEmailSetting = settings.find((s) => s.key === "support_email");
  
  // Debug settings
  console.log("All settings:", settings);
  console.log("Payment scanner setting:", paymentScannerSetting);
  console.log("Available setting keys:", settings.map(s => s.key));

  // Form state
  const [supportNumber, setSupportNumber] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Initialize form values when settings load
  useEffect(() => {
    if (supportNumberSetting) {
      setSupportNumber(supportNumberSetting.value || "");
    }
    if (supportEmailSetting) {
      setSupportEmail(supportEmailSetting.value || "");
    }
    if (paymentScannerSetting?.value) {
      setImagePreview(paymentScannerSetting.value);
    }
  }, [supportNumberSetting, supportEmailSetting, paymentScannerSetting]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input changed:", event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      console.log("File selected:", {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Validate image file
      if (!file.type.startsWith("image/")) {
        showToast("error", "Please select a valid image file", "Error");
        return;
      }
      setSelectedImage(file);
      console.log("Image set in state:", file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        console.log("Preview created");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPaymentScanner = async () => {
    if (!selectedImage) {
      showToast("error", "Please select an image", "Error");
      return;
    }
    
    const settingData = {
      key: "payment_scanner",
      value: selectedImage,
      type: "image" as const,
      description: paymentScannerSetting?.description || null,
    };
    
    // If setting exists, update it. Otherwise, create it.
    if (paymentScannerSetting?.id) {
      updateMutation.mutate(
        { ...settingData, id: paymentScannerSetting.id },
        {
          onSuccess: () => {
            setSelectedImage(null);
          },
        }
      );
    } else {
      createMutation.mutate(settingData, {
        onSuccess: () => {
          setSelectedImage(null);
        },
      });
    }
  };

  const handleSubmitSupportNumber = async () => {
    const settingData = {
      key: "support_number",
      value: supportNumber,
      type: "text" as const,
      description: supportNumberSetting?.description || null,
    };
    
    if (supportNumberSetting?.id) {
      updateMutation.mutate({ ...settingData, id: supportNumberSetting.id });
    } else {
      createMutation.mutate(settingData);
    }
  };

  const handleSubmitSupportEmail = async () => {
    const settingData = {
      key: "support_email",
      value: supportEmail,
      type: "text" as const,
      description: supportEmailSetting?.description || null,
    };
    
    if (supportEmailSetting?.id) {
      updateMutation.mutate({ ...settingData, id: supportEmailSetting.id });
    } else {
      createMutation.mutate(settingData);
    }
  };

  if (isLoading) {
    return (
      <>
        <PageMeta title="Settings | Lapina Bakes Admin" description="Configure application settings" />
        <PageBreadcrumb pageTitle="Settings" />
        <div className="space-y-6">
          <ComponentCard title="Settings">
            <div className="px-5 py-4 text-center text-gray-500">Loading settings...</div>
          </ComponentCard>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta title="Settings | Lapina Bakes Admin" description="Configure application settings" />
      <PageBreadcrumb pageTitle="Settings" />
      <div className="space-y-8">
        <ComponentCard title="Settings">
          <div className="p-6">
            <div className="space-y-6">
              {/* Payment Scanner Image */}
              <div>
                <Label htmlFor="payment_scanner" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Payment Scanner Image
                </Label>
                {paymentScannerSetting?.description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {paymentScannerSetting.description}
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  <FileInput
                    id="payment_scanner"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="flex-1 h-11"
                  />
                  <Button
                    onClick={handleSubmitPaymentScanner}
                    disabled={(updateMutation.isPending || createMutation.isPending) || !selectedImage}
                    className="px-4 py-2 shrink-0 h-11"
                  >
                    {(updateMutation.isPending || createMutation.isPending) ? "Uploading..." : "Update"}
                  </Button>
                </div>
                {imagePreview && (
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 mt-4">
                    <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Current Image:</p>
                    <div className="flex justify-center">
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Payment scanner preview"
                          className="max-w-full h-auto max-h-48 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Support Number */}
              <div>
                <Label htmlFor="support_number" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Support Number
                </Label>
                {supportNumberSetting?.description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {supportNumberSetting.description}
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  <InputField
                    id="support_number"
                    type="tel"
                    placeholder="Enter support number"
                    value={supportNumber}
                    onChange={(e) => setSupportNumber(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSubmitSupportNumber}
                    disabled={updateMutation.isPending || createMutation.isPending}
                    className="px-4 py-2 shrink-0 h-11"
                  >
                    {(updateMutation.isPending || createMutation.isPending) ? "Saving..." : "Update"}
                  </Button>
                </div>
              </div>

              {/* Support Email */}
              <div>
                <Label htmlFor="support_email" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Support Email
                </Label>
                {supportEmailSetting?.description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {supportEmailSetting.description}
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  <InputField
                    id="support_email"
                    type="email"
                    placeholder="Enter support email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSubmitSupportEmail}
                    disabled={updateMutation.isPending || createMutation.isPending}
                    className="px-4 py-2 shrink-0 h-11"
                  >
                    {(updateMutation.isPending || createMutation.isPending) ? "Saving..." : "Update"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
