'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotes } from '@/contexts/NotesContext'
import { Navbar } from '@/components/Navbar'
import { FolderList } from '@/components/FolderList'
import { NoteList } from '@/components/NoteList'
import { SearchBar } from '@/components/SearchBar'
import { useRouter } from 'next/navigation'
import { API_CONFIG } from '@/lib/config'

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth()
  const { folders, setLoading } = useNotes()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login')
    }
  }, [token, authLoading, router])

  useEffect(() => {
    if (token) {
      fetchFolders()
    }
  }, [token])

  const fetchFolders = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FOLDERS}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Update folders in context
        // This would be implemented in the NotesContext
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="p-4">
            <SearchBar />
          </div>
          <FolderList />
        </div>
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome back, {user.name}
            </h1>
            <NoteList />
          </div>
        </div>
      </div>
    </div>
  )
}
