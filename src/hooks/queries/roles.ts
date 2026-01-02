import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../../services/roles";
import type { Role, RoleCreateInput, RoleListParams, RoleListResponse, RoleUpdateInput, PermissionsResponse } from "../../types/role";
import { useToast } from "../../context/ToastContext";

export const rolesKey = ["roles"] as const;
export const permissionsKey = ["permissions"] as const;

export function useRolesPaginatedQuery(params: RoleListParams) {
    const { showToast } = useToast();
    return useQuery<RoleListResponse>({
        queryKey: [...rolesKey, "paginated", params],
        queryFn: async () => {
            try {
                return await api.getRoles(params);
            } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to load roles";
                showToast("error", message, "Error");
                throw error;
            }
        },
        retry: false,
    });
}

export function usePermissionsQuery() {
    const { showToast } = useToast();
    return useQuery<PermissionsResponse>({
        queryKey: permissionsKey,
        queryFn: async () => {
            try {
                return await api.getPermissions();
            } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to load permissions";
                showToast("error", message, "Error");
                throw error;
            }
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
}

export function useRoleQuery(id: number, enabled: boolean = true) {
    const { showToast } = useToast();
    return useQuery<Role>({
        queryKey: [...rolesKey, id],
        queryFn: async () => {
            try {
                return await api.getRole(id);
            } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to load role";
                showToast("error", message, "Error");
                throw error;
            }
        },
        enabled,
    });
}

export function useCreateRoleMutation() {
    const qc = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: (input: RoleCreateInput) => api.createRole(input),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: rolesKey });
            showToast("success", "Role created successfully", "Success");
        },
        onError: (error: Error) => {
            const message = error.message || "Failed to create role";
            showToast("error", message, "Error");
        },
    });
}

export function useUpdateRoleMutation() {
    const qc = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: RoleUpdateInput }) => api.updateRole(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: rolesKey });
            showToast("success", "Role updated successfully", "Success");
        },
        onError: (error: Error) => {
            const message = error.message || "Failed to update role";
            showToast("error", message, "Error");
        },
    });
}

export function useDeleteRoleMutation() {
    const qc = useQueryClient();
    const { showToast } = useToast();

    return useMutation({
        mutationFn: (id: number) => api.deleteRole(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: rolesKey });
            showToast("success", "Role deleted successfully", "Success");
        },
        onError: (error: Error) => {
            const message = error.message || "Failed to delete role";
            showToast("error", message, "Error");
        },
    });
}
