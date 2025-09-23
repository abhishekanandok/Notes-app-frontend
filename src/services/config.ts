// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080',
  
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      ME: '/api/auth/me',
    },
    NOTES: '/api/notes',
    FOLDERS: '/api/folders',
    HEALTH: '/health',
  }
}

// WebSocket configuration
export const WS_CONFIG = {
  RECONNECT_INTERVAL: 3000,
  DEBOUNCE_DELAY: 500,
  MAX_RECONNECT_ATTEMPTS: 5,
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  count?: number
}

export interface User {
  id: string
  email: string
  username: string
  createdAt: string
}

export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  folder?: {
    id: string
    name: string
  } | null
}

export interface Folder {
  id: string
  name: string
  description?: string | null
  createdAt: string
  updatedAt: string
  _count: {
    notes: number
  }
  notes?: Note[]
}

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
