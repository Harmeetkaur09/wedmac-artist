// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  initialized: boolean; // tells when first check done
  login: (tokens: { access: string; refresh?: string; user?: User }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

// ✅ simple token valid check (just checks presence, no decode)
function isTokenPresent(token: string | null | undefined): boolean {
  return !!token;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const storedToken =
    typeof window !== "undefined" ? localstorage.getItem("accessToken") : null;
  const storedUser =
    typeof window !== "undefined" ? localstorage.getItem("user") : null;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    isTokenPresent(storedToken)
  );
  const [user, setUser] = useState<User | null>(() => {
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    setInitialized(true);
    const token = localstorage.getItem("accessToken");
    if (!isTokenPresent(token)) {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (data: { access: string; refresh?: string; user?: User }) => {
    if (data.access) {
      localstorage.setItem("accessToken", data.access);
    }
    if (data.refresh) {
      localstorage.setItem("refreshToken", data.refresh);
    }
    if (data.user) {
      localstorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    localstorage.removeItem("accessToken");
    localstorage.removeItem("refreshToken");
    localstorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, initialized, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
