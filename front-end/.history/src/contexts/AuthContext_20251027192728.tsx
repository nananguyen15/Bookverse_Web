import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

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

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          setIsAuthenticated(false);
          return;
        }
        
        const tokenData = JSON.parse(authToken);
        if (tokenData && tokenData.expiration && new Date().getTime() < tokenData.expiration) {
          setIsAuthenticated(true);
          setUserRole(tokenData.role || 'user');
        } else {
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error parsing auth token:', error);
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = (token: string, role: string = 'user') => {
    const expiration = new Date().getTime() + 24 * 60 * 60 * 1000;
    const tokenData = { value: token, expiration, role };
    localStorage.setItem('authToken', JSON.stringify(tokenData));
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUserRole(null);
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
