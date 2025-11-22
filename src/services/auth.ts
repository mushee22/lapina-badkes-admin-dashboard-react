import { get, post } from "./http";
import type { LoginRequest, LoginResponse, UserProfile } from "../types/auth";

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const res = await post<LoginResponse>("/login", payload);

  try {
    localStorage.setItem("authToken", res.token);
  } catch {
    console.error("Failed to store authToken in localStorage");
  }

  return res;
}

export function logout(): void {
  try {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("roles");
    localStorage.removeItem("permissions");
  } catch {
    console.error("Failed to remove authToken from localStorage");
  }
}

export async function getProfile(): Promise<UserProfile> {
  const profile = await get<UserProfile>("/profile");
  return profile;
}