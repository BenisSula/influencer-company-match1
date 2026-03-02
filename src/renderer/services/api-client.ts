import { apiCache } from '../utils/apiCache';

interface CacheOptions {
  useCache?: boolean;
  ttl?: number;
}

// Navigation handler that can be set by the App component
let navigateHandler: ((path: string) => void) | null = null;

export const setNavigateHandler = (handler: (path: string) => void) => {
  navigateHandler = handler;
};

// Helper to navigate without full page reload
const navigateTo = (path: string) => {
  if (navigateHandler) {
    navigateHandler(path);
  } else {
    // Fallback to window.location if no handler is set
    window.location.href = path;
  }
};

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    // Get base URL from env, default to localhost with /api prefix
    const envUrl = import.meta.env.VITE_API_URL;
    // Always append /api for REST API calls
    this.baseURL = envUrl ? `${envUrl}/api` : 'http://localhost:3000/api';
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    // Clear cache on logout
    apiCache.clear();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheOptions?: CacheOptions,
  ): Promise<T> {
    // Check cache for GET requests
    if (options.method === 'GET' && cacheOptions?.useCache) {
      const cached = apiCache.get<T>(endpoint);
      if (cached) {
        return cached;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      
      // Create a proper error object with response data
      const apiError: any = new Error(error.message || `HTTP ${response.status}`);
      apiError.status = response.status;
      apiError.response = {
        status: response.status,
        data: error,
      };
      
      // Only trigger logout for auth-related endpoints with 401
      // Don't logout for analytics, feed, or other non-critical endpoints
      if (response.status === 401 && (
        endpoint.includes('/auth/profile') || 
        endpoint.includes('/auth/login') ||
        endpoint.includes('/auth/register')
      )) {
        console.log('[ApiClient] Auth endpoint returned 401, token is invalid');
        this.clearToken();
        // Navigate to login using React Router (or fallback to window.location)
        navigateTo('/');
      }
      
      throw apiError;
    }

    const data = await response.json();

    // Cache GET responses
    if (options.method === 'GET' && cacheOptions?.useCache) {
      apiCache.set(endpoint, data, cacheOptions.ttl);
    }

    return data;
  }

  async get<T>(endpoint: string, cacheOptions?: CacheOptions): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, cacheOptions);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
