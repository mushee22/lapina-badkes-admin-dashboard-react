import { AdminUser, AdminUserInput } from "../types/userManagement";
import { AdminUserSchema, AdminUserCreateSchema } from "../types/userManagement";
import * as http from "./http";
import { Roles } from "../constants/roles";

export interface AdminUserListParams {
  page?: number;
  per_page?: number;
  role?: string;
  search?: string;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links: PaginationLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: PaginationMeta;
}

async function remoteGetAllAdminUsers(): Promise<AdminUser[]> {
  // Use the list function with admin role
  return remoteListAdminUsers({ role: Roles.Admin });
}

async function remoteListAdminUsers(params: AdminUserListParams): Promise<AdminUser[]> {
  const qs = new URLSearchParams();
  if (params.page !== undefined) qs.set("page", String(params.page));
  if (params.per_page !== undefined) qs.set("per_page", String(params.per_page));
  const role = params.role ?? Roles.Admin;
  if (role) qs.set("role", role);
  if (params.search) qs.set("search", params.search);
  const query = qs.toString();
  const path = query ? `/users?${query}` : "/users";
  const response = await http.get<AdminUser[] | PaginatedResponse<AdminUser>>(path);
  if (Array.isArray(response)) {
    return response;
  }
  if (response && typeof response === "object" && Array.isArray(response.data)) {
    return response.data;
  }
  return [];
}

async function remoteListAdminUsersPaginated(params: AdminUserListParams): Promise<PaginatedResponse<AdminUser>> {
  const qs = new URLSearchParams();
  if (params.page !== undefined) qs.set("page", String(params.page));
  if (params.per_page !== undefined) qs.set("per_page", String(params.per_page));
  const role = params.role ?? Roles.Admin;
  if (role) qs.set("role", role);
  if (params.search) qs.set("search", params.search);
  const query = qs.toString();
  const path = query ? `/users?${query}` : "/users";
  const response = await http.get<AdminUser[] | PaginatedResponse<AdminUser>>(path);
  if (Array.isArray(response)) {
    return { data: response };
  }
  if (response && typeof response === "object" && Array.isArray(response.data)) {
    return response;
  }
  return { data: [] };
}

async function remoteCreateAdminUser(input: AdminUserInput): Promise<AdminUser> {
  // The form/hook uses 'roles', but the validation schema expects 'role'.
  // Map to schema input before validating, then send single 'role' to API.
  const payloadForValidation = { ...input, role: (input.roles?.[0] ?? Roles.Admin) } as unknown;
  const validated = AdminUserCreateSchema.safeParse(payloadForValidation);
  if (!validated.success) {
    throw new Error("Invalid admin user create payload");
  }
  const { role, ...rest } = validated.data;
  const apiBody: Record<string, unknown> = { ...rest, role: role };
  const data = await http.post<unknown>("/users", apiBody);
  const parsed = AdminUserSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid admin user response after create");
  }
  return parsed.data as AdminUser;
}

async function remoteUpdateAdminUser(
  id: number,
  data: Partial<AdminUserInput>,
): Promise<AdminUser> {
  // Remap 'roles' array to single 'role' string if present for update payload
  const { roles, ...rest } = data;
  const roleValue = Array.isArray(roles) ? roles[0] : roles;
  const apiBody: Record<string, unknown> = roleValue !== undefined ? { ...rest, role: roleValue } : { ...rest };
  return http.put<AdminUser>(`/users/${id}`, apiBody);
}

async function remoteDeleteAdminUser(id: number): Promise<void> {
  await http.del(`/users/${id}`);
}

async function remoteSetActive(id: number, active: boolean): Promise<AdminUser> {
  return http.patch<AdminUser>(`/users/${id}`, { active });
}

export async function getAllAdminUsers(): Promise<AdminUser[]> {
  return remoteGetAllAdminUsers();
}

export async function listAdminUsers(params: AdminUserListParams): Promise<AdminUser[]> {
  return remoteListAdminUsers(params);
}

export async function listAdminUsersPaginated(params: AdminUserListParams): Promise<PaginatedResponse<AdminUser>> {
  return remoteListAdminUsersPaginated(params);
}

export async function createAdminUser(input: AdminUserInput): Promise<AdminUser> {
  return remoteCreateAdminUser(input);
}

export async function updateAdminUser(
  id: number,
  data: Partial<AdminUserInput>,
): Promise<AdminUser> {
  return remoteUpdateAdminUser(id, data);
}

export async function deleteAdminUser(id: number): Promise<void> {
  return remoteDeleteAdminUser(id);
}

export async function setActive(id: number, active: boolean): Promise<AdminUser> {
  return remoteSetActive(id, active);
}

export interface AssignUserLocationsInput {
  location_ids: number[];
  primary_location_id?: number;
}

export async function assignUserLocations(id: number, input: AssignUserLocationsInput): Promise<void> {
  await http.post<unknown>(`/users/${id}/locations`, input);
}

export interface DeliveryBoyListParams {
  page?: number;
  per_page?: number;
  is_active?: boolean;
  search?: string;
}

async function remoteListDeliveryBoysPaginated(params: DeliveryBoyListParams): Promise<PaginatedResponse<AdminUser>> {
  const qs = new URLSearchParams();
  if (params.page !== undefined) qs.set("page", String(params.page));
  if (params.per_page !== undefined) qs.set("per_page", String(params.per_page));
  if (params.is_active !== undefined) qs.set("is_active", String(params.is_active));
  if (params.search) qs.set("search", params.search);
  const query = qs.toString();
  const path = query ? `/delivery-boys?${query}` : "/delivery-boys";
  const response = await http.get<PaginatedResponse<AdminUser>>(path);
  if (response && typeof response === "object" && Array.isArray(response.data)) {
    return response;
  }
  return { data: [] };
}

async function remoteGetDeliveryBoy(id: number): Promise<AdminUser> {
  const response = await http.get<{ delivery_boy: AdminUser } | AdminUser>(`/delivery-boys/${id}`);
  // Handle wrapped response
  if (response && typeof response === "object" && "delivery_boy" in response) {
    return response.delivery_boy;
  }
  return response as AdminUser;
}

export async function listDeliveryBoysPaginated(params: DeliveryBoyListParams): Promise<PaginatedResponse<AdminUser>> {
  return remoteListDeliveryBoysPaginated(params);
}

export async function getDeliveryBoy(id: number): Promise<AdminUser> {
  return remoteGetDeliveryBoy(id);
}