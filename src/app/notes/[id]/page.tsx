'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useNotes } from '@/contexts/NotesContext'
import { Navbar } from '@/components/Navbar'
import { NoteEditor } from '@/components/NoteEditor'
import { ArrowLeft } from 'lucide-react'
import { notesService } from '@/services'

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
      const note = await notesService.getNoteById(noteId)
      setActiveNote(note)
    } catch (error: any) {
      console.error('Failed to fetch note:', error)
      if (error.message.includes('404') || error.message.includes('not found')) {
        setError('Note not found')
      } else {
        setError('Failed to load note')
      }
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {error}
            </h1>
            <p className="text-muted-foreground">
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        
        <div className="bg-card rounded-lg shadow-sm border border-border">
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-foreground">
              {activeNote.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
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
