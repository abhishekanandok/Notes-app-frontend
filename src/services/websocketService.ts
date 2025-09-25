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
const globalEventHandlers: WSEventHandlers = {}
let globalIsConnecting = false

const useWebSocketService = () => {
  // Use global variables to persist WebSocket state
  let ws = globalWs
  let noteId = globalNoteId
  const maxReconnectAttempts = WS_CONFIG.MAX_RECONNECT_ATTEMPTS
  let editTimeout = globalEditTimeout
  let eventHandlers = globalEventHandlers

  /**
   * Connect to a note's WebSocket
   */
  const connect = async (newNoteId: string, newToken: string): Promise<void> => {
    if (globalWs?.readyState === WebSocket.OPEN && globalNoteId === newNoteId) {
      return
    }

    if (globalIsConnecting) {
      return
    }

    if (globalNoteId && globalNoteId !== newNoteId) {
      disconnect()
    }

    globalNoteId = newNoteId
    globalToken = newToken
    globalIsConnecting = true
    noteId = globalNoteId

    try {
      const wsUrl = `${WS_URL}/ws/notes/${newNoteId}?token=${encodeURIComponent(newToken)}`
      globalWs = new WebSocket(wsUrl)
      ws = globalWs

      ws.onopen = () => handleOpen()
      ws.onmessage = (event) => handleMessage(event)
      ws.onclose = (event) => handleClose(event)
      ws.onerror = (event) => handleError(event)

      await waitForConnection()
    } catch (error) {
      globalIsConnecting = false
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
  }

  /**
   * Send a message to the WebSocket
   */
  const send = (message: WSMessage): void => {
    if (globalWs && globalWs.readyState === WebSocket.OPEN) {
      globalWs.send(JSON.stringify(message))
    }
  }

  /**
   * Join the note (send join_note message)
   */
  const joinNote = (): void => {
    send({ type: 'join_note' })
  }

  /**
   * Send note edit update with debouncing
   */
  const editNote = (content: string, title?: string): void => {
    if (editTimeout) {
      clearTimeout(editTimeout)
    }

    editTimeout = setTimeout(() => {
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
    send({
      type: 'cursor_position',
      position
    })
  }

  /**
   * Send typing start notification
   */
  const startTyping = (): void => {
    send({
      type: 'typing_start'
    })
  }

  /**
   * Send typing stop notification
   */
  const stopTyping = (): void => {
    send({
      type: 'typing_stop'
    })
  }

  /**
   * Send live edit update (for real-time typing)
   */
  const sendLiveEdit = (content: string, title?: string): void => {
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
        globalIsConnecting = false
        resolve()
      }

      const onError = (error: Event) => {
        clearTimeout(timeout)
        ws?.removeEventListener('open', onOpen)
        ws?.removeEventListener('error', onError)
        globalIsConnecting = false
        reject(error)
      }

      ws.addEventListener('open', onOpen)
      ws.addEventListener('error', onError)
    })
  }

  const handleOpen = (): void => {
    globalReconnectAttempts = 0
    globalIsConnecting = false
    joinNote()
  }

  const handleMessage = (event: MessageEvent): void => {
    try {
      const data = JSON.parse(event.data)
      handleEvent(data)
    } catch (error) {
      // Silent error handling
    }
  }

  const handleClose = (event: CloseEvent): void => {
    globalIsConnecting = false

    if (event.code !== 1000 && globalNoteId && globalToken) {
      attemptReconnect()
    }
  }

  const handleError = (error: Event): void => {
    globalIsConnecting = false
  }

  const attemptReconnect = (): void => {
    if (globalReconnectAttempts >= maxReconnectAttempts) {
      return
    }

    globalReconnectAttempts++

    globalReconnectTimeout = setTimeout(() => {
      if (globalNoteId && globalToken) {
        connect(globalNoteId, globalToken).catch(() => {})
      }
    }, WS_CONFIG.RECONNECT_INTERVAL)
  }

  const handleEvent = (data: unknown): void => {
    if (typeof data !== 'object' || data === null) {
      return
    }

    const message = data as Record<string, unknown>
    const { type } = message

    switch (type) {
      case 'connected':
        eventHandlers.connected?.(message as unknown as WSConnected)
        break
      case 'joined':
        eventHandlers.joined?.(message as unknown as WSJoined)
        break
      case 'note_updated':
        eventHandlers.note_updated?.(message as unknown as WSNoteUpdated)
        break
      case 'user_joined':
        eventHandlers.user_joined?.(message as unknown as WSUserJoined)
        break
      case 'user_left':
        eventHandlers.user_left?.(message as unknown as WSUserLeft)
        break
      case 'cursor_position':
        eventHandlers.cursor_position?.(message as unknown as WSCursorPosition)
        break
      case 'typing_start':
        eventHandlers.typing_start?.(message as unknown as WSTypingStart)
        break
      case 'typing_stop':
        eventHandlers.typing_stop?.(message as unknown as WSTypingStop)
        break
      case 'live_edit':
        eventHandlers.live_edit?.(message as unknown as WSLiveEdit)
        break
      case 'live_typing':
        eventHandlers.live_typing?.(message as unknown as WSLiveTyping)
        break
      case 'note_saved':
        eventHandlers.note_saved?.(message as unknown as WSNoteSaved)
        break
      case 'auto_saved':
        eventHandlers.auto_saved?.(message as unknown as WSAutoSaved)
        break
      case 'save_success':
        eventHandlers.save_success?.(message as unknown as WSSaveSuccess)
        break
      case 'error':
        eventHandlers.error?.(message as unknown as WSError)
        break
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
