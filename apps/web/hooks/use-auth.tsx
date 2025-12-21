// hooks/useAuth.ts
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: any;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      console.log("🔐 [USE-AUTH] Fetching user on mount...");
      
      try {
        // First try to get user normally
        const res = await axios.get("/api/auth/me");
        console.log("✅ [USE-AUTH] User fetched successfully:", res.data.user?.email);
        setUser(res.data.user);
        setError(null); // Clear any previous errors
      } catch (err: any) {
        console.log("❌ [USE-AUTH] Failed to fetch user:", err.response?.status, err.message);
        
        // If token is expired, try to refresh it
        if (err.response?.status === 401) {
          console.log("🔄 [USE-AUTH] Token might be expired, attempting refresh...");
          
          try {
            const refreshRes = await axios.post("/api/auth/refresh");
            console.log("✅ [USE-AUTH] Token refreshed successfully:", refreshRes.data.user?.email);
            setUser(refreshRes.data.user);
            setError(null); // Clear any previous errors
          } catch (refreshErr: any) {
            console.log("❌ [USE-AUTH] Token refresh failed:", refreshErr.response?.status);
            
            // If user not found (404), clear the token cookie
            if (refreshErr.response?.status === 404) {
              console.log("🗑️ [USE-AUTH] User not found in database, clearing token...");
              // Clear the token cookie by making logout request
              try {
                await axios.post("/api/auth/logout");
              } catch (logoutErr) {
                console.log("⚠️ [USE-AUTH] Logout request failed, but continuing...");
              }
            }
            
            setUser(null);
            setError("Session expired");
          }
        } else {
          setUser(null);
          setError(err.message);
        }
      } finally {
        setLoading(false);
        console.log("🔐 [USE-AUTH] Initial auth check complete", { 
          hasUser: !!user, 
          hasError: !!error 
        });
      }
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    console.log("🔐 [USE-AUTH] Attempting login for:", email);
    
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("📡 [USE-AUTH] Login response:", { status: res.status, success: data.success });

      if (!res.ok) {
        console.log("❌ [USE-AUTH] Login failed:", data.error);
        throw new Error(data.error || "Đăng nhập thất bại");
      }

      console.log("✅ [USE-AUTH] Login successful, fetching user data...");
      
      // Fetch updated user data
      const me = await fetch("/api/auth/me", { credentials: "include" });
      const meData = await me.json();

      if (meData.user) {
        setUser(meData.user);
        setError(null); // Clear any previous errors
        console.log("✅ [USE-AUTH] User set, redirecting to dashboard...");
        router.push("/dashboard");
      } else {
        console.log("❌ [USE-AUTH] Failed to fetch user after login");
        throw new Error("Failed to fetch user data");
      }
    } catch (err: any) {
      console.error("❌ [USE-AUTH] Login error:", err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };


  const loginWithGoogle = async (token: string) => {
    try {
      setLoading(true);
      const res = await axios.post("/api/auth/google", { token });
      setUser(res.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Google login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: any) => {
    console.log("🔐 [USE-AUTH] Attempting signup for:", data.email);
    
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();
      console.log("📡 [USE-AUTH] Signup response:", { status: res.status, success: responseData.success });

      if (!res.ok) {
        console.log("❌ [USE-AUTH] Signup failed:", responseData.error);
        throw new Error(responseData.error || "Signup failed");
      }

      console.log("✅ [USE-AUTH] Signup successful, fetching user data...");
      
      // Fetch user data after successful signup
      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      const meData = await meRes.json();

      if (meData.user) {
        setUser(meData.user);
        console.log("✅ [USE-AUTH] User set after signup, redirecting to login...");
        router.push("/login");
      } else {
        console.log("❌ [USE-AUTH] Failed to fetch user after signup");
        throw new Error("Failed to fetch user data");
      }
    } catch (err: any) {
      console.error("❌ [USE-AUTH] Signup error:", err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      await axios.post("/api/auth/forgot-password", { email });
    } catch (err: any) {
      setError(err.response?.data?.message || "Request failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setLoading(true);
      await axios.post("/api/auth/reset-password", { token, newPassword });
    } catch (err: any) {
      setError(err.response?.data?.message || "Reset failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log("🔐 [USE-AUTH] Logging out user...");
    
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      
      setUser(null);
      setError(null);
      console.log("✅ [USE-AUTH] Logout successful, redirecting to login...");
      router.push("/login");
    } catch (err) {
      console.error("❌ [USE-AUTH] Logout error:", err);
      // Still clear user state even if logout API fails
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        loginWithGoogle,
        signup,
        forgotPassword,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}