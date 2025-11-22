import type { ReactNode } from "react";
import { useAuth } from "../../context/authContext.ts";
import GlobalLoader from "./GlobalLoader";

export default function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthLoading } = useAuth();
  if (isAuthLoading) {
    return <GlobalLoader />;
  }
  return <>{children}</>;
}