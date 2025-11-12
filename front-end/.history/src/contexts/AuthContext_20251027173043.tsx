import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string, role?: string) => void;
  logout: () => void;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const tokenData = JSON.parse(localStorage.getItem('authToken') || 'null');
      if (tokenData && new Date().getTime() < tokenData.expiration) {
        setIsAuthenticated(true);
        setUserRole(tokenData.role || null);
      } else {
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      localStorage.removeItem('authToken');
    }
  }, []);

  const login = (token: string, role: string = 'user') => {
    const expiration = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 giờ
    const tokenData = { value: token, expiration, role };
    localStorage.setItem('authToken', JSON.stringify(tokenData));
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/'); // Về trang chủ sau khi logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, userRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
