import { createContext, useContext } from "react";
import type { LoginRequest, UserProfile } from "../types/auth";

export interface AuthContextValueType {
  token: string | null;
  user: UserProfile | null;
  roles: string[];
  permissions: string[];
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isAuthReady: boolean;
  signIn: (payload: LoginRequest) => Promise<void>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValueType | undefined>(undefined);

export function useAuth(): AuthContextValueType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}