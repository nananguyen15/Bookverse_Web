import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { authApi } from "../api/endpoints/auth.api";

interface User {
  id: string;
  username: string;
  email: string;
  roles: string[]; // Backend trả về array of roles
  active: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  userRole: string | null; // Primary role
  user: User | null;
  isLoading: boolean;
  hasRole: (role: string) => boolean; // Helper function để check role
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Lấy JWT từ localStorage (cái "vé")
        const token = localStorage.getItem("token");

        if (!token) {
          // Không có vé → chưa đăng nhập
          setIsAuthenticated(false);
          setUser(null);
          setUserRole(null);
          setIsLoading(false);
          return;
        }

        // Có vé → Kiểm tra vé còn hiệu lực không (introspect)
        console.log("🔍 Verifying JWT token...");
        const introspectResult = await authApi.introspect({ token });

        if (!introspectResult.valid) {
          // Vé hết hạn hoặc không hợp lệ → xóa vé, logout
          console.log("❌ Token invalid or expired, logging out...");
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setUser(null);
          setUserRole(null);
          setIsLoading(false);
          return;
        }

        // Vé còn hiệu lực → Lấy thông tin user
        console.log("✅ Token valid, fetching user info...");
        const userInfo = await authApi.getMyInfo();

        // Get primary role (first role in array or highest priority)
        const primaryRole = getPrimaryRole(userInfo.roles);

        setIsAuthenticated(true);
        setUser(userInfo);
        setUserRole(primaryRole);
        console.log("✅ User authenticated:", userInfo, "Primary role:", primaryRole);
      } catch (error) {
        // Lỗi khi verify token → Logout
        console.error("❌ Token verification failed:", error);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = (token: string, userData: User) => {
    // Lưu JWT token (cái "vé") vào localStorage
    localStorage.setItem("token", token);

    // Get primary role
    const primaryRole = getPrimaryRole(userData.roles);

    // Cập nhật state
    setIsAuthenticated(true);
    setUser(userData);
    setUserRole(primaryRole);

    console.log("✅ Login successful, token saved, primary role:", primaryRole);
  };

  // Helper function để check xem user có role cụ thể không
  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) || false;
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, userRole, user, isLoading, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Helper function để lấy primary role (theo thứ tự ưu tiên)
function getPrimaryRole(roles: string[]): string {
  if (!roles || roles.length === 0) return "CUSTOMER";
  
  // Priority: ADMIN > STAFF > CUSTOMER
  if (roles.includes("ADMIN")) return "ADMIN";
  if (roles.includes("STAFF")) return "STAFF";
  if (roles.includes("CUSTOMER")) return "CUSTOMER";
  
  // Default: return first role
  return roles[0];
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
