import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";

// Component to handle unauthorized access
function UnauthorizedAccess({ userRole, allowedRoles }: { userRole: string | null; allowedRoles: string[] }) {
  const navigate = useNavigate();
  const [hasShownAlert, setHasShownAlert] = useState(false);

  useEffect(() => {
    if (!hasShownAlert) {
      alert(
        `⚠️ Access Denied\n\nYou don't have permission to access this page.\nYour role: ${userRole || 'Unknown'}\nRequired roles: ${allowedRoles.join(", ")}`
      );
      setHasShownAlert(true);
      navigate(-1); // Go back to previous page
    }
  }, [hasShownAlert, navigate, userRole, allowedRoles]);

  return null;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // Nếu không truyền = tất cả user đã login
}

/**
 * Protected Route Component
 *
 * Chức năng:
 * 1. Kiểm tra user đã đăng nhập chưa (có JWT token hợp lệ không)
 * 2. Kiểm tra role của user có quyền truy cập không
 *
 * Sử dụng:
 * - Wrap component cần bảo vệ
 * - Truyền allowedRoles nếu muốn giới hạn theo role
 *
 * @example
 * // Chỉ cho phép user đã login
 * <ProtectedRoute>
 *   <ProfilePage />
 * </ProtectedRoute>
 *
 * @example
 * // Chỉ cho phép ADMIN
 * <ProtectedRoute allowedRoles={["ADMIN"]}>
 *   <AdminDashboard />
 * </ProtectedRoute>
 *
 * @example
 * // Cho phép ADMIN và STAFF
 * <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
 *   <StaffPanel />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, userRole, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Đang loading → Show loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin border-beige-700"></div>
          <p className="mt-4 text-beige-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập → Redirect to signin
  if (!isAuthenticated) {
    console.log("🚫 Access denied: User not authenticated");
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Đã đăng nhập, kiểm tra role (nếu có yêu cầu)
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      console.log(
        `🚫 Access denied: User role "${userRole}" not in allowed roles:`,
        allowedRoles
      );

      // Show alert and redirect to home
      useEffect(() => {
        alert(
          `⚠️ Access Denied\n\nYou don't have permission to access this page.\nYour role: ${userRole}\nRequired roles: ${allowedRoles.join(", ")}`
        );
        navigate("/", { replace: true });
      }, []);

      return null;
    }
  }

  // OK → Cho phép truy cập
  console.log(`✅ Access granted: User role "${userRole}"`);
  return <>{children}</>;
}

/**
 * Role-specific wrappers for convenience
 */

// Chỉ cho CUSTOMER
export function CustomerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>{children}</ProtectedRoute>
  );
}

// Chỉ cho STAFF
export function StaffRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={["STAFF"]}>{children}</ProtectedRoute>;
}

// Chỉ cho ADMIN
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={["ADMIN"]}>{children}</ProtectedRoute>;
}

// Cho ADMIN và STAFF
export function AdminOrStaffRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
      {children}
    </ProtectedRoute>
  );
}
