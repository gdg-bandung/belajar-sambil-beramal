import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useFetcher } from "react-router";

export type UserRole = "speaker" | "admin" | "superadmin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  role: UserRole | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const fetcher = useFetcher();

  // Check for active session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/me");
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    console.warn("Manual login call deprecated in favor of Route Actions.");
  };

  const register = async (name: string, email: string, password: string) => {
    console.warn("Manual register call deprecated in favor of Route Actions.");
  };

  const logout = () => {
    fetcher.submit(null, { method: "post", action: "/logout" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin" || user?.role === "superadmin",
      role: user?.role || null,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
