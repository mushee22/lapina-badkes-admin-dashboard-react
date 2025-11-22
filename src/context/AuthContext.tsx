import { useEffect, useMemo, useState, useCallback } from "react";
import type { ReactNode } from "react";
import * as auth from "../services/auth";
import type { LoginRequest, UserProfile } from "../types/auth";
import { getAuthToken } from "../config/api";
import { useQueryClient } from "@tanstack/react-query";
import { useProfileQuery, profileKey, useLoginMutation } from "../hooks/queries/auth";
import { AuthContext, AuthContextValueType } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [user, setUser] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const qc = useQueryClient();
  const loginMutation = useLoginMutation();

  const isAuthenticated = !!token;

  const profileQuery = useProfileQuery({ enabled: !!token });
  const { data: profile, isLoading: profileLoading, isSuccess: profileSuccess, isError: profileError } = profileQuery;
  const isAuthLoading = !!token && profileLoading;
  const isAuthReady = !token || profileSuccess || profileError;

  useEffect(() => {
    if (profile) {
      setUser(profile);
      setRoles(profile.roles ?? []);
      setPermissions(profile.permissions ?? []);
    }
  }, [profile]);

  // Handle profile API errors - clear auth and redirect to login
  useEffect(() => {
    if (profileError && token) {
      // Clear localStorage
      auth.logout();
      // Clear state
      setToken(null);
      setUser(null);
      setRoles([]);
      setPermissions([]);
      // Remove profile query
      qc.removeQueries({ queryKey: profileKey });
      // Redirect to login
      window.location.href = "/signin";
    }
  }, [profileError, token, qc]);

  const signIn = useCallback(async (payload: LoginRequest): Promise<void> => {
    const res = await loginMutation.mutateAsync(payload);
    setToken(res.token);
    setUser(res.user);
    setRoles(res.roles ?? []);
    setPermissions(res.permissions ?? []);
    await qc.invalidateQueries({ queryKey: profileKey });
  }, [loginMutation, qc]);

  const signOut = useCallback(() => {
    auth.logout();
    setToken(null);
    setUser(null);
    setRoles([]);
    setPermissions([]);
    qc.removeQueries({ queryKey: profileKey });
  }, [qc]);


  const refreshProfile = useCallback(async (): Promise<void> => {
    await qc.invalidateQueries({ queryKey: profileKey });
  }, [qc]);

  const value = useMemo<AuthContextValueType>(
    () => ({ token, user, roles, permissions, isAuthenticated, isAuthLoading, isAuthReady, signIn, signOut, refreshProfile }),
    [token, user, roles, permissions, isAuthenticated, isAuthLoading, isAuthReady, signIn, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}