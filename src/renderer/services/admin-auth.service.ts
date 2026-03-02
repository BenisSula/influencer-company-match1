import axios from 'axios';

// Get base URL and ensure /api prefix for REST calls
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  return envUrl ? `${envUrl}/api` : 'http://localhost:3000/api';
};

const API_URL = getApiUrl();

class AdminAuthService {
  async login(email: string, password: string) {
    console.log('AdminAuthService - Attempting login for:', email);
    
    const response = await axios.post(`${API_URL}/admin/auth/login`, {
      email,
      password,
    });
    
    console.log('AdminAuthService - Login successful:', response.data);
    return response.data;
  }

  async getProfile() {
    const token = localStorage.getItem('adminToken');
    const response = await axios.get(`${API_URL}/admin/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  logout() {
    console.log('AdminAuthService - Logging out');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }

  isAuthenticated(): boolean {
    const hasToken = !!localStorage.getItem('adminToken');
    console.log('AdminAuthService - isAuthenticated:', hasToken);
    return hasToken;
  }

  getAdminUser() {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  }
}

export const adminAuthService = new AdminAuthService();
