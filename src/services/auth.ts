import { API_BASE_URL } from "@/utils/env";
import Cookies from 'js-cookie';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  // Adicione outros campos que a API retorna, se necessário
}

interface DecodedToken {
  name: string;
  email: string;
  pid: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha na autenticação');
      }

      const data: AuthResponse = await response.json();
      
      // Store token only in cookies
      Cookies.set('auth_token', data.token, { 
        expires: 7,
        secure: true,
        sameSite: 'strict'
      });
      
      return data.token;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  },

  async register(userData: RegisterData): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha no registro');
      }

      const data: AuthResponse = await response.json();
      
      // Store token only in cookies
      Cookies.set('auth_token', data.token, { 
        expires: 7,
        secure: true,
        sameSite: 'strict'
      });
      
      return data.token;
    } catch (error) {
      console.error('Erro ao registrar:', error);
      throw error;
    }
  },

  logout(): void {
    Cookies.remove('auth_token');
  },

  getToken(): string | null {
    return Cookies.get('auth_token') || null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  decodeToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const decoded = JSON.parse(jsonPayload);
      return {
        name: decoded.name,
        email: decoded.email,
        pid: decoded.pid
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },
};