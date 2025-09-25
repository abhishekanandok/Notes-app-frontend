// WebSocket service for real-time collaboration

// WebSocket message types
export interface WSMessage {
  type: string
  [key: string]: unknown
}

export interface WSError {
  type: 'error'
  message: string
}

export interface WSConnected {
  type: 'connected'
  message: string
  user: {
    id: string
    username: string
  }
}

export interface WSJoined {
  type: 'joined'
  noteId: string
  timestamp: string
}

export interface WSNoteUpdated {
  type: 'note_updated'
  content: string
  title?: string
  updatedBy: {
    id: string
    username: string
  }
  timestamp: string
}

export interface WSUserJoined {
  type: 'user_joined'
  user: {
    id: string
    username: string
  }
  timestamp: string
}

export interface WSUserLeft {
  type: 'user_left'
  user: {
    id: string
    username: string
  }
  timestamp: string
}

export interface WSCursorPosition {
  type: 'cursor_position'
  position: number
  user: {
    id: string
    username: string
  }
  timestamp: string
}

export interface WSTypingStart {
  type: 'typing_start'
  user: {
    id: string
    username: string
  }
  typingUsers?: string[]
  timestamp: string
}

export interface WSTypingStop {
  type: 'typing_stop'
  user: {
    id: string
    username: string
  }
  typingUsers?: string[]
  timestamp: string
}

export interface WSLiveEdit {
  type: 'live_edit'
  content: string
  title?: string
  user: {
    id: string
    username: string
  }
  timestamp: string
}

export interface WSLiveTyping {
  type: 'live_typing'
  content: string
  title?: string
  cursorPosition?: number
  user: {
    id: string
    username: string
  }
  timestamp: string
}

export interface WSNoteSaved {
  type: 'note_saved'
  content: string
  title?: string
  savedBy: {
    id: string
    username: string
  }
  timestamp: string
}

export interface WSAutoSaved {
  type: 'auto_saved'
  timestamp: string
}

export interface WSSaveSuccess {
  type: 'save_success'
  message: string
  timestamp: string
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000'

// WebSocket configuration
const WS_CONFIG = {
  RECONNECT_INTERVAL: 3000,
  DEBOUNCE_DELAY: 2000, // Increased from 500ms to 2 seconds
  LIVE_TYPING_DELAY: 200, // New delay for live typing
  CURSOR_UPDATE_DELAY: 100, // New delay for cursor updates
  MAX_RECONNECT_ATTEMPTS: 5,
}

export type WSEventType = 
  | 'connected'
  | 'joined'
  | 'note_updated'
  | 'user_joined'
  | 'user_left'
  | 'cursor_position'
  | 'typing_start'
  | 'typing_stop'
  | 'live_edit'
  | 'live_typing'
  | 'note_saved'
  | 'auto_saved'
  | 'save_success'
  | 'error'

export type WSEventHandlers = {
  connected?: (data: WSConnected) => void
  joined?: (data: WSJoined) => void
  note_updated?: (data: WSNoteUpdated) => void
  user_joined?: (data: WSUserJoined) => void
  user_left?: (data: WSUserLeft) => void
  cursor_position?: (data: WSCursorPosition) => void
  typing_start?: (data: WSTypingStart) => void
  typing_stop?: (data: WSTypingStop) => void
  live_edit?: (data: WSLiveEdit) => void
  live_typing?: (data: WSLiveTyping) => void
  note_saved?: (data: WSNoteSaved) => void
  auto_saved?: (data: WSAutoSaved) => void
  save_success?: (data: WSSaveSuccess) => void
  error?: (data: WSError) => void
}

// Global WebSocket instance to persist across re-renders
let globalWs: WebSocket | null = null
let globalNoteId: string | null = null
let globalToken: string | null = null
let globalReconnectAttempts = 0
let globalReconnectTimeout: NodeJS.Timeout | null = null
let globalEditTimeout: NodeJS.Timeout | null = null
let globalEventHandlers: WSEventHandlers = {}
let globalIsConnecting = false

const useWebSocketService = () => {
  // Use global variables to persist WebSocket state
  let ws = globalWs
  let noteId = globalNoteId
  let token = globalToken
  let reconnectAttempts = globalReconnectAttempts
  const maxReconnectAttempts = WS_CONFIG.MAX_RECONNECT_ATTEMPTS
  let reconnectTimeout = globalReconnectTimeout
  let editTimeout = globalEditTimeout
  let eventHandlers = globalEventHandlers
  let isConnecting = globalIsConnecting

  /**
   * Connect to a note's WebSocket
   */
  const connect = async (newNoteId: string, newToken: string): Promise<void> => {
    console.log('Connect called with noteId:', newNoteId, 'current noteId:', globalNoteId, 'ws state:', globalWs?.readyState)
    
    // Prevent multiple connections to the same note
    if (globalWs?.readyState === WebSocket.OPEN && globalNoteId === newNoteId) {
      console.log('Already connected to this note, skipping connection')
      return // Already connected to this note
    }

    // Prevent multiple connection attempts
    if (globalIsConnecting) {
      console.log('Connection already in progress, skipping')
      return
    }

    // If we're connecting to a different note, disconnect first
    if (globalNoteId && globalNoteId !== newNoteId) {
      console.log('Switching to different note, disconnecting first')
      disconnect()
    }

    globalNoteId = newNoteId
    globalToken = newToken
    globalIsConnecting = true
    
    // Update local variables
    noteId = globalNoteId
    token = globalToken
    isConnecting = globalIsConnecting

    try {
      const wsUrl = `${WS_URL}/ws/notes/${newNoteId}?token=${encodeURIComponent(newToken)}`
      console.log('=== WebSocket Connection Debug ===')
      console.log('WS_URL:', WS_URL)
      console.log('noteId:', newNoteId)
      console.log('Full WebSocket URL:', wsUrl)
      console.log('Token being sent via query parameter:', newToken ? 'Token present' : 'No token')
      console.log('WebSocket constructor available:', typeof WebSocket !== 'undefined')
      
      // Create WebSocket connection
      globalWs = new WebSocket(wsUrl)
      ws = globalWs
      console.log('WebSocket created successfully')
      console.log('WebSocket readyState:', globalWs.readyState)

      ws.onopen = (event) => {
        console.log('WebSocket onopen event:', event)
        handleOpen()
      }
      ws.onmessage = (event) => {
        console.log('WebSocket onmessage event:', event.data)
        handleMessage(event)
      }
      ws.onclose = (event) => {
        console.log('WebSocket onclose event:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        })
        handleClose(event)
      }
      ws.onerror = (event) => {
        console.error('WebSocket onerror event:', event)
        handleError(event)
      }

      // Wait for connection to be established
      await waitForConnection()
    } catch (error) {
      globalIsConnecting = false
      isConnecting = false
      throw error
    }
  }

  /**
   * Disconnect from WebSocket
   */
  const disconnect = (): void => {
    if (globalReconnectTimeout) {
      clearTimeout(globalReconnectTimeout)
      globalReconnectTimeout = null
    }

    if (globalEditTimeout) {
      clearTimeout(globalEditTimeout)
      globalEditTimeout = null
    }

    if (globalWs) {
      globalWs.close()
      globalWs = null
    }

    globalNoteId = null
    globalToken = null
    globalReconnectAttempts = 0
    globalIsConnecting = false
    
    // Update local variables
    noteId = null
    token = null
    reconnectAttempts = 0
    isConnecting = false
  }

  /**
   * Send a message to the WebSocket
   */
  const send = (message: WSMessage): void => {
    console.log('🔍 send method called:', {
      wsExists: !!globalWs,
      readyState: globalWs?.readyState,
      OPEN: WebSocket.OPEN,
      messageType: message.type
    })
    
    if (globalWs && globalWs.readyState === WebSocket.OPEN) {
      console.log(`📤 WebSocket Message Sent: ${message.type}`, message)
      globalWs.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected - cannot send message:', message.type, {
        wsExists: !!globalWs,
        readyState: globalWs?.readyState,
        readyStateText: globalWs ? 
          globalWs.readyState === WebSocket.CONNECTING ? 'CONNECTING' :
          globalWs.readyState === WebSocket.OPEN ? 'OPEN' :
          globalWs.readyState === WebSocket.CLOSING ? 'CLOSING' :
          globalWs.readyState === WebSocket.CLOSED ? 'CLOSED' : 'UNKNOWN'
          : 'NO_WS'
      })
    }
  }

  /**
   * Join the note (send join_note message)
   */
  const joinNote = (): void => {
    console.log('🎯 Sending join_note message')
    send({ type: 'join_note' })
  }

  /**
   * Send note edit update with debouncing
   */
  const editNote = (content: string, title?: string): void => {
    // Clear any existing timeout
    if (editTimeout) {
      clearTimeout(editTimeout)
    }

    // Debounce the edit to avoid too many updates
    editTimeout = setTimeout(() => {
      console.log('📝 Sending edit_note message (debounced)')
      send({
        type: 'edit_note',
        content,
        title
      })
    }, WS_CONFIG.DEBOUNCE_DELAY)
  }

  /**
   * Send cursor position update
   */
  const updateCursorPosition = (position: number): void => {
    console.log('🖱️ Sending cursor_position message:', position)
    send({
      type: 'cursor_position',
      position
    })
  }

  /**
   * Send typing start notification
   */
  const startTyping = (): void => {
    console.log('⌨️ Sending typing_start message')
    send({
      type: 'typing_start'
    })
  }

  /**
   * Send typing stop notification
   */
  const stopTyping = (): void => {
    console.log('⏹️ Sending typing_stop message')
    send({
      type: 'typing_stop'
    })
  }

  /**
   * Send live edit update (for real-time typing)
   */
  const sendLiveEdit = (content: string, title?: string): void => {
    console.log('✏️ Sending live_edit message')
    send({
      type: 'live_edit',
      content,
      title
    })
  }

  /**
   * Send live typing update (for real-time typing with cursor position)
   */
  const sendLiveTyping = (content: string, title?: string, cursorPosition?: number): void => {
    console.log('⚡ Sending live_typing message with cursor position:', cursorPosition)
    send({
      type: 'live_typing',
      content,
      title,
      cursorPosition
    })
  }

  /**
   * Send manual save request
   */
  const saveNote = (content: string, title?: string): void => {
    console.log('💾 Sending save_note message')
    send({
      type: 'save_note',
      content,
      title
    })
  }

  /**
   * Register event handlers
   */
  const on = (handlers: WSEventHandlers): void => {
    eventHandlers = { ...eventHandlers, ...handlers }
  }

  /**
   * Remove event handlers
   */
  const off = (eventType?: WSEventType): void => {
    if (eventType) {
      delete eventHandlers[eventType]
    } else {
      eventHandlers = {}
    }
  }

  /**
   * Get connection status
   */
  const getConnectionStatus = (): 'connecting' | 'connected' | 'disconnected' | 'error' => {
    console.log('🔍 getConnectionStatus called:', {
      isConnecting: globalIsConnecting,
      wsExists: !!globalWs,
      readyState: globalWs?.readyState,
      OPEN: WebSocket.OPEN,
      CONNECTING: WebSocket.CONNECTING,
      CLOSED: WebSocket.CLOSED
    })
    
    if (globalIsConnecting) return 'connecting'
    if (globalWs && globalWs.readyState === WebSocket.OPEN) return 'connected'
    if (globalWs && globalWs.readyState === WebSocket.CLOSED) return 'disconnected'
    if (globalWs && globalWs.readyState === WebSocket.CONNECTING) return 'connecting'
    return 'error'
  }

 

  /**
   * Check if connected to a specific note
   */
  const isConnectedToNote = (checkNoteId: string): boolean => {
    return ws?.readyState === WebSocket.OPEN && noteId === checkNoteId
  }

  const waitForConnection = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!ws) {
        reject(new Error('WebSocket not initialized'))
        return
      }

      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'))
      }, 10000) // 10 second timeout

      const onOpen = () => {
        clearTimeout(timeout)
        ws?.removeEventListener('open', onOpen)
        ws?.removeEventListener('error', onError)
        isConnecting = false
        resolve()
      }

      const onError = (error: Event) => {
        clearTimeout(timeout)
        ws?.removeEventListener('open', onOpen)
        ws?.removeEventListener('error', onError)
        isConnecting = false
        reject(error)
      }

      ws.addEventListener('open', onOpen)
      ws.addEventListener('error', onError)
    })
  }

  const handleOpen = (): void => {
    console.log('WebSocket connected successfully')
    globalReconnectAttempts = 0
    globalIsConnecting = false
    isConnecting = false
    reconnectAttempts = 0
    joinNote()
  }

  const handleMessage = (event: MessageEvent): void => {
    try {
      const data = JSON.parse(event.data)
      handleEvent(data)
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  const handleClose = (event: CloseEvent): void => {
    console.log('WebSocket disconnected:', event.code, event.reason)
    console.log('Close event details:', {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean
    })
    globalIsConnecting = false
    isConnecting = false

    // Attempt to reconnect if it wasn't a manual disconnect
    if (event.code !== 1000 && globalNoteId && globalToken) {
      console.log('Attempting to reconnect...')
      attemptReconnect()
    }
  }

  const handleError = (error: Event): void => {
    console.error('WebSocket error:', error)
    globalIsConnecting = false
    isConnecting = false
  }

  const attemptReconnect = (): void => {
    if (globalReconnectAttempts >= maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    globalReconnectAttempts++
    reconnectAttempts = globalReconnectAttempts
    console.log(`Attempting to reconnect (${globalReconnectAttempts}/${maxReconnectAttempts})`)

    globalReconnectTimeout = setTimeout(() => {
      if (globalNoteId && globalToken) {
        connect(globalNoteId, globalToken).catch(console.error)
      }
    }, WS_CONFIG.RECONNECT_INTERVAL)
    reconnectTimeout = globalReconnectTimeout
  }

  const handleEvent = (data: unknown): void => {
    if (typeof data !== 'object' || data === null) {
      console.warn('Invalid WebSocket message format')
      return
    }

    const message = data as Record<string, unknown>
    const { type } = message

    console.log(`🔔 WebSocket Event Received: ${type}`, message)

    switch (type) {
      case 'connected':
        console.log('✅ Connected event handler called')
        eventHandlers.connected?.(message as unknown as WSConnected)
        break
      case 'joined':
        console.log('🎯 Joined event handler called')
        eventHandlers.joined?.(message as unknown as WSJoined)
        break
      case 'note_updated':
        console.log('📝 Note updated event handler called')
        eventHandlers.note_updated?.(message as unknown as WSNoteUpdated)
        break
      case 'user_joined':
        console.log('👤 User joined event handler called')
        eventHandlers.user_joined?.(message as unknown as WSUserJoined)
        break
      case 'user_left':
        console.log('👋 User left event handler called')
        eventHandlers.user_left?.(message as unknown as WSUserLeft)
        break
      case 'cursor_position':
        console.log('🖱️ Cursor position event handler called')
        eventHandlers.cursor_position?.(message as unknown as WSCursorPosition)
        break
      case 'typing_start':
        console.log('⌨️ Typing start event handler called')
        eventHandlers.typing_start?.(message as unknown as WSTypingStart)
        break
      case 'typing_stop':
        console.log('⏹️ Typing stop event handler called')
        eventHandlers.typing_stop?.(message as unknown as WSTypingStop)
        break
      case 'live_edit':
        console.log('✏️ Live edit event handler called')
        eventHandlers.live_edit?.(message as unknown as WSLiveEdit)
        break
      case 'live_typing':
        console.log('⚡ Live typing event handler called')
        eventHandlers.live_typing?.(message as unknown as WSLiveTyping)
        break
      case 'note_saved':
        console.log('💾 Note saved event handler called')
        eventHandlers.note_saved?.(message as unknown as WSNoteSaved)
        break
      case 'auto_saved':
        console.log('🔄 Auto saved event handler called')
        eventHandlers.auto_saved?.(message as unknown as WSAutoSaved)
        break
      case 'save_success':
        console.log('✅ Save success event handler called')
        eventHandlers.save_success?.(message as unknown as WSSaveSuccess)
        break
      case 'error':
        console.log('❌ Error event handler called')
        eventHandlers.error?.(message as unknown as WSError)
        break
      default:
        console.warn('❓ Unknown WebSocket event type:', type)
    }
  }

  return {
    connect,
    disconnect,
    send,
    joinNote,
    editNote,
    updateCursorPosition,
    startTyping,
    stopTyping,
    sendLiveEdit,
    sendLiveTyping,
    saveNote,
    on,
    off,
    getConnectionStatus,
    isConnectedToNote,
  }
}

export default useWebSocketService
