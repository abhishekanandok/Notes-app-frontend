
// Types
export interface User {
  id: string
  email: string
  username: string
  createdAt: string
}

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

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  count?: number
  token?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const useAuthService = () => {
  const getAuthHeaders = () => {
    const token = getToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  const handleApiResponse = async <T>(response: Response, endpoint: string): Promise<ApiResponse<T>> => {
    const data = await response.json()
    
    console.log(`API Response [${endpoint}]:`, data)
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'An error occurred')
    }
    
    return data
  }

  const getToken = (): string | null => {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';')
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='))
      return tokenCookie ? tokenCookie.split('=')[1] : null
    }
    return null
  }

  const setToken = (token: string): void => {
    if (typeof document !== 'undefined') {
      // Set cookie with 7 days expiration
      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + 7)
      
      // Use secure flag only in production
      const isProduction = process.env.NODE_ENV === 'production'
      const secureFlag = isProduction ? '; secure' : ''
      
      document.cookie = `token=${token}; expires=${expirationDate.toUTCString()}; path=/; samesite=strict${secureFlag}`
      console.log('Token saved to cookies:', token)
    } else {
      console.log('Document is undefined, cannot save token')
    }
  }

  const removeToken = (): void => {
    if (typeof document !== 'undefined') {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    }
  }

  const getStoredToken = (): string | null => {
    return getToken()
  }
  /**
   * Register a new user
   */
  const register = async (data: RegisterData): Promise<ApiResponse<AuthResponse>> => {
    try {
      console.log('API Call: Registering user', data)
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      
      const result = await handleApiResponse<AuthResponse>(response, 'register')
      
      // Store token automatically if registration successful
      if (result.success && result.token) {
        setToken(result.token)
      }
      
      return result
    } catch (error: unknown) {
      console.error('API Error [register]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  /**
   * Login user
   */
  const login = async (data: LoginData): Promise<ApiResponse<AuthResponse>> => {
    try {
      console.log('API Call: Logging in user', data)
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      
      const result = await handleApiResponse<AuthResponse>(response, 'login')
      
      // Store token automatically if login successful
      if (result.success && result.token) {
        setToken(result.token)
        console.log('Token stored:', result.token)
      }
      
      return result
    } catch (error: unknown) {
      console.error('API Error [login]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  /**
   * Get current user information
   */
  const getCurrentUser = async (): Promise<ApiResponse<User>> => {
    try {
      console.log('API Call: Getting current user')
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return handleApiResponse<User>(response, 'getCurrentUser')
    } catch (error: unknown) {
      console.error('API Error [getCurrentUser]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  /**
   * Verify if token is valid
   */
  const verifyToken = async (): Promise<boolean> => {
    try {
      const result = await getCurrentUser()
      return result.success
    } catch {
      return false
    }
  }

  /**
   * Logout user (remove token)
   */
  const logout = (): void => {
    removeToken()
  }

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = (): boolean => {
    return !!getStoredToken()
  }

  return {
    register,
    login,
    getCurrentUser,
    verifyToken,
    logout,
    isAuthenticated,
    getToken,
    setToken,
    removeToken,
    getStoredToken
  }
}

export default useAuthService
