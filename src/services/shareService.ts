// Types
export interface NoteShare {
  id: string
  noteId: string
  userId: string
  role: 'viewer' | 'editor' | 'admin'
  createdAt: string
  user: {
    id: string
    username: string
    email: string
  }
}

export interface SharedNote {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  userId: string
  folderId?: string | null
  folder?: {
    id: string
    name: string
  } | null
  shareRole: 'viewer' | 'editor' | 'admin'
  sharedBy: {
    id: string
    username: string
    email: string
  }
}

export interface ShareNoteData {
  username: string
  role?: 'viewer' | 'editor' | 'admin'
}

export interface ShareResponse {
  count: number
  data: NoteShare[]
}

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  count?: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const useShareService = () => {
  const getAuthHeaders = () => {
    const token = getToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  const handleApiResponse = async <T>(response: Response, endpoint: string): Promise<ApiResponse<T>> => {
    const data = await response.json()
    
    console.log(`API Response [${endpoint}]:`, data)
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'An error occurred')
    }
    
    return data
  }

  const getToken = (): string | null => {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';')
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='))
      return tokenCookie ? tokenCookie.split('=')[1] : null
    }
    return null
  }

  /**
   * Share a note with a user
   */
  const shareNote = async (noteId: string, data: ShareNoteData): Promise<ApiResponse<NoteShare>> => {
    try {
      console.log('API Call: Sharing note', { noteId, data })
      const response = await fetch(`${API_URL}/api/shares/notes/${noteId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      
      return handleApiResponse<NoteShare>(response, 'shareNote')
    } catch (error: unknown) {
      console.error('API Error [shareNote]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  /**
   * Get all shares for a note
   */
  const getNoteShares = async (noteId: string): Promise<ApiResponse<NoteShare[]>> => {
    try {
      console.log('API Call: Getting note shares', noteId)
      const response = await fetch(`${API_URL}/api/shares/notes/${noteId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return handleApiResponse<NoteShare[]>(response, 'getNoteShares')
    } catch (error: unknown) {
      console.error('API Error [getNoteShares]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  /**
   * Remove a note share
   */
  const removeNoteShare = async (noteId: string, username: string): Promise<ApiResponse<void>> => {
    try {
      console.log('API Call: Removing note share', { noteId, username })
      const response = await fetch(`${API_URL}/api/shares/notes/${noteId}/${username}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      return handleApiResponse<void>(response, 'removeNoteShare')
    } catch (error: unknown) {
      console.error('API Error [removeNoteShare]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  /**
   * Get notes shared with current user
   */
  const getSharedNotes = async (): Promise<ApiResponse<SharedNote[]>> => {
    try {
      console.log('API Call: Getting shared notes')
      const response = await fetch(`${API_URL}/api/shares/notes`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return handleApiResponse<SharedNote[]>(response, 'getSharedNotes')
    } catch (error: unknown) {
      console.error('API Error [getSharedNotes]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  return {
    shareNote,
    getNoteShares,
    removeNoteShare,
    getSharedNotes
  }
}

export default useShareService
