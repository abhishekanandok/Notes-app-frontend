
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

    // The response is the direct API response: { success: true, token: "...", user: {...} }
    if (response.success && response.token && response.user) {
      // Store token automatically
      this.setToken(response.token)
      return {
        token: response.token,
        user: response.user
      }
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
    console.log('Login response:', response)

    // The response is the direct API response: { success: true, token: "...", user: {...} }
    if (response.success && response.token && response.user) {
      // Store token automatically
      this.setToken(response.token)
      console.log('Token stored:', response.token)
      return {
        token: response.token,
        user: response.user
      }
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

    // The response is the direct API response: { success: true, user: {...} }
    if (response.success && response.user) {
      return response.user
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
