import { useEffect, useState, useCallback } from "react";``
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import ComponentCard from "../components/common/ComponentCard";
import Label from "../components/form/Label";
import InputField from "../components/form/input/InputField";
import FileInput from "../components/form/input/FileInput";
import Button from "../components/ui/button/Button";
import { useSettingsQuery, useUpdateSettingMutation, useCreateSettingMutation } from "../hooks/queries/settings";
import { useToast } from "../context/ToastContext";
import type { Setting } from "../types/setting";

function getLabelFromKey(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Settings() {
  const { data: settings = [], isLoading } = useSettingsQuery();
  const updateMutation = useUpdateSettingMutation();
  const createMutation = useCreateSettingMutation();
  const { showToast } = useToast();

  // Dynamic form state: one entry per setting key
  const [textValues, setTextValues] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<Record<string, File | null>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<string, string | null>>({});

  // Initialize all form values from API settings
  useEffect(() => {
    const initialText: Record<string, string> = {};
    const initialPreviews: Record<string, string | null> = {};
    for (const s of settings) {
      if (s.type === "text") {
        initialText[s.key] = s.value ?? "";
      }
      if (s.type === "image" && s.value) {
        initialPreviews[s.key] = s.value;
      }
    }
    setTextValues(initialText);
    setImagePreviews(initialPreviews);
  }, [settings]);

  const handleTextChange = useCallback((key: string, value: string) => {
    setTextValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleImageChange = useCallback(
    (key: string, event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          showToast("error", "Please select a valid image file", "Error");
          return;
        }
        setImageFiles((prev) => ({ ...prev, [key]: file }));
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => ({ ...prev, [key]: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    },
    [showToast]
  );

  const submitTextSetting = useCallback(
    (setting: Setting) => {
      const value = textValues[setting.key] ?? setting.value ?? "";
      const settingData = {
        key: setting.key,
        value,
        type: "text" as const,
        description: setting.description ?? null,
      };
      if (setting.id) {
        updateMutation.mutate({ ...settingData, id: setting.id });
      } else {
        createMutation.mutate(settingData);
      }
    },
    [textValues, updateMutation, createMutation]
  );

  const submitImageSetting = useCallback(
    (setting: Setting) => {
      const file = imageFiles[setting.key];
      if (!file) {
        showToast("error", "Please select an image", "Error");
        return;
      }
      const settingData = {
        key: setting.key,
        value: file,
        type: "image" as const,
        description: setting.description ?? null,
      };
      if (setting.id) {
        updateMutation.mutate(
          { ...settingData, id: setting.id },
          {
            onSuccess: () => {
              setImageFiles((prev) => ({ ...prev, [setting.key]: null }));
            },
          }
        );
      } else {
        createMutation.mutate(settingData, {
          onSuccess: () => {
            setImageFiles((prev) => ({ ...prev, [setting.key]: null }));
          },
        });
      }
    },
    [imageFiles, showToast, updateMutation, createMutation]
  );

  if (isLoading) {
    return (
      <>
        <PageMeta title="Settings | Lapina Bakers Admin" description="Configure application settings" />
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
      <PageMeta title="Settings | Lapina Bakers Admin" description="Configure application settings" />
      <PageBreadcrumb pageTitle="Settings" />
      <div className="space-y-8">
        <ComponentCard title="Settings">
          <div className="p-6">
            {settings.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                No settings found. Settings will appear here when returned by the API.
              </div>
            ) : (
              <div className="space-y-6">
                {settings.map((setting) => (
                  <div key={setting.key}>
                    <Label
                      htmlFor={setting.key}
                      className="text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      {getLabelFromKey(setting.key)}
                    </Label>
                    {setting.description && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {setting.description}
                      </p>
                    )}

                    {setting.type === "text" && (
                      <div className="flex gap-2 mt-2">
                        <InputField
                          id={setting.key}
                          type={setting.key.includes("email") ? "email" : setting.key.includes("number") ? "tel" : "text"}
                          placeholder={`Enter ${getLabelFromKey(setting.key).toLowerCase()}`}
                          value={textValues[setting.key] ?? setting.value ?? ""}
                          onChange={(e) => handleTextChange(setting.key, e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => submitTextSetting(setting)}
                          disabled={updateMutation.isPending || createMutation.isPending}
                          className="px-4 py-2 shrink-0 h-11"
                        >
                          {updateMutation.isPending || createMutation.isPending ? "Saving..." : "Update"}
                        </Button>
                      </div>
                    )}

                    {setting.type === "image" && (
                      <>
                        <div className="flex gap-2 mt-2">
                          <FileInput
                            id={setting.key}
                            onChange={(e) => handleImageChange(setting.key, e)}
                            accept="image/*"
                            className="flex-1 h-11"
                          />
                          <Button
                            onClick={() => submitImageSetting(setting)}
                            disabled={
                              (updateMutation.isPending || createMutation.isPending) || !imageFiles[setting.key]
                            }
                            className="px-4 py-2 shrink-0 h-11"
                          >
                            {updateMutation.isPending || createMutation.isPending ? "Uploading..." : "Update"}
                          </Button>
                        </div>
                        {imagePreviews[setting.key] && (
                          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 mt-4">
                            <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Current Image:
                            </p>
                            <div className="flex justify-center">
                              <img
                                src={imagePreviews[setting.key]!}
                                alt={`${getLabelFromKey(setting.key)} preview`}
                                className="max-w-full h-auto max-h-48 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
