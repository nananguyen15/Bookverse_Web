import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { ReactNode } from "react";

interface AdminOnlyRouteProps {
  children: ReactNode;
}

/**
 * Route wrapper that only allows ADMIN role
 * Redirects non-admin users to home page
 */
export function AdminOnlyRoute({ children }: AdminOnlyRouteProps) {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, redirect to signin
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Check if user has ADMIN role
  const hasAdminRole = user?.roles?.includes("ADMIN");
  
  if (!hasAdminRole) {
    alert("Access denied. This page is only accessible to administrators.");
    return <Navigate to="/" replace />;
  }

  // User is admin, allow access
  return <>{children}</>;
}
