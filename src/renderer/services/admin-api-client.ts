/**
 * Admin API Client
 * Dedicated API client for admin dashboard with proper admin token handling
 */

// Navigation handler that can be set by the App component
let adminNavigateHandler: ((path: string) => void) | null = null;

export const setAdminNavigateHandler = (handler: (path: string) => void) => {
  adminNavigateHandler = handler;
};

// Helper to navigate without full page reload
const adminNavigateTo = (path: string) => {
  if (adminNavigateHandler) {
    adminNavigateHandler(path);
  } else {
    // Fallback to window.location if no handler is set
    window.location.href = path;
  }
};

class AdminApiClient {
  private baseURL: string;

  constructor() {
    const envUrl = import.meta.env.VITE_API_URL;
    this.baseURL = envUrl ? `${envUrl}/api` : 'http://localhost:3000/api';
  }

  getAdminToken(): string | null {
    return localStorage.getItem('adminToken');
  }

  clearAdminToken() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getAdminToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP ${response.status}`,
        }));

        // Handle admin authentication errors - don't auto-redirect, just throw error
        // Let the caller handle 401 as they see fit
        const apiError: any = new Error(error.message || `HTTP ${response.status}`);
        apiError.status = response.status;
        apiError.response = {
          status: response.status,
          data: error,
        };

        throw apiError;
      }

      return await response.json();
    } catch (error: any) {
      // Network errors or other issues
      if (!error.response) {
        console.error('[AdminApiClient] Network error:', error.message);
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params 
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return this.request<T>(endpoint + queryString, { method: 'GET' });
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

  async uploadFile<T>(endpoint: string, file: File, fieldName: string = 'file'): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const token = this.getAdminToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}`,
      }));

      // Don't auto-redirect on 401 - let caller handle it
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  }
}

export const adminApiClient = new AdminApiClient();
