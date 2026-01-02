
export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at?: string;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions: Permission[]; // In listing, it's Permission[]. In details, might be similar.
    permission_names?: string[]; // Helper from API for quick checks
    permission_count?: number;
    is_system_role?: boolean;
    created_at: string;
    updated_at: string;
}

export interface RoleCreateInput {
    name: string;
    guard_name?: string;
    permissions: number[]; // Array of permission IDs
    description?: string;
}

export interface RoleUpdateInput {
    name?: string;
    guard_name?: string;
    permissions?: number[];
    description?: string;
}

export interface RoleListParams {
    page?: number;
    per_page?: number;
    search?: string;
}

export interface PermissionsResponse {
    permissions: {
        [category: string]: Permission[];
    };
}

export interface RoleListResponse {
    roles: Role[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
