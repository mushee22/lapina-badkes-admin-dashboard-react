export const API_BASE_URL = (import.meta.env.VITE_ADMIN_API_BASE_URL as string) ?? "http://13.51.27.25/api/admin";

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem("authToken");
  } catch {
    return null;
  }
}