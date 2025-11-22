import { API_BASE_URL, getAuthToken } from "../config/api";

interface RequestOptions extends RequestInit {
  json?: unknown;
}

type ErrorPayload = { message?: string };

function isErrorPayload(value: unknown): value is ErrorPayload {
  return typeof value === "object" && value !== null && "message" in value;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload: unknown = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      isJson && isErrorPayload(payload) && typeof payload.message === "string"
        ? payload.message
        : res.statusText;
    throw new Error(message || `HTTP ${res.status}`);
  }

  return payload as T;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getAuthToken();

  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
  });

  return handleResponse<T>(res);
}

export async function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "POST", json: body });
}

export async function put<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "PUT", json: body });
}

export async function patch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "PATCH", json: body });
}

export async function del(path: string): Promise<void> {
  await request(path, { method: "DELETE" });
}

export async function postFormData<T>(path: string, formData: FormData): Promise<T> {
  const headers = new Headers();
  const token = getAuthToken();
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  // Don't set Content-Type for FormData - browser will set it with boundary

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  return handleResponse<T>(res);
}