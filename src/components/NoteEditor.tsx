'use client'

import { useEffect, useRef, useState } from 'react'
import { useNotes } from '@/contexts/NotesContext'
import { useAuth } from '@/contexts/AuthContext'
import { API_CONFIG, WS_CONFIG } from '@/lib/config'

interface NoteEditorProps {
  noteId: string
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const { activeNote, updateNoteContent } = useNotes()
  const { token } = useAuth()
  const [content, setContent] = useState(activeNote?.content || '')
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
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
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [token, noteId])

  const connectWebSocket = () => {
    try {
      const wsUrl = `${API_CONFIG.WS_URL}/ws/notes/${noteId}?token=${token}`
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        setIsConnected(true)
        console.log('WebSocket connected')
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'edit_note') {
            // Update content from other users
            if (data.content !== content) {
              setContent(data.content)
              updateNoteContent(noteId, data.content)
            }
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      wsRef.current.onclose = () => {
        setIsConnected(false)
        console.log('WebSocket disconnected')
        
        // Attempt to reconnect after configured interval
        setTimeout(() => {
          if (token && noteId) {
            connectWebSocket()
          }
        }, WS_CONFIG.RECONNECT_INTERVAL)
      }

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
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
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'edit_note',
          noteId,
          content: newContent
        }))
      }
    }, WS_CONFIG.DEBOUNCE_DELAY)
  }

  const saveNote = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.NOTES}/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      })

      if (!response.ok) {
        throw new Error('Failed to save note')
      }
    } catch (error) {
      console.error('Failed to save note:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <button
          onClick={saveNote}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Save
        </button>
      </div>

      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder="Start writing your note..."
        className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
      />
    </div>
  )
}
