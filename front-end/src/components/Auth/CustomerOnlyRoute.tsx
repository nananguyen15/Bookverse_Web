import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { ReactNode } from "react";

interface CustomerOnlyRouteProps {
  children: ReactNode;
}

/**
 * Route wrapper that only allows CUSTOMER role
 * Redirects ADMIN and STAFF to home page
 */
export function CustomerOnlyRoute({ children }: CustomerOnlyRouteProps) {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, redirect to signin
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // If user is ADMIN or STAFF, redirect to home
  const userRole = user?.role?.toLowerCase();
  if (userRole === "admin" || userRole === "staff") {
    alert("This page is only accessible to customers.");
    return <Navigate to="/" replace />;
  }

  // User is a customer, allow access
  return <>{children}</>;
}
