import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Location, CreateLocationInput, UpdateLocationInput } from "../../types/location";
import { listLocations, getLocation, createLocation, updateLocation, deleteLocation } from "../../services/locations";
import type { LocationListParams } from "../../services/locations";
import { useToast } from "../../context/ToastContext";

export const locationsKey = ["locations"] as const;

export function useLocationsQuery(params?: LocationListParams) {
  const { showToast } = useToast();
  const effectiveParams = params ?? {};
  return useQuery<Location[]>({
    queryKey: [...locationsKey, effectiveParams],
    queryFn: async () => {
      try {
        const rows = await listLocations(effectiveParams);
        return Array.isArray(rows) ? rows : [];
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load locations";
        showToast("error", message, "Error");
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useLocationQuery(id: number | null) {
  return useQuery<Location>({ queryKey: [...locationsKey, id], queryFn: () => getLocation(Number(id)), enabled: !!id });
}

export function useCreateLocationMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (input: CreateLocationInput) => createLocation(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: locationsKey });
      showToast("success", "Location created successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to create location";
      showToast("error", message, "Error");
    },
  });
}

export function useUpdateLocationMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLocationInput }) => updateLocation(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: locationsKey });
      qc.invalidateQueries({ queryKey: [...locationsKey, id] });
      showToast("success", "Location updated successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to update location";
      showToast("error", message, "Error");
    },
  });
}

export function useDeleteLocationMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: (id: number) => deleteLocation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: locationsKey });
      showToast("success", "Location deleted successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to delete location";
      showToast("error", message, "Error");
    },
  });
}

export function useSetLocationStatusMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) => updateLocation(id, { is_active }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: locationsKey });
      qc.invalidateQueries({ queryKey: [...locationsKey, id] });
      showToast("success", "Location status updated", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to update location status";
      showToast("error", message, "Error");
    },
  });
}