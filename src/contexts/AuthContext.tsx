'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import useAuthService from '@/services/authService'
import type { User } from '@/services/authService'

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
  const authService = useAuthService()
  const hasInitialized = useRef(false)

  const verifyToken = useCallback(async () => {
    try {
      console.log('Verifying token...')
      const result = await authService.getCurrentUser()
      console.log('Verify token result:', result)
      
      if (result.success) {
        // Check if user data exists in result.user (direct) or result.data.user (nested)
        const userData = (result as unknown as { user?: User }).user || (result.data as unknown as { user?: User })?.user
        
        if (userData) {
          console.log('Token verification successful:', userData)
          setUser(userData)
          
          // Update localStorage with fresh user data
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(userData))
            console.log('User data updated in localStorage:', userData)
          }
        } else {
          throw new Error('No user data received')
        }
      } else {
        throw new Error(result.error || 'Token verification failed')
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
  }, [authService])

  useEffect(() => {
    // Only run initialization once
    if (hasInitialized.current) return
    hasInitialized.current = true

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.login({ email, password })
      console.log('AuthContext received result:', result)
      
      if (result.success) {
        // Token is already stored by authService, get it from there
        const token = authService.getStoredToken()
        
        // Check if user data exists in result.user (direct) or result.data.user (nested)
        const userData = (result as unknown as { user?: User }).user || (result.data as unknown as { user?: User })?.user
        
        if (userData) {
          console.log('AuthContext received user data:', userData)
          setToken(token)
          setUser(userData)
          
          // Save user data to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(userData))
            console.log('User data saved to localStorage:', userData)
          }
          
          console.log('AuthContext state updated, redirecting to dashboard')
          router.push('/dashboard')
        } else {
          throw new Error('No user data received')
        }
      } else {
        throw new Error(result.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const signup = async (username: string, email: string, password: string) => {
    try {
      const result = await authService.register({ username, email, password })
      console.log('AuthContext received signup result:', result)
      
      if (result.success) {
        // Token is already stored by authService, get it from there
        const token = authService.getStoredToken()
        
        // Check if user data exists in result.user (direct) or result.data.user (nested)
        const userData = (result as unknown as { user?: User }).user || (result.data as unknown as { user?: User })?.user
        
        if (userData) {
          setToken(token)
          setUser(userData)
          
          // Save user data to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(userData))
            console.log('User data saved to localStorage:', userData)
          }
          
          router.push('/dashboard')
        } else {
          throw new Error('No user data received')
        }
      } else {
        throw new Error(result.error || 'Registration failed')
      }
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
