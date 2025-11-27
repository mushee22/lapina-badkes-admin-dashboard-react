import * as http from "./http";
import type { Setting, UpdateSettingInput, CreateSettingInput } from "../types/setting";

export async function getSettings(): Promise<Setting[]> {
  const response = await http.get<Setting[] | { data: Setting[]; links?: unknown; meta?: unknown }>("/settings");
  
  // Handle paginated response with data, links, meta
  if (response && typeof response === "object" && "data" in response && Array.isArray(response.data)) {
    return response.data;
  }
  
  // Direct array response
  if (Array.isArray(response)) {
    return response;
  }
  
  return [];
}

export async function getSetting(key: string): Promise<Setting | null> {
  try {
    const response = await http.get<Setting | { data: Setting }>(`/settings/${key}`);
    
    // Handle wrapped response
    if (response && typeof response === "object" && "data" in response) {
      return response.data as Setting;
    }
    
    // Direct response
    return response as Setting;
  } catch {
    return null;
  }
}

export async function createSetting(input: CreateSettingInput): Promise<Setting> {
  // If the input value is a File, use FormData
  if (input.value instanceof File) {
    const formData = new FormData();
    formData.append("key", input.key);
    formData.append("type", input.type);
    formData.append("image", input.value);
    if (input.description) {
      formData.append("description", input.description);
    }
    
    const response = await http.postFormData<Setting | { data: Setting }>("/settings", formData);
    
    // Handle wrapped response
    if (response && typeof response === "object" && "data" in response) {
      return response.data as Setting;
    }
    
    // Direct response
    return response as Setting;
  }
  
  // For text values, use JSON
  const body = {
    key: input.key,
    value: input.value || null,
    type: input.type,
    description: input.description || null,
  };
  
  const response = await http.post<Setting | { data: Setting }>("/settings", body);
  
  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response) {
    return response.data as Setting;
  }
  
  // Direct response
  return response as Setting;
}

export async function updateSetting(input: UpdateSettingInput): Promise<Setting> {
  if (!input.id) {
    throw new Error("Setting ID is required for update");
  }
  
  const endpoint = `/settings/${input.id}`;
  
  // If the input value is a File, use FormData
  if (input.value instanceof File) {
    const formData = new FormData();
    formData.append("key", input.key);
    formData.append("type", input.type);
    formData.append("image", input.value);
    if (input.description) {
      formData.append("description", input.description);
    }
    
    const response = await http.putFormData<Setting | { data: Setting }>(endpoint, formData);
    
    // Handle wrapped response
    if (response && typeof response === "object" && "data" in response) {
      return response.data as Setting;
    }
    
    // Direct response
    return response as Setting;
  }
  
  // For text values, use JSON
  const body = {
    key: input.key,
    value: input.value || null,
    type: input.type,
    description: input.description || null,
  };
  
  const response = await http.put<Setting | { data: Setting }>(endpoint, body);
  
  // Handle wrapped response
  if (response && typeof response === "object" && "data" in response) {
    return response.data as Setting;
  }
  
  // Direct response
  return response as Setting;
}

