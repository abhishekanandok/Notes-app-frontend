// Types
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

export interface CreateFolderData {
  name: string
  description?: string
}

export interface UpdateFolderData {
  name?: string
  description?: string
}

export interface FoldersResponse {
  count: number
  data: Folder[]
}

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  count?: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const useFoldersService = () => {
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
   * Get all folders for the current user
   */
  const getAllFolders = async (): Promise<ApiResponse<FoldersResponse>> => {
    try {
      console.log('API Call: Getting all folders')
      const response = await fetch(`${API_URL}/api/folders`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return handleApiResponse<FoldersResponse>(response, 'getAllFolders')
    } catch (error: unknown) {
      console.error('API Error [getAllFolders]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  /**
   * Get a single folder by ID with its notes
   */
  const getFolderById = async (id: string): Promise<ApiResponse<Folder>> => {
    try {
      console.log('API Call: Getting folder by ID', id)
      const response = await fetch(`${API_URL}/api/folders/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return handleApiResponse<Folder>(response, 'getFolderById')
    } catch (error: unknown) {
      console.error('API Error [getFolderById]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  /**
   * Create a new folder
   */
  const createFolder = async (data: CreateFolderData): Promise<ApiResponse<Folder>> => {
    try {
      console.log('API Call: Creating folder', data)
      const response = await fetch(`${API_URL}/api/folders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      
      return handleApiResponse<Folder>(response, 'createFolder')
    } catch (error: unknown) {
      console.error('API Error [createFolder]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  /**
   * Update an existing folder
   */
  const updateFolder = async (id: string, data: UpdateFolderData): Promise<ApiResponse<Folder>> => {
    try {
      console.log('API Call: Updating folder', { id, data })
      const response = await fetch(`${API_URL}/api/folders/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      
      return handleApiResponse<Folder>(response, 'updateFolder')
    } catch (error: unknown) {
      console.error('API Error [updateFolder]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  /**
   * Delete a folder
   * Note: All notes in the folder will be moved to "no folder" (folderId becomes null)
   */
  const deleteFolder = async (id: string): Promise<ApiResponse<void>> => {
    try {
      console.log('API Call: Deleting folder', id)
      const response = await fetch(`${API_URL}/api/folders/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      return handleApiResponse<void>(response, 'deleteFolder')
    } catch (error: unknown) {
      console.error('API Error [deleteFolder]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  /**
   * Get folder statistics
   */
  const getFolderStats = async (): Promise<ApiResponse<{ totalFolders: number; totalNotes: number }>> => {
    try {
      console.log('API Call: Getting folder statistics')
      const response = await fetch(`${API_URL}/api/folders/stats`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return handleApiResponse<{ totalFolders: number; totalNotes: number }>(response, 'getFolderStats')
    } catch (error: unknown) {
      console.error('API Error [getFolderStats]:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }

  return {
    getAllFolders,
    getFolderById,
    createFolder,
    updateFolder,
    deleteFolder,
    getFolderStats
  }
}

export default useFoldersService
