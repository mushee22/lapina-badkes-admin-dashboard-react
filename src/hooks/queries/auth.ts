import { useQuery, useMutation } from "@tanstack/react-query";
import type { LoginRequest, LoginResponse, UserProfile } from "../../types/auth";
import * as api from "../../services/auth";

export const profileKey = ["profile"] as const;

export function useProfileQuery(options?: { enabled?: boolean }) {
  return useQuery<UserProfile>({
    queryKey: profileKey,
    queryFn: api.getProfile,
    enabled: options?.enabled,
  });
}

export function useLoginMutation() {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: (input) => api.login(input),
  });
}