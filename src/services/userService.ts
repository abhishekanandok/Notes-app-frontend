// Types
export interface User {
  id: string
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface SearchUsersResponse {
  count: number
  data: User[]
}

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  count?: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const useUserService = () => {
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

  /**
   * Search users by username or email
   */
  const searchUsers = async (query: string): Promise<ApiResponse<User[]>> => {
    try {
      console.log('API Call: Searching users', query)
      const response = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return handleApiResponse<User[]>(response, 'searchUsers')
    } catch (error: unknown) {
      console.error('API Error [searchUsers]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  return {
    searchUsers
  }
}

export default useUserService
