'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authService, User } from '@/services'

// User interface is now imported from services

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedToken = authService.getStoredToken()
    console.log('Initial token check:', storedToken)
    
    // Load user data from localStorage if available
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          console.log('User data loaded from localStorage:', userData)
        } catch (error) {
          console.error('Failed to parse stored user data:', error)
          localStorage.removeItem('user')
        }
      }
    }
    
    if (storedToken) {
      setToken(storedToken)
      // Verify token with backend
      verifyToken()
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async () => {
    try {
      console.log('Verifying token...')
      const userData = await authService.getCurrentUser()
      console.log('Token verification successful:', userData)
      setUser(userData)
      
      // Update localStorage with fresh user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData))
        console.log('User data updated in localStorage:', userData)
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      authService.logout()
      setToken(null)
      setUser(null)
      
      // Remove user data from localStorage on verification failure
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
        console.log('User data removed from localStorage due to verification failure')
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { token: newToken, user: userData } = await authService.login({ email, password })
      console.log('AuthContext received:', { newToken, userData })
      setToken(newToken)
      setUser(userData)
      
      // Save user data to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData))
        console.log('User data saved to localStorage:', userData)
      }
      
      console.log('AuthContext state updated, redirecting to dashboard')
      router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const signup = async (username: string, email: string, password: string) => {
    try {
      const { token: newToken, user: userData } = await authService.register({ username, email, password })
      setToken(newToken)
      setUser(userData)
      
      // Save user data to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData))
        console.log('User data saved to localStorage:', userData)
      }
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setToken(null)
    setUser(null)
    
    // Remove user data from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      console.log('User data removed from localStorage')
    }
    
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
