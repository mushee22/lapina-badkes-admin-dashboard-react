import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdminUser, AdminUserInput } from "../../types/userManagement";
import * as api from "../../services/adminUsers";
import type { AdminUserListParams, AssignUserLocationsInput, DeliveryBoyListParams } from "../../services/adminUsers";
import type { PaginatedResponse } from "../../services/adminUsers";
import { Roles } from "../../constants/roles";
import { useToast } from "../../context/ToastContext";

export const deliveryBoysKey = ["deliveryBoys"] as const;

export function useDeliveryBoysListQuery(params: AdminUserListParams) {
  const effectiveParams: AdminUserListParams = { ...params, role: params.role ?? Roles.DeliveryBoy };
  return useQuery<AdminUser[]>({
    queryKey: [...deliveryBoysKey, effectiveParams],
    queryFn: () => api.listAdminUsers(effectiveParams),
  });
}

export function useDeliveryBoysPaginatedQuery(params: DeliveryBoyListParams) {
  const { showToast } = useToast();
  return useQuery<PaginatedResponse<AdminUser>>({
    queryKey: [...deliveryBoysKey, "paginated", params],
    queryFn: async () => {
      try {
        const res = await api.listDeliveryBoysPaginated(params);
        return { data: Array.isArray(res.data) ? res.data : [], meta: res.meta };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load delivery boys";
        showToast("error", message, "Error");
        throw error;
      }
    },
    retry: false,
  });
}

export function useDeliveryBoyQuery(id: number | null) {
  const { showToast } = useToast();
  return useQuery<AdminUser>({
    queryKey: [...deliveryBoysKey, id],
    queryFn: async () => {
      try {
        if (!id) throw new Error("Delivery boy ID is required");
        return await api.getDeliveryBoy(id);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load delivery boy";
        showToast("error", message, "Error");
        throw error;
      }
    },
    enabled: !!id,
    retry: false,
  });
}

export function useCreateDeliveryBoyMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (input: AdminUserInput) => api.createAdminUser({ ...input, roles: input.roles ?? [Roles.DeliveryBoy] }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deliveryBoysKey });
      showToast("success", "Delivery boy created successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to create delivery boy";
      showToast("error", message, "Error");
    },
  });
}

export function useUpdateDeliveryBoyMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AdminUserInput> }) => api.updateAdminUser(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: deliveryBoysKey });
      qc.invalidateQueries({ queryKey: [...deliveryBoysKey, variables.id] });
      showToast("success", "Delivery boy updated successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to update delivery boy";
      showToast("error", message, "Error");
    },
  });
}

export function useDeleteDeliveryBoyMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (id: number) => api.deleteAdminUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deliveryBoysKey });
      showToast("success", "Delivery boy deleted successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to delete delivery boy";
      showToast("error", message, "Error");
    },
  });
}

export function useSetDeliveryBoyActiveMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => api.setActive(id, active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deliveryBoysKey });
      showToast("success", "User status updated successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to update user status";
      showToast("error", message, "Error");
    },
  });
}

export function useAssignDeliveryBoyLocationsMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: AssignUserLocationsInput }) => api.assignUserLocations(id, input),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: deliveryBoysKey });
      qc.invalidateQueries({ queryKey: [...deliveryBoysKey, variables.id] });
      showToast("success", "Locations assigned successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to assign locations";
      showToast("error", message, "Error");
    },
  });
}