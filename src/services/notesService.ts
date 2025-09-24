import BaseService from './base'
import { API_CONFIG, ApiResponse, Note } from './config'

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

class NotesService extends BaseService {
  /**
   * Get all notes for the current user
   */
  async getAllNotes(): Promise<NotesResponse> {
    const response = await this.get<NotesResponse>(API_CONFIG.ENDPOINTS.NOTES)

    // The response is the direct API response: { success: true, count: number, data: [...] }
    if (response.success && response.data) {
      return {
        count: response.count || response.data.length,
        data: response.data
      }
    }

    throw new Error(response.error || 'Failed to fetch notes')
  }

  /**
   * Get a single note by ID
   */
  async getNoteById(id: string): Promise<Note> {
    const response = await this.get<{ data: Note }>(`${API_CONFIG.ENDPOINTS.NOTES}/${id}`)

    // The response is the direct API response: { success: true, data: {...} }
    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.error || 'Failed to fetch note')
  }

  /**
   * Create a new note
   */
  async createNote(data: CreateNoteData): Promise<Note> {
    const response = await this.post<{ data: Note }>(
      API_CONFIG.ENDPOINTS.NOTES,
      data
    )

    // The response is the direct API response: { success: true, data: {...} }
    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.error || 'Failed to create note')
  }

  /**
   * Update an existing note
   */
  async updateNote(id: string, data: UpdateNoteData): Promise<Note> {
    const response = await this.put<{ data: Note }>(
      `${API_CONFIG.ENDPOINTS.NOTES}/${id}`,
      data
    )

    // The response is the direct API response: { success: true, data: {...} }
    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.error || 'Failed to update note')
  }

  /**
   * Delete a note
   */
  async deleteNote(id: string): Promise<void> {
    const response = await this.delete(`${API_CONFIG.ENDPOINTS.NOTES}/${id}`)

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete note')
    }
  }

  /**
   * Search notes by title or content
   */
  async searchNotes(query: string): Promise<Note[]> {
    const response = await this.get<NotesResponse>(
      `${API_CONFIG.ENDPOINTS.NOTES}?search=${encodeURIComponent(query)}`
    )

    if (response.success && response.data) {
      return response.data.data
    }

    throw new Error(response.error || 'Failed to search notes')
  }

  /**
   * Get notes by folder ID
   */
  async getNotesByFolder(folderId: string): Promise<Note[]> {
    const response = await this.get<NotesResponse>(
      `${API_CONFIG.ENDPOINTS.NOTES}?folderId=${folderId}`
    )

    if (response.success && response.data) {
      return response.data.data
    }

    throw new Error(response.error || 'Failed to fetch notes by folder')
  }

  /**
   * Get notes without folder (unorganized notes)
   */
  async getUnorganizedNotes(): Promise<Note[]> {
    const response = await this.get<NotesResponse>(
      `${API_CONFIG.ENDPOINTS.NOTES}?unorganized=true`
    )

    if (response.success && response.data) {
      return response.data.data
    }

    throw new Error(response.error || 'Failed to fetch unorganized notes')
  }
}

export default new NotesService()
