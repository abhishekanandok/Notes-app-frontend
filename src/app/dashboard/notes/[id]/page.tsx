'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useNotes } from '@/contexts/NotesContext'
import { useNotifications } from '@/components/NotificationProvider'
import useWebSocketService from '@/services/websocketService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CollaborationIndicator } from '@/components/CollaborationIndicator'
import { ArrowLeft, Save, Users, Wifi, WifiOff, Trash2, FolderOpen } from 'lucide-react'

interface Collaborator {
  id: string
  username: string
  cursorPosition?: { line: number; column: number }
}

export default function NoteEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { token, user } = useAuth()
  const { notes, updateNote, deleteNote } = useNotes()
  const { addNotification } = useNotifications()
  
  const noteId = params.id as string
  const note = notes.find(n => n.id === noteId)
  
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [isConnected, setIsConnected] = useState(false)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 })

  const connectWebSocket = useCallback(async () => {
    try {
      if (!token) return

      await websocketService.connect(noteId, token)
      
      websocketService.on({
        connected: (data) => {
          setIsConnected(true)
          addNotification({
            type: 'success',
            title: "Connected",
            description: data.message,
          })
        },
        note_updated: (data) => {
          // Only update if the change came from another user
          if (data.updatedBy.id !== user?.id) {
            setTitle(data.title || title)
            setContent(data.content)
            addNotification({
              type: 'info',
              title: "Note updated",
              description: `Updated by ${data.updatedBy.username}`,
            })
          }
        },
        user_joined: (data) => {
          setCollaborators(prev => {
            const exists = prev.find(c => c.id === data.user.id)
            if (exists) return prev
            return [...prev, data.user]
          })
          addNotification({
            type: 'info',
            title: "User joined",
            description: `${data.user.username} joined the note`,
          })
        },
        user_left: (data) => {
          setCollaborators(prev => prev.filter(c => c.id !== data.user.id))
          addNotification({
            type: 'info',
            title: "User left",
            description: `${data.user.username} left the note`,
          })
        },
        cursor_position: (data) => {
          if (data.user.id !== user?.id) {
            setCollaborators(prev => 
              prev.map(c => 
                c.id === data.user.id 
                  ? { ...c, cursorPosition: data.position }
                  : c
              )
            )
          }
        },
        error: (data) => {
          setIsConnected(false)
          addNotification({
            type: 'error',
            title: "Connection error",
            description: data.message,
          })
        }
      })

      setIsConnected(websocketService.getConnectionStatus() === 'connected')
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      setIsConnected(false)
      addNotification({
        type: 'error',
        title: "Connection failed",
        description: "Could not connect to real-time collaboration",
      })
    }
  }, [token, noteId, user, addNotification])

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
    }
  }, [note])

  useEffect(() => {
    if (token && noteId) {
      connectWebSocket()
    }

    return () => {
      websocketService.disconnect()
    }
  }, [token, noteId, connectWebSocket])

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    setHasUnsavedChanges(true)
    
    // Send update via WebSocket
    if (isConnected) {
      websocketService.editNote(content, newTitle)
    }
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setHasUnsavedChanges(true)
    
    // Send update via WebSocket
    if (isConnected) {
      websocketService.editNote(newContent, title)
    }
  }

  const handleCursorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    const textBeforeCursor = textarea.value.substring(0, textarea.selectionStart)
    const lines = textBeforeCursor.split('\n')
    const line = lines.length
    const column = lines[lines.length - 1].length + 1
    
    setCursorPosition({ line, column })
    
    // Send cursor position via WebSocket
    if (isConnected) {
      websocketService.updateCursorPosition(line, column)
    }
  }

  const saveNote = async () => {
    if (!note) return
    
    setIsSaving(true)
    try {
      await updateNote(noteId, { title, content })
      setHasUnsavedChanges(false)
      addNotification({
        type: 'success',
        title: "Note saved",
        description: "Your changes have been saved",
      })
    } catch (error) {
      console.error('Failed to save note:', error)
      addNotification({
        type: 'error',
        title: "Save failed",
        description: "Could not save your changes",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteNote = async () => {
    if (!note) return
    
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      try {
        await deleteNote(noteId)
        addNotification({
          type: 'success',
          title: "Note deleted",
          description: "The note has been deleted",
        })
        router.push('/dashboard/notes')
      } catch (error) {
        console.error('Failed to delete note:', error)
        addNotification({
          type: 'error',
          title: "Delete failed",
          description: "Could not delete the note",
        })
      }
    }
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Note not found</h2>
          <p className="text-muted-foreground mb-4">The note you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/dashboard/notes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/notes')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Note</h1>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              {collaborators.length > 0 && (
                <>
                  <span>•</span>
                  <Users className="h-4 w-4" />
                  <span>{collaborators.length} collaborator{collaborators.length !== 1 ? 's' : ''}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <CollaborationIndicator
            isConnected={isConnected}
            collaborators={collaborators}
            currentUser={user ? { id: user.id, username: user.username } : undefined}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteNote}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button
            onClick={saveNote}
            disabled={isSaving || !hasUnsavedChanges}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Collaborators */}
      {collaborators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Active Collaborators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-full text-sm"
                >
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>{collaborator.username}</span>
                  {collaborator.cursorPosition && (
                    <span className="text-xs text-muted-foreground">
                      (line {collaborator.cursorPosition.line})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Note Editor */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter note title..."
                className="text-lg font-semibold"
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-foreground mb-2">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => {
                  handleContentChange(e.target.value)
                  handleCursorChange(e)
                }}
                placeholder="Start writing your note..."
                className="min-h-[400px] resize-none"
              />
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span>Line {cursorPosition.line}, Column {cursorPosition.column}</span>
                {note.folder && (
                  <div className="flex items-center space-x-1">
                    <FolderOpen className="h-4 w-4" />
                    <span>{note.folder.name}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span>Real-time collaboration {isConnected ? 'enabled' : 'disabled'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
