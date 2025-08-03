import React, { createContext, useContext, useState, useEffect } from "react";
import { decodeJwt } from "jwt-decode"; // or any JWT helper

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: (tokens: { access: string; refresh: string; user: any }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    const storedUser = sessionStorage.getItem("user");
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (data: { access: string; refresh: string; user: any }) => {
    sessionStorage.setItem("accessToken", data.access);
    sessionStorage.setItem("refreshToken", data.refresh);
    sessionStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
