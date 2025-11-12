import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

interface User {
  username: string;
  email: string;
  role: string;
  fullName?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string, role?: string, username?: string) => void;
  logout: () => void;
  userRole: string | null;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          setIsAuthenticated(false);
          setUser(null);
          return;
        }

        const tokenData = JSON.parse(authToken);
        if (
          tokenData &&
          tokenData.expiration &&
          new Date().getTime() < tokenData.expiration
        ) {
          setIsAuthenticated(true);
          setUserRole(tokenData.role || "user");

          // Load user data from localStorage
          if (tokenData.username) {
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            const userData = users.find(
              (u: { username: string }) => u.username === tokenData.username
            );
            if (userData) {
              setUser({
                username: userData.username,
                email: userData.email,
                role: userData.role,
                fullName: userData.fullName,
              });
            }
          }
        } else {
          localStorage.removeItem("authToken");
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error parsing auth token:", error);
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  const login = (token: string, role: string = "user", username?: string) => {
    const expiration = new Date().getTime() + 24 * 60 * 60 * 1000;
    const tokenData = { value: token, expiration, role, username };
    localStorage.setItem("authToken", JSON.stringify(tokenData));
    setIsAuthenticated(true);
    setUserRole(role);

    // Load user data
    if (username) {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const userData = users.find(
        (u: { username: string }) => u.username === username
      );
      if (userData) {
        setUser({
          username: userData.username,
          email: userData.email,
          role: userData.role,
          fullName: userData.fullName,
        });
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, userRole, user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
