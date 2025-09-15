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
    typeof window !== "undefined"
      ? sessionStorage.getItem("accessToken")
      : null;
  const storedUser =
    typeof window !== "undefined" ? sessionStorage.getItem("user") : null;

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
  const token = sessionStorage.getItem("accessToken");
  const storedUser = sessionStorage.getItem("user");
  if (token) {
    setIsAuthenticated(true);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    } else {
      // Agar ReceiveToken ne sirf id save ki hai
      const uid = sessionStorage.getItem("user_id");
      if (uid) {
        setUser({ id: uid, email: "", role: "artist" });
      }
    }
  } else {
    setIsAuthenticated(false);
  }
  setInitialized(true);
}, []);


  const login = (data: { access: string; refresh?: string; user?: User }) => {
    if (data.access) {
      sessionStorage.setItem("accessToken", data.access);
    }
    if (data.refresh) {
      sessionStorage.setItem("refreshToken", data.refresh);
    }
    if (data.user) {
      sessionStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
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
