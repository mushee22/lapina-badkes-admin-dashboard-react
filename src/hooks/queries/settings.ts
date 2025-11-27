import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Setting, UpdateSettingInput, CreateSettingInput } from "../../types/setting";
import * as api from "../../services/settings";
import { useToast } from "../../context/ToastContext";

export const settingsKey = ["settings"] as const;

export function useSettingsQuery() {
  const { showToast } = useToast();
  
  return useQuery<Setting[]>({
    queryKey: settingsKey,
    queryFn: async () => {
      try {
        return await api.getSettings();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load settings";
        showToast("error", message, "Error");
        throw error;
      }
    },
    retry: false,
  });
}

export function useSettingQuery(key: string) {
  const { showToast } = useToast();
  
  return useQuery<Setting | null>({
    queryKey: [...settingsKey, key],
    queryFn: async () => {
      try {
        return await api.getSetting(key);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load setting";
        showToast("error", message, "Error");
        throw error;
      }
    },
    retry: false,
  });
}

export function useCreateSettingMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (input: CreateSettingInput) => api.createSetting(input),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: settingsKey });
      qc.invalidateQueries({ queryKey: [...settingsKey, variables.key] });
      showToast("success", "Setting created successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to create setting";
      showToast("error", message, "Error");
    },
  });
}

export function useUpdateSettingMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (input: UpdateSettingInput) => api.updateSetting(input),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: settingsKey });
      qc.invalidateQueries({ queryKey: [...settingsKey, variables.key] });
      showToast("success", "Setting updated successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to update setting";
      showToast("error", message, "Error");
    },
  });
}

