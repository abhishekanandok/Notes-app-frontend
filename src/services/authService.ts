import BaseService from './base'
import { API_CONFIG, ApiResponse, User } from './config'

export interface RegisterData {
  email: string
  username: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

class AuthService extends BaseService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      data
    )

    if (response.success && response.data) {
      // Store token automatically
      this.setToken(response.data.token)
      return response.data
    }

    throw new Error(response.error || 'Registration failed')
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      data
    )

    if (response.success && response.data) {
      // Store token automatically
      this.setToken(response.data.token)
      return response.data
    }

    throw new Error(response.error || 'Login failed')
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.get<{ user: User }>(
      API_CONFIG.ENDPOINTS.AUTH.ME
    )

    if (response.success && response.data) {
      return response.data.user
    }

    throw new Error(response.error || 'Failed to get user information')
  }

  /**
   * Verify if token is valid
   */
  async verifyToken(): Promise<boolean> {
    try {
      await this.getCurrentUser()
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Logout user (remove token)
   */
  logout(): void {
    this.removeToken()
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getStoredToken()
  }
}

export default new AuthService()
