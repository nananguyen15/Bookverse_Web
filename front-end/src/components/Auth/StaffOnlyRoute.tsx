import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { ReactNode } from "react";

interface StaffOnlyRouteProps {
  children: ReactNode;
}

/**
 * Route wrapper that only allows STAFF and ADMIN roles
 * Redirects customers and guests to home page
 */
export function StaffOnlyRoute({ children }: StaffOnlyRouteProps) {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, redirect to signin
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Check if user has STAFF or ADMIN role
  const hasStaffRole = user?.roles?.includes("STAFF") || user?.roles?.includes("ADMIN");
  
  if (!hasStaffRole) {
    alert("Access denied. This page is only accessible to staff members.");
    return <Navigate to="/" replace />;
  }

  // User is staff or admin, allow access
  return <>{children}</>;
}
