// Types
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

export interface CreateNoteData {
  title: string
  content: string
  folderId?: string | null
}

export interface UpdateNoteData {
  title?: string
  content?: string
  folderId?: string | null
}

export interface NotesResponse {
  count: number
  data: Note[]
}

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  count?: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const useNotesService = () => {
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
   * Get all notes for the current user
   */
  const getAllNotes = async (): Promise<ApiResponse<NotesResponse>> => {
    try {
      console.log('API Call: Getting all notes')
      const response = await fetch(`${API_URL}/api/notes`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return handleApiResponse<NotesResponse>(response, 'getAllNotes')
    } catch (error: unknown) {
      console.error('API Error [getAllNotes]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  /**
   * Get a single note by ID
   */
  const getNoteById = async (id: string): Promise<ApiResponse<Note>> => {
    try {
      console.log('API Call: Getting note by ID', id)
      const response = await fetch(`${API_URL}/api/notes/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return handleApiResponse<Note>(response, 'getNoteById')
    } catch (error: unknown) {
      console.error('API Error [getNoteById]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  /**
   * Create a new note
   */
  const createNote = async (data: CreateNoteData): Promise<ApiResponse<Note>> => {
    try {
      console.log('API Call: Creating note', data)
      const response = await fetch(`${API_URL}/api/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      
      return handleApiResponse<Note>(response, 'createNote')
    } catch (error: unknown) {
      console.error('API Error [createNote]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  /**
   * Update an existing note
   */
  const updateNote = async (id: string, data: UpdateNoteData): Promise<ApiResponse<Note>> => {
    try {
      console.log('API Call: Updating note', { id, data })
      const response = await fetch(`${API_URL}/api/notes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      
      return handleApiResponse<Note>(response, 'updateNote')
    } catch (error: unknown) {
      console.error('API Error [updateNote]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  /**
   * Delete a note
   */
  const deleteNote = async (id: string): Promise<ApiResponse<void>> => {
    try {
      console.log('API Call: Deleting note', id)
      const response = await fetch(`${API_URL}/api/notes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      return handleApiResponse<void>(response, 'deleteNote')
    } catch (error: unknown) {
      console.error('API Error [deleteNote]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  /**
   * Search notes by title or content
   */
  const searchNotes = async (query: string): Promise<ApiResponse<Note[]>> => {
    try {
      console.log('API Call: Searching notes', query)
      const response = await fetch(`${API_URL}/api/notes?search=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return handleApiResponse<Note[]>(response, 'searchNotes')
    } catch (error: unknown) {
      console.error('API Error [searchNotes]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  /**
   * Get notes by folder ID
   */
  const getNotesByFolder = async (folderId: string): Promise<ApiResponse<Note[]>> => {
    try {
      console.log('API Call: Getting notes by folder', folderId)
      const response = await fetch(`${API_URL}/api/notes?folderId=${folderId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return handleApiResponse<Note[]>(response, 'getNotesByFolder')
    } catch (error: unknown) {
      console.error('API Error [getNotesByFolder]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  /**
   * Get notes without folder (unorganized notes)
   */
  const getUnorganizedNotes = async (): Promise<ApiResponse<Note[]>> => {
    try {
      console.log('API Call: Getting unorganized notes')
      const response = await fetch(`${API_URL}/api/notes?unorganized=true`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return handleApiResponse<Note[]>(response, 'getUnorganizedNotes')
    } catch (error: unknown) {
      console.error('API Error [getUnorganizedNotes]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  return {
    getAllNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
    getNotesByFolder,
    getUnorganizedNotes
  }
}

export default useNotesService
