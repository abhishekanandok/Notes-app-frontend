import { API_CONFIG, WS_CONFIG } from './config'
import type {
  WSMessage,
  WSError,
  WSConnected,
  WSJoined,
  WSNoteUpdated,
  WSUserJoined,
  WSUserLeft,
  WSCursorPosition
} from './config'

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

class WebSocketService {
  private ws: WebSocket | null = null
  private noteId: string | null = null
  private token: string | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = WS_CONFIG.MAX_RECONNECT_ATTEMPTS
  private reconnectTimeout: NodeJS.Timeout | null = null
  private eventHandlers: WSEventHandlers = {}
  private isConnecting = false

  /**
   * Connect to a note's WebSocket
   */
  async connect(noteId: string, token: string): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN && this.noteId === noteId) {
      return // Already connected to this note
    }

    this.disconnect() // Disconnect from any existing connection
    this.noteId = noteId
    this.token = token
    this.isConnecting = true

    try {
      const wsUrl = `${API_CONFIG.WS_URL}/ws/notes/${noteId}?token=${token}`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
      this.ws.onerror = this.handleError.bind(this)

      // Wait for connection to be established
      await this.waitForConnection()
    } catch (error) {
      this.isConnecting = false
      throw error
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.noteId = null
    this.token = null
    this.reconnectAttempts = 0
    this.isConnecting = false
  }

  /**
   * Send a message to the WebSocket
   */
  send(message: WSMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  /**
   * Join the note (send join_note message)
   */
  joinNote(): void {
    this.send({ type: 'join_note' })
  }

  /**
   * Send note edit update
   */
  editNote(content: string, title?: string): void {
    this.send({
      type: 'edit_note',
      content,
      title
    })
  }

  /**
   * Send cursor position update
   */
  updateCursorPosition(line: number, column: number): void {
    this.send({
      type: 'cursor_position',
      position: { line, column }
    })
  }

  /**
   * Register event handlers
   */
  on(handlers: WSEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers }
  }

  /**
   * Remove event handlers
   */
  off(eventType?: WSEventType): void {
    if (eventType) {
      delete this.eventHandlers[eventType]
    } else {
      this.eventHandlers = {}
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (this.isConnecting) return 'connecting'
    if (this.ws?.readyState === WebSocket.OPEN) return 'connected'
    if (this.ws?.readyState === WebSocket.CLOSED) return 'disconnected'
    return 'error'
  }

  /**
   * Check if connected to a specific note
   */
  isConnectedToNote(noteId: string): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this.noteId === noteId
  }

  private async waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.ws) {
        reject(new Error('WebSocket not initialized'))
        return
      }

      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'))
      }, 10000) // 10 second timeout

      const onOpen = () => {
        clearTimeout(timeout)
        this.ws?.removeEventListener('open', onOpen)
        this.ws?.removeEventListener('error', onError)
        this.isConnecting = false
        resolve()
      }

      const onError = (error: Event) => {
        clearTimeout(timeout)
        this.ws?.removeEventListener('open', onOpen)
        this.ws?.removeEventListener('error', onError)
        this.isConnecting = false
        reject(error)
      }

      this.ws.addEventListener('open', onOpen)
      this.ws.addEventListener('error', onError)
    })
  }

  private handleOpen(): void {
    console.log('WebSocket connected')
    this.reconnectAttempts = 0
    this.joinNote()
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data)
      this.handleEvent(data)
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket disconnected:', event.code, event.reason)
    this.isConnecting = false

    // Attempt to reconnect if it wasn't a manual disconnect
    if (event.code !== 1000 && this.noteId && this.token) {
      this.attemptReconnect()
    }
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error)
    this.isConnecting = false
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    this.reconnectTimeout = setTimeout(() => {
      if (this.noteId && this.token) {
        this.connect(this.noteId, this.token).catch(console.error)
      }
    }, WS_CONFIG.RECONNECT_INTERVAL)
  }

  private handleEvent(data: any): void {
    const { type } = data

    switch (type) {
      case 'connected':
        this.eventHandlers.connected?.(data as WSConnected)
        break
      case 'joined':
        this.eventHandlers.joined?.(data as WSJoined)
        break
      case 'note_updated':
        this.eventHandlers.note_updated?.(data as WSNoteUpdated)
        break
      case 'user_joined':
        this.eventHandlers.user_joined?.(data as WSUserJoined)
        break
      case 'user_left':
        this.eventHandlers.user_left?.(data as WSUserLeft)
        break
      case 'cursor_position':
        this.eventHandlers.cursor_position?.(data as WSCursorPosition)
        break
      case 'error':
        this.eventHandlers.error?.(data as WSError)
        break
      default:
        console.warn('Unknown WebSocket event type:', type)
    }
  }
}

export default new WebSocketService()
