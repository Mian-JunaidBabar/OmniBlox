import { redirect } from "next/navigation";

// Types for API responses
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  companyName?: string;
  workspaceUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

// Token management utilities
class TokenManager {
  private static ACCESS_TOKEN_KEY = "omniblox_access_token";
  private static REFRESH_TOKEN_KEY = "omniblox_refresh_token";
  private static USER_KEY = "omniblox_user";

  static getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static getUser(): User | null {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static setTokens(
    accessToken: string,
    refreshToken: string,
    user: User
  ): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    try {
      // Set a lightweight non-sensitive cookie so middleware can detect logged-in users during SSR.
      // This cookie does not contain tokens; it's just a presence flag used for redirecting.
      document.cookie = `omniblox_logged_in=1; path=/; max-age=${
        60 * 60 * 24 * 7
      }`; // 7 days
    } catch (e) {
      // ignore in environments where document isn't available
    }
  }

  static clearTokens(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    try {
      // Remove the presence cookie
      document.cookie = "omniblox_logged_in=; path=/; max-age=0";
    } catch (e) {
      // ignore
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getUser();
  }
}

// API Client with automatic token management
class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  }

  private async processQueue(error: any = null, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private async refreshToken(): Promise<string | null> {
    const refreshToken = TokenManager.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data: AuthResponse = await response.json();
      TokenManager.setTokens(data.accessToken, data.refreshToken, data.user);
      return data.accessToken;
    } catch (error) {
      TokenManager.clearTokens();
      throw error;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const accessToken = TokenManager.getAccessToken();

    // Add authorization header if token exists
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 errors with token refresh
      if (response.status === 401 && accessToken) {
        if (this.isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(() => {
            // Retry the original request with new token
            return this.request<T>(endpoint, options);
          });
        }

        this.isRefreshing = true;

        try {
          const newToken = await this.refreshToken();
          this.processQueue(null, newToken);
          this.isRefreshing = false;

          // Retry the original request with new token
          return this.request<T>(endpoint, options);
        } catch (refreshError) {
          this.processQueue(refreshError, null);
          this.isRefreshing = false;

          // Clear tokens and redirect to login
          TokenManager.clearTokens();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw refreshError;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.message || "An error occurred",
          statusCode: response.status,
        } as ApiError;
      }

      // Handle empty responses
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      }

      return response.text() as any;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw {
          message: "Network error. Please check your connection.",
          statusCode: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  // Auth endpoints
  async signup(data: {
    email: string;
    password: string;
    name: string;
    companyName: string;
    workspaceUrl: string;
    industry: string;
    otherIndustry?: string;
    country: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });

    TokenManager.setTokens(
      response.accessToken,
      response.refreshToken,
      response.user
    );
    return response;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    TokenManager.setTokens(
      response.accessToken,
      response.refreshToken,
      response.user
    );
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } catch {
      // Ignore errors on logout
    } finally {
      TokenManager.clearTokens();
    }
  }

  async getProfile(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  async updateProfile(data: {
    name?: string;
    companyName?: string;
    industry?: string;
    otherIndustry?: string;
    country?: string;
  }): Promise<User> {
    const user = await this.request<User>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });

    // Update stored user data
    TokenManager.setTokens(
      TokenManager.getAccessToken()!,
      TokenManager.getRefreshToken()!,
      user
    );

    return user;
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return this.request("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async validateToken(): Promise<{ valid: boolean; user: User }> {
    return this.request("/auth/validate");
  }

  // Generic API methods for other endpoints
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// Export singleton instance
export const api = new ApiClient();
export { TokenManager };

// Utility functions
export function isAuthenticated(): boolean {
  return TokenManager.isAuthenticated();
}

export function getCurrentUser(): User | null {
  return TokenManager.getUser();
}

export function requireAuth(): User {
  const user = getCurrentUser();
  if (!user || !isAuthenticated()) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Authentication required");
  }
  return user;
}
