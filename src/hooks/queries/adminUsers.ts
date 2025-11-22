import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdminUser, AdminUserInput } from "../../types/userManagement";
import * as api from "../../services/adminUsers";
import type { AdminUserListParams } from "../../services/adminUsers";
import type { PaginatedResponse } from "../../services/adminUsers";
import { Roles } from "../../constants/roles";
import { useToast } from "../../context/ToastContext";

export const adminUsersKey = ["adminUsers"] as const;

export function useAdminUsersQuery() {
  const { showToast } = useToast();
  
  return useQuery<AdminUser[]>({ 
    queryKey: adminUsersKey, 
    queryFn: async () => {
      try {
        const data = await api.getAllAdminUsers();
        // Ensure we always return an array
        return Array.isArray(data) ? data : [];
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load admin users";
        showToast("error", message, "Error");
        throw error;
      }
    },
    retry: false,
  });
}

export function useAdminUsersListQuery(params: AdminUserListParams) {
  const effectiveParams: AdminUserListParams = { ...params, role: params.role ?? Roles.Admin };
  return useQuery<AdminUser[]>({
    queryKey: [...adminUsersKey, effectiveParams],
    queryFn: () => api.listAdminUsers(effectiveParams),
  });
}

export function useAdminUsersPaginatedQuery(params: AdminUserListParams) {
  const effectiveParams: AdminUserListParams = { ...params, role: params.role ?? Roles.Admin };
  const { showToast } = useToast();
  return useQuery<PaginatedResponse<AdminUser>>({
    queryKey: [...adminUsersKey, "paginated", effectiveParams],
    queryFn: async () => {
      try {
        const res = await api.listAdminUsersPaginated(effectiveParams);
        return { data: Array.isArray(res.data) ? res.data : [], meta: res.meta };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load admin users";
        showToast("error", message, "Error");
        throw error;
      }
    },
    retry: false,
  });
}

export function useCreateAdminUserMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: (input: AdminUserInput) => api.createAdminUser(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminUsersKey });
      showToast("success", "Admin user created successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to create admin user";
      showToast("error", message, "Error");
    },
  });
}

export function useUpdateAdminUserMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AdminUserInput> }) => api.updateAdminUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminUsersKey });
      showToast("success", "Admin user updated successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to update admin user";
      showToast("error", message, "Error");
    },
  });
}

export function useDeleteAdminUserMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: (id: number) => api.deleteAdminUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminUsersKey });
      showToast("success", "Admin user deleted successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to delete admin user";
      showToast("error", message, "Error");
    },
  });
}

export function useSetActiveMutation() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => api.setActive(id, active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminUsersKey });
      showToast("success", "User status updated successfully", "Success");
    },
    onError: (error: Error) => {
      const message = error.message || "Failed to update user status";
      showToast("error", message, "Error");
    },
  });
}