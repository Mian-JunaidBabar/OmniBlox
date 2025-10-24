"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { api, TokenManager, User as ApiUser } from "@/lib/api";

type User = ApiUser & {
  permissions?: string[];
};

interface Company {
  id: string;
  name: string;
  workspaceUrl: string;
  industry?: string;
  country?: string;
}

interface AuthContextType {
  user: User | null;
  company: Company | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  workspaceUrl: string;
  industry: string;
  otherIndustry?: string;
  country: string;
}

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user && TokenManager.isAuthenticated();
  const pathname = usePathname();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = TokenManager.getUser();
        const accessToken = TokenManager.getAccessToken();
        const refreshToken = TokenManager.getRefreshToken();

        if (storedUser && accessToken && refreshToken) {
          // Validate token with backend
          try {
            const { user: validatedUser } = await api.validateToken();
            setUser({ ...validatedUser, permissions: ["all"] });
            setCompany(validatedUser.company || null);
          } catch (error: any) {
            // Only clear tokens on authentication errors (401/403)
            const statusCode = error?.statusCode || error?.status;
            if (statusCode === 401 || statusCode === 403) {
              TokenManager.clearTokens();
              setUser(null);
              setCompany(null);
            } else {
              // For non-auth errors (e.g., network/5xx), keep local session and defer
              setUser(storedUser as any);
              setCompany(storedUser.company || null);
            }
          }
        } else {
          TokenManager.clearTokens();
          setUser(null);
          setCompany(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        TokenManager.clearTokens();
        setUser(null);
        setCompany(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // If user is authenticated, redirect away from guest routes to dashboard
  useEffect(() => {
    if (isLoading) return;

    try {
      const guestPaths = new Set([
        "/",
        "/login",
        "/signup",
        "/forgot-password",
      ]);

      if (isAuthenticated && pathname) {
        // If current path is exactly a guest path, or is the index, redirect
        if (
          guestPaths.has(pathname) ||
          Array.from(guestPaths).some((p) => pathname.startsWith(p + "/"))
        ) {
          router.replace("/dashboard");
        }
      }
    } catch (err) {
      // swallow routing errors silently
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await api.login(email, password);
      setUser({ ...response.user, permissions: ["all"] });
      setCompany(response.company);
      router.push("/dashboard");
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupData): Promise<void> => {
    try {
      setIsLoading(true);
      // Transform the signup data to match the new API structure
      const signupData = {
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
        companyName: data.companyName,
        workspaceUrl: data.workspaceUrl,
        industry: data.industry,
        otherIndustry: data.otherIndustry,
        country: data.country,
      };
      const response = await api.signup(signupData);
      setUser({ ...response.user, permissions: ["all"] });
      setCompany(response.company);
      router.push("/dashboard");
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      await api.logout();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      TokenManager.clearTokens();
      setUser(null);
      setCompany(null);
      router.push("/login");
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: UpdateProfileData): Promise<void> => {
    try {
      // Transform the profile data to match the API structure
      const profileData = {
        name:
          data.firstName && data.lastName
            ? `${data.firstName} ${data.lastName}`
            : undefined,
      };
      const updatedUser = await api.updateProfile(profileData);
      setUser({ ...updatedUser, permissions: user?.permissions || ["all"] });
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    try {
      await api.changePassword(currentPassword, newPassword);
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const refreshedUser = await api.getProfile();
      setUser({ ...refreshedUser, permissions: user?.permissions || ["all"] });
      setCompany(refreshedUser.company || null);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    company,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Hook for requiring authentication
export function useRequireAuth(): User {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return null as any; // Loading state
  }

  if (!isAuthenticated || !user) {
    return null as any; // Will redirect
  }

  return user;
}
