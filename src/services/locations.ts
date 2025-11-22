import * as http from "./http";
import { z } from "zod";
import { LocationSchema, CreateLocationSchema, UpdateLocationSchema } from "../types/location";
import type { Location, CreateLocationInput, UpdateLocationInput } from "../types/location";

export interface LocationListParams {
  search?: string;
}

export async function listLocations(params?: LocationListParams): Promise<Location[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  const query = qs.toString();
  const path = query ? `/locations?${query}` : "/locations";
  const payload = await http.get<unknown>(path);

  // Rely on HTTP status codes for success; be lenient on shape.
  // Prefer arrays; otherwise try common wrappers.
  if (Array.isArray(payload)) {
    return payload as Location[];
  }

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) {
      return obj.data as Location[];
    }
    if (Array.isArray(obj.locations)) {
      return obj.locations as Location[];
    }
    // Fallback: find the first array of objects and treat as rows
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
        return val as Location[];
      }
      if (Array.isArray(val) && val.length === 0) {
        return [];
      }
    }
  }

  // If shape is unexpected but the request succeeded, return empty list
  // instead of throwing, per user preference to avoid hard failures.
  return [];
}

export async function getLocation(id: number): Promise<Location> {
  const data = await http.get<unknown>(`/locations/${id}`);
  const parsed = LocationSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Invalid location response");
  }
  return parsed.data;
}

export async function createLocation(input: CreateLocationInput): Promise<Location> {
  const validated = CreateLocationSchema.safeParse(input);
  if (!validated.success) {
    throw new Error("Invalid location create payload");
  }
  const data = await http.post<unknown>("/locations", validated.data);
  // Accept either direct Location or wrapped { location, message }
  const direct = LocationSchema.safeParse(data);
  if (direct.success) {
    return direct.data;
  }
  const wrapped = z
    .object({ message: z.string().optional(), location: LocationSchema })
    .safeParse(data);
  if (wrapped.success) {
    return wrapped.data.location;
  }
  throw new Error("Invalid location response after create");
}

export async function updateLocation(id: number, input: UpdateLocationInput): Promise<Location> {
  const validated = UpdateLocationSchema.safeParse(input);
  if (!validated.success) {
    throw new Error("Invalid location update payload");
  }
  const data = await http.put<unknown>(`/locations/${id}`, validated.data);
  // Accept either direct Location or wrapped { location, message }
  const direct = LocationSchema.safeParse(data);
  if (direct.success) {
    return direct.data;
  }
  const wrapped = z
    .object({ message: z.string().optional(), location: LocationSchema })
    .safeParse(data);
  if (wrapped.success) {
    return wrapped.data.location;
  }
  throw new Error("Invalid location response after update");
}

export async function deleteLocation(id: number): Promise<void> {
  await http.del(`/locations/${id}`);
}