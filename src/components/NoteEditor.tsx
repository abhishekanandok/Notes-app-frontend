'use client'

import { useEffect, useRef, useState } from 'react'
import { useNotes } from '@/contexts/NotesContext'
import { useAuth } from '@/contexts/AuthContext'
import { websocketService, notesService } from '@/services'

interface NoteEditorProps {
  noteId: string
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const { activeNote, updateNoteContent } = useNotes()
  const { token } = useAuth()
  const [content, setContent] = useState(activeNote?.content || '')
  const [isConnected, setIsConnected] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (activeNote) {
      setContent(activeNote.content)
    }
  }, [activeNote])

  useEffect(() => {
    if (token && noteId) {
      connectWebSocket()
    }

    return () => {
      websocketService.disconnect()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [token, noteId])

  const connectWebSocket = async () => {
    try {
      if (!token) return

      await websocketService.connect(noteId, token)
      
      // Set up event handlers
      websocketService.on({
        connected: () => {
          setIsConnected(true)
          console.log('WebSocket connected')
        },
        note_updated: (data) => {
          // Update content from other users
          if (data.content !== content) {
            setContent(data.content)
            updateNoteContent(noteId, data.content)
          }
        },
        error: (data) => {
          console.error('WebSocket error:', data.message)
          setIsConnected(false)
        }
      })

      setIsConnected(websocketService.getConnectionStatus() === 'connected')
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      setIsConnected(false)
    }
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    updateNoteContent(noteId, newContent)

    // Debounce WebSocket updates
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      websocketService.editNote(newContent)
    }, 500) // 500ms debounce
  }

  const saveNote = async () => {
    try {
      await notesService.updateNote(noteId, { content })
    } catch (error) {
      console.error('Failed to save note:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <button
          onClick={saveNote}
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
        >
          Save
        </button>
      </div>

      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder="Start writing your note..."
        className="w-full h-96 p-4 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none"
      />
    </div>
  )
}
