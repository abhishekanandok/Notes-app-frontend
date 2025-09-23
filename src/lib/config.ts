// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      SIGNUP: '/api/auth/signup',
      VERIFY: '/api/auth/verify',
    },
    FOLDERS: '/api/folders',
    NOTES: '/api/notes',
  }
}

// WebSocket configuration
export const WS_CONFIG = {
  RECONNECT_INTERVAL: 3000,
  DEBOUNCE_DELAY: 500,
}
