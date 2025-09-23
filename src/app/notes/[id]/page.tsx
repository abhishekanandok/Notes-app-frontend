'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useNotes } from '@/contexts/NotesContext'
import { Navbar } from '@/components/Navbar'
import { NoteEditor } from '@/components/NoteEditor'
import { ArrowLeft } from 'lucide-react'
import { API_CONFIG } from '@/lib/config'

export default function NotePage() {
  const params = useParams()
  const router = useRouter()
  const { token, loading: authLoading } = useAuth()
  const { activeNote, setActiveNote } = useNotes()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const noteId = params.id as string

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login')
    }
  }, [token, authLoading, router])

  useEffect(() => {
    if (token && noteId) {
      fetchNote()
    }
  }, [token, noteId])

  const fetchNote = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NOTES}/${noteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const note = await response.json()
        setActiveNote(note)
      } else if (response.status === 404) {
        setError('Note not found')
      } else {
        setError('Failed to load note')
      }
    } catch (error) {
      console.error('Failed to fetch note:', error)
      setError('Failed to load note')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {error}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              The note you're looking for doesn't exist or you don't have access to it.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!activeNote) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeNote.title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Last updated: {new Date(activeNote.updatedAt).toLocaleString()}
            </p>
          </div>
          <div className="p-6">
            <NoteEditor noteId={noteId} />
          </div>
        </div>
      </div>
    </div>
  )
}
