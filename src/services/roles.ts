import * as http from "./http";
import { Role, RoleCreateInput, RoleListParams, RoleListResponse, RoleUpdateInput, PermissionsResponse } from "../types/role";

export async function getRoles(params?: RoleListParams): Promise<RoleListResponse> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", params.page.toString());
    if (params?.per_page) qs.set("per_page", params.per_page.toString());
    if (params?.search) qs.set("search", params.search);

    const query = qs.toString();
    const path = query ? `/roles?${query}` : "/roles";
    return http.get<RoleListResponse>(path);
}

export async function createRole(data: RoleCreateInput): Promise<Role> {
    return http.post<Role>("/roles", data);
}

export async function getRole(id: number): Promise<Role> {
    // Assuming GET /roles/:id returns the Role object directly or wrapped.
    // Based on other API endpoints in this project, often the resource is returned directly.
    return http.get<Role>(`/roles/${id}`);
}

export async function updateRole(id: number, data: RoleUpdateInput): Promise<Role> {
    return http.put<Role>(`/roles/${id}`, data);
}

export async function deleteRole(id: number): Promise<void> {
    return http.del(`/roles/${id}`);
}

export async function getPermissions(): Promise<PermissionsResponse> {
    return http.get<PermissionsResponse>("/roles-permissions");
}
