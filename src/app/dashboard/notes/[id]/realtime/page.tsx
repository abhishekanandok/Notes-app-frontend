'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Wifi, WifiOff, Save, ArrowLeft, Home } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import useWebSocketService from '@/services/websocketService'
import useNotesService from '@/services/notesService'
import type { Note } from '@/services/notesService'
import type { WSNoteUpdated, WSUserJoined, WSUserLeft, WSCursorPosition, WSTypingStart, WSTypingStop, WSLiveEdit, WSLiveTyping, WSNoteSaved, WSSaveSuccess } from '@/services/websocketService'

interface ConnectedUser {
  id: string
  username: string
  cursorPosition?: number
  color: string
  isTyping?: boolean
  lastTypingTime?: number
}


const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
]

export default function RealTimeNotePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const notesService = useNotesService()
  const wsService = useWebSocketService()
  
  const noteId = params.id as string
  
  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  
  const titleRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const userColorMapRef = useRef<Map<string, string>>(new Map())
  const hasConnectedRef = useRef<boolean>(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const liveEditTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const liveTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Get or assign color for user
  const getUserColor = useCallback((userId: string): string => {
    if (!userColorMapRef.current.has(userId)) {
      const availableColors = USER_COLORS.filter(color => 
        !Array.from(userColorMapRef.current.values()).includes(color)
      )
      const color = availableColors[userColorMapRef.current.size % USER_COLORS.length]
      userColorMapRef.current.set(userId, color)
    }
    return userColorMapRef.current.get(userId) || USER_COLORS[0]
  }, [])

  // Load note data
  useEffect(() => {
    const loadNote = async () => {
      try {
        setLoading(true)
        const result = await notesService.getNoteById(noteId)
        if (result.success && result.data) {
          setNote(result.data)
          setTitle(result.data.title)
          setContent(result.data.content)
        } else {
          toast({
            title: "Error",
            description: "Failed to load note",
            variant: "destructive",
          })
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Failed to load note:', error)
        toast({
          title: "Error",
          description: "Failed to load note",
          variant: "destructive",
        })
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    if (noteId) {
      loadNote()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]) // Only depend on noteId to prevent infinite loops

  // WebSocket connection and event handling
  useEffect(() => {
    // Only connect when note is loaded and we haven't connected yet
    if (!note || !user || hasConnectedRef.current) {
      return
    }

    // Capture ref values for cleanup
    const typingTimeout = typingTimeoutRef.current
    const liveEditTimeout = liveEditTimeoutRef.current

    const token = getToken()
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "No authentication token found",
        variant: "destructive",
      })
      return
    }

    console.log('Setting up WebSocket connection for note:', noteId)
    console.log('WebSocket connection status:', wsService.getConnectionStatus())
    hasConnectedRef.current = true
    setConnectionStatus('connecting')

    // Set up event handlers
    wsService.on({
      connected: (data) => {
        console.log('Connected to note:', data.message)
        setConnectionStatus('connected')
        toast({
          title: "Connected",
          description: "Real-time collaboration enabled",
        })
      },
      joined: (data) => {
        console.log('Joined note:', data.noteId)
      },
      note_updated: (data: WSNoteUpdated) => {
        console.log('Note updated by:', data.updatedBy.username)
        
        // Only update if the update is from another user
        if (data.updatedBy.id !== user.id) {
          setTitle(data.title || '')
          setContent(data.content)
          toast({
            title: "Note Updated",
            description: `Updated by ${data.updatedBy.username}`,
          })
        }
      },
      user_joined: (data: WSUserJoined) => {
        console.log('User joined:', data.user.username)
        setConnectedUsers(prev => {
          const exists = prev.some(u => u.id === data.user.id)
          if (!exists) {
            return [...prev, {
              id: data.user.id,
              username: data.user.username,
              color: getUserColor(data.user.id)
            }]
          }
          return prev
        })
        toast({
          title: "User Joined",
          description: `${data.user.username} joined the note`,
        })
      },
      user_left: (data: WSUserLeft) => {
        console.log('User left:', data.user.username)
        setConnectedUsers(prev => prev.filter(u => u.id !== data.user.id))
        userColorMapRef.current.delete(data.user.id)
        toast({
          title: "User Left",
          description: `${data.user.username} left the note`,
        })
      },
      cursor_position: (data: WSCursorPosition) => {
        if (data.user.id !== user.id) {
          setConnectedUsers(prev => prev.map(u => 
            u.id === data.user.id 
              ? { ...u, cursorPosition: data.position }
              : u
          ))
        }
      },
      typing_start: (data: WSTypingStart) => {
        if (data.user.id !== user.id) {
          setConnectedUsers(prev => prev.map(u => 
            u.id === data.user.id 
              ? { ...u, isTyping: true, lastTypingTime: Date.now() }
              : u
          ))
          
          // Update typing users list if provided
          if (data.typingUsers) {
            setTypingUsers(data.typingUsers)
          }
        }
      },
      typing_stop: (data: WSTypingStop) => {
        if (data.user.id !== user.id) {
          setConnectedUsers(prev => prev.map(u => 
            u.id === data.user.id 
              ? { ...u, isTyping: false }
              : u
          ))
          
          // Update typing users list if provided
          if (data.typingUsers) {
            setTypingUsers(data.typingUsers)
          }
        }
      },
      live_edit: (data: WSLiveEdit) => {
        if (data.user.id !== user.id) {
          // Update content in real-time without saving to database
          setTitle(data.title || title)
          setContent(data.content)
        }
      },
      live_typing: (data: WSLiveTyping) => {
        if (data.user.id !== user.id) {
          // Update content in real-time with cursor position
          setTitle(data.title || title)
          setContent(data.content)
          
          // Update cursor position for the user
          setConnectedUsers(prev => prev.map(u => 
            u.id === data.user.id 
              ? { ...u, cursorPosition: data.cursorPosition }
              : u
          ))
        }
      },
      note_saved: (data: WSNoteSaved) => {
        // Update content when someone saves
        setTitle(data.title || title)
        setContent(data.content)
        setAutoSaveStatus('saved')
        
        // Reset auto-save status after 2 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 2000)
        
        toast({
          title: "Note Saved",
          description: `Saved by ${data.savedBy.username}`,
        })
      },
      auto_saved: () => {
        setAutoSaveStatus('saved')
        
        // Reset auto-save status after 2 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 2000)
        
        toast({
          title: "Auto-saved",
          description: "Note automatically saved",
        })
      },
      save_success: (data: WSSaveSuccess) => {
        setSaving(false)
        setAutoSaveStatus('saved')
        
        // Reset auto-save status after 2 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 2000)
        
        toast({
          title: "Saved",
          description: data.message,
        })
      },
      error: (data) => {
        console.error('WebSocket error:', data.message)
        setConnectionStatus('error')
        toast({
          title: "Connection Error",
          description: data.message,
          variant: "destructive",
        })
      }
    })

    // Connect to WebSocket
    console.log('Connecting to WebSocket...')
    wsService.connect(noteId, token).catch(error => {
      console.error('Failed to connect to WebSocket:', error)
      setConnectionStatus('error')
      hasConnectedRef.current = false
      toast({
        title: "Connection Failed",
        description: `Failed to connect to real-time collaboration: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      })
    })

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket connection')
      hasConnectedRef.current = false
      
      // Clear all timeouts
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
      if (liveEditTimeout) {
        clearTimeout(liveEditTimeout)
      }
      if (liveTypingTimeoutRef.current) {
        clearTimeout(liveTypingTimeoutRef.current)
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      
      wsService.disconnect()
      wsService.off()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note, user, noteId]) // Only depend on the essential values

  // Get token from cookies
  const getToken = (): string | null => {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';')
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='))
      return tokenCookie ? tokenCookie.split('=')[1] : null
    }
    return null
  }

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    console.log('📝 Title changed:', newTitle)
    setTitle(newTitle)
    
    const connectionStatus = wsService.getConnectionStatus()
    console.log('🔍 WebSocket connection status during title change:', connectionStatus)
    
    if (connectionStatus === 'connected') {
      // Send typing start immediately when title changes
      console.log('⌨️ Title changed - sending typing start')
      wsService.startTyping()
      
      // Clear existing timeouts
      if (liveTypingTimeoutRef.current) {
        clearTimeout(liveTypingTimeoutRef.current)
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Debounce live typing (send every 200ms)
      liveTypingTimeoutRef.current = setTimeout(() => {
        if (wsService.getConnectionStatus() === 'connected') {
          console.log('⚡ Sending live typing for title')
          wsService.sendLiveTyping(content, newTitle)
        }
      }, 200)
      
      // Debounce save (send every 2 seconds)
      saveTimeoutRef.current = setTimeout(() => {
        if (wsService.getConnectionStatus() === 'connected') {
          console.log('💾 Sending edit note for title save')
          wsService.editNote(content, newTitle)
        }
      }, 2000)
      
      // Set timeout to stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        console.log('⏹️ Auto-stopping typing after title change timeout')
        wsService.stopTyping()
      }, 2000)
    } else {
      console.log('❌ WebSocket not connected, cannot send title typing events')
    }
  }

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    console.log('📝 Content changed:', newContent.length, 'characters')
    setContent(newContent)
    
    // Update cursor position (debounced)
    const cursorPosition = e.target.selectionStart
    console.log('🖱️ Cursor position:', cursorPosition)
    
    const connectionStatus = wsService.getConnectionStatus()
    console.log('🔍 WebSocket connection status during content change:', connectionStatus)
    
    if (connectionStatus === 'connected') {
      // Send typing start immediately when content changes
      console.log('⌨️ Content changed - sending typing start')
      wsService.startTyping()
      
      // Clear existing timeouts
      if (liveTypingTimeoutRef.current) {
        clearTimeout(liveTypingTimeoutRef.current)
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Debounce cursor position update (send every 100ms)
      setTimeout(() => {
        if (wsService.getConnectionStatus() === 'connected') {
          console.log('🖱️ Sending cursor position:', cursorPosition)
          wsService.updateCursorPosition(cursorPosition)
        }
      }, 100)
      
      // Debounce live typing (send every 200ms)
      liveTypingTimeoutRef.current = setTimeout(() => {
        if (wsService.getConnectionStatus() === 'connected') {
          console.log('⚡ Sending live typing with content length:', newContent.length)
          wsService.sendLiveTyping(newContent, title, cursorPosition)
        }
      }, 200)
      
      // Debounce save (send every 2 seconds)
      saveTimeoutRef.current = setTimeout(() => {
        if (wsService.getConnectionStatus() === 'connected') {
          console.log('💾 Sending edit note for save')
          wsService.editNote(newContent, title)
        }
      }, 2000)
      
      // Set timeout to stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        console.log('⏹️ Auto-stopping typing after content change timeout')
        wsService.stopTyping()
      }, 2000)
    } else {
      console.log('❌ WebSocket not connected, cannot send typing events')
    }
  }

  // Handle manual save
  const handleSave = async () => {
    if (!note) return

    setSaving(true)
    setAutoSaveStatus('saving')
    
    try {
      // Use WebSocket save method for real-time collaboration
      if (wsService.getConnectionStatus() === 'connected') {
        wsService.saveNote(content.trim(), title.trim())
      } else {
        // Fallback to REST API if WebSocket is not connected
        const result = await notesService.updateNote(note.id, {
          title: title.trim(),
          content: content.trim()
        })
        
        if (result.success) {
          toast({
            title: "Saved",
            description: "Note saved successfully",
          })
          setAutoSaveStatus('saved')
          setTimeout(() => setAutoSaveStatus('idle'), 2000)
        } else {
          toast({
            title: "Save Failed",
            description: "Could not save the note",
            variant: "destructive",
          })
          setAutoSaveStatus('idle')
        }
      }
    } catch (error) {
      console.error('Failed to save note:', error)
      toast({
        title: "Save Failed",
        description: "Could not save the note",
        variant: "destructive",
      })
      setAutoSaveStatus('idle')
    } finally {
      if (wsService.getConnectionStatus() !== 'connected') {
        setSaving(false)
      }
    }
  }

  // Handle cursor position change
  const handleCursorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const cursorPosition = e.target.selectionStart
    if (wsService.getConnectionStatus() === 'connected') {
      wsService.updateCursorPosition(cursorPosition)
    }
  }

  // Handle typing start
  const handleTypingStart = (e: React.KeyboardEvent) => {
    console.log('🔍 Key pressed:', e.key, 'Type:', e.type)
    
    // Only send typing events for actual typing keys (not special keys)
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Enter' || e.key === 'Tab') {
      if (wsService.getConnectionStatus() === 'connected') {
        console.log('⌨️ User started typing:', e.key)
        wsService.startTyping()
        
        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
        
        // Set timeout to stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
          console.log('⏹️ Auto-stopping typing after timeout')
          wsService.stopTyping()
        }, 2000)
      }
    }
  }

  // Handle typing stop
  const handleTypingStop = (e: React.KeyboardEvent) => {
    if (wsService.getConnectionStatus() === 'connected') {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      console.log('⏹️ User stopped typing:', e.key)
      wsService.stopTyping()
    }
  }

  // Handle input blur (when user leaves the input field)
  const handleInputBlur = () => {
    if (wsService.getConnectionStatus() === 'connected') {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      console.log('⏹️ User left input field - stopping typing')
      wsService.stopTyping()
    }
  }

  

  

  // Navigation functions
  const goBack = () => {
    router.back()
  }

  const goToDashboard = () => {
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading note...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Note not found</p>
            <div className="flex justify-center space-x-4 mt-4">
              <Button onClick={goBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={goToDashboard}>
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-2 sm:p-4">
        {/* Header */}
        <div className="flex flex-col space-y-4 mb-6">
          {/* Top row - Navigation and Connection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" size="sm" onClick={goBack} className="h-8 px-2 sm:px-3">
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={goToDashboard} className="h-8 px-2 sm:px-3">
                <Home className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              {connectionStatus === 'connected' ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          {/* Bottom row - Users and Save */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            {/* Connected Users */}
            <div className="flex items-center space-x-2 min-w-0">
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex space-x-1 overflow-x-auto">
                {connectedUsers.map((user) => (
                  <Badge 
                    key={user.id} 
                    variant="secondary"
                    style={{ backgroundColor: user.color, color: 'white' }}
                    className="text-xs whitespace-nowrap flex-shrink-0"
                  >
                    {user.username}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Save Status and Button */}
            <div className="flex items-center justify-between sm:justify-end space-x-2">
              <div className="flex items-center space-x-2">
                {autoSaveStatus === 'saving' && (
                  <div className="flex items-center space-x-1 text-xs sm:text-sm text-blue-500">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                    <span className="hidden sm:inline">Saving...</span>
                  </div>
                )}
                {autoSaveStatus === 'saved' && (
                  <div className="flex items-center space-x-1 text-xs sm:text-sm text-green-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="hidden sm:inline">Saved</span>
                  </div>
                )}
              </div>
              <Button onClick={handleSave} disabled={saving} size="sm" className="h-8">
                <Save className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Note Editor */}
        <Card className="h-[calc(100vh-200px)] sm:h-auto">
          <CardHeader className="pb-3">
            <div className="relative">
              <Input
                ref={titleRef}
                value={title}
                onChange={handleTitleChange}
                onKeyDown={handleTypingStart}
                onKeyUp={handleTypingStop}
                onBlur={handleInputBlur}
                placeholder="Note title..."
                className="text-lg sm:text-2xl font-bold border-none shadow-none focus-visible:ring-0 pr-20"
              />
              {/* Show typing indicators in title */}
              {typingUsers.length > 0 && (
                <div className="absolute top-0 right-0 text-xs text-blue-500 animate-pulse max-w-20 truncate">
                  {typingUsers.length === 1 
                    ? `${typingUsers[0]} typing...`
                    : `${typingUsers.length} typing...`
                  }
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="relative h-full">
              <Textarea
                ref={contentRef}
                value={content}
                onChange={handleContentChange}
                onSelect={handleCursorChange}
                onKeyDown={handleTypingStart}
                onKeyUp={handleTypingStop}
                onBlur={handleInputBlur}
                placeholder="Start writing your note..."
                className="w-full h-[calc(100vh-300px)] sm:min-h-[500px] border-none shadow-none focus-visible:ring-0 resize-none text-sm sm:text-base"
              />
              
              {/* Render cursor overlays for other users */}
              {connectedUsers
                .filter(u => u.cursorPosition !== undefined && u.id !== user?.id)
                .map((user) => {
                  const color = getUserColor(user.id)
                  const cursorPos = Math.min(user.cursorPosition || 0, content.length)
                  
                  // Calculate position based on text content
                  const textBeforeCursor = content.substring(0, cursorPos)
                  const lines = textBeforeCursor.split('\n')
                  const currentLine = lines.length - 1
                  const currentColumn = lines[lines.length - 1].length
                  
                  return (
                    <div
                      key={user.id}
                      className="absolute pointer-events-none"
                      style={{
                        left: `${currentColumn * 7}px`, // Smaller character width for mobile
                        top: `${currentLine * 18 + 6}px`, // Smaller line height for mobile
                        zIndex: 10
                      }}
                    >
                      <div
                        className="w-0.5 h-4 sm:h-5 animate-pulse"
                        style={{ backgroundColor: color }}
                      />
                      <div
                        className="absolute -top-5 sm:-top-6 left-0 px-1 py-0.5 text-xs text-white rounded whitespace-nowrap max-w-20 truncate"
                        style={{ backgroundColor: color }}
                      >
                        {user.username}
                        {user.isTyping && (
                          <span className="ml-1 animate-pulse">✏️</span>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>


        {/* Note Info */}
        <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground space-y-1">
          <p className="truncate">ID: {note.id}</p>
          <p>Created: {new Date(note.createdAt).toLocaleDateString()}</p>
          <p>Updated: {new Date(note.updatedAt).toLocaleDateString()}</p>
          {note.folder && (
            <p className="truncate">Folder: {note.folder.name}</p>
          )}
        </div>
      </div>
    </div>
  )
}
