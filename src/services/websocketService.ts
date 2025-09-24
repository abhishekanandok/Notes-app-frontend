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
  position: {
    line: number
    column: number
  }
  user: {
    id: string
    username: string
  }
  timestamp: string
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000'

// WebSocket configuration
const WS_CONFIG = {
  RECONNECT_INTERVAL: 3000,
  DEBOUNCE_DELAY: 500,
  MAX_RECONNECT_ATTEMPTS: 5,
}

export type WSEventType = 
  | 'connected'
  | 'joined'
  | 'note_updated'
  | 'user_joined'
  | 'user_left'
  | 'cursor_position'
  | 'error'

export type WSEventHandlers = {
  connected?: (data: WSConnected) => void
  joined?: (data: WSJoined) => void
  note_updated?: (data: WSNoteUpdated) => void
  user_joined?: (data: WSUserJoined) => void
  user_left?: (data: WSUserLeft) => void
  cursor_position?: (data: WSCursorPosition) => void
  error?: (data: WSError) => void
}

const useWebSocketService = () => {
  let ws: WebSocket | null = null
  let noteId: string | null = null
  let token: string | null = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = WS_CONFIG.MAX_RECONNECT_ATTEMPTS
  let reconnectTimeout: NodeJS.Timeout | null = null
  let editTimeout: NodeJS.Timeout | null = null
  let eventHandlers: WSEventHandlers = {}
  let isConnecting = false

  /**
   * Connect to a note's WebSocket
   */
  const connect = async (newNoteId: string, newToken: string): Promise<void> => {
    if (ws?.readyState === WebSocket.OPEN && noteId === newNoteId) {
      return // Already connected to this note
    }

    disconnect() // Disconnect from any existing connection
    noteId = newNoteId
    token = newToken
    isConnecting = true

    try {
      const wsUrl = `${WS_URL}/ws/notes/${newNoteId}?token=${newToken}`
      console.log('Connecting to WebSocket:', wsUrl)
      ws = new WebSocket(wsUrl)

      ws.onopen = handleOpen
      ws.onmessage = handleMessage
      ws.onclose = handleClose
      ws.onerror = handleError

      // Wait for connection to be established
      await waitForConnection()
    } catch (error) {
      isConnecting = false
      throw error
    }
  }

  /**
   * Disconnect from WebSocket
   */
  const disconnect = (): void => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }

    if (editTimeout) {
      clearTimeout(editTimeout)
      editTimeout = null
    }

    if (ws) {
      ws.close()
      ws = null
    }

    noteId = null
    token = null
    reconnectAttempts = 0
    isConnecting = false
  }

  /**
   * Send a message to the WebSocket
   */
  const send = (message: WSMessage): void => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
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
    // Clear any existing timeout
    if (editTimeout) {
      clearTimeout(editTimeout)
    }

    // Debounce the edit to avoid too many updates
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
  const updateCursorPosition = (line: number, column: number): void => {
    send({
      type: 'cursor_position',
      position: { line, column }
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
    if (isConnecting) return 'connecting'
    if (ws?.readyState === WebSocket.OPEN) return 'connected'
    if (ws?.readyState === WebSocket.CLOSED) return 'disconnected'
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
    isConnecting = false

    // Attempt to reconnect if it wasn't a manual disconnect
    if (event.code !== 1000 && noteId && token) {
      console.log('Attempting to reconnect...')
      attemptReconnect()
    }
  }

  const handleError = (error: Event): void => {
    console.error('WebSocket error:', error)
    isConnecting = false
  }

  const attemptReconnect = (): void => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    reconnectAttempts++
    console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})`)

    reconnectTimeout = setTimeout(() => {
      if (noteId && token) {
        connect(noteId, token).catch(console.error)
      }
    }, WS_CONFIG.RECONNECT_INTERVAL)
  }

  const handleEvent = (data: unknown): void => {
    if (typeof data !== 'object' || data === null) {
      console.warn('Invalid WebSocket message format')
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
      case 'error':
        eventHandlers.error?.(message as unknown as WSError)
        break
      default:
        console.warn('Unknown WebSocket event type:', type)
    }
  }

  return {
    connect,
    disconnect,
    send,
    joinNote,
    editNote,
    updateCursorPosition,
    on,
    off,
    getConnectionStatus,
    isConnectedToNote
  }
}

export default useWebSocketService
