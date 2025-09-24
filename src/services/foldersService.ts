import BaseService from './base'
import { API_CONFIG, ApiResponse, Folder } from './config'

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

class FoldersService extends BaseService {
  /**
   * Get all folders for the current user
   */
  async getAllFolders(): Promise<FoldersResponse> {
    const response = await this.get<FoldersResponse>(API_CONFIG.ENDPOINTS.FOLDERS)

    // The response is the direct API response: { success: true, count: number, data: [...] }
    if (response.success && response.data) {
      return {
        count: response.count || response.data.length,
        data: response.data
      }
    }

    throw new Error(response.error || 'Failed to fetch folders')
  }

  /**
   * Get a single folder by ID with its notes
   */
  async getFolderById(id: string): Promise<Folder> {
    const response = await this.get<{ data: Folder }>(`${API_CONFIG.ENDPOINTS.FOLDERS}/${id}`)

    // The response is the direct API response: { success: true, data: {...} }
    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.error || 'Failed to fetch folder')
  }

  /**
   * Create a new folder
   */
  async createFolder(data: CreateFolderData): Promise<Folder> {
    const response = await this.post<{ data: Folder }>(
      API_CONFIG.ENDPOINTS.FOLDERS,
      data
    )

    // The response is the direct API response: { success: true, data: {...} }
    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.error || 'Failed to create folder')
  }

  /**
   * Update an existing folder
   */
  async updateFolder(id: string, data: UpdateFolderData): Promise<Folder> {
    const response = await this.put<{ data: Folder }>(
      `${API_CONFIG.ENDPOINTS.FOLDERS}/${id}`,
      data
    )

    // The response is the direct API response: { success: true, data: {...} }
    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.error || 'Failed to update folder')
  }

  /**
   * Delete a folder
   * Note: All notes in the folder will be moved to "no folder" (folderId becomes null)
   */
  async deleteFolder(id: string): Promise<void> {
    const response = await this.delete(`${API_CONFIG.ENDPOINTS.FOLDERS}/${id}`)

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete folder')
    }
  }

  /**
   * Get folder statistics
   */
  async getFolderStats(): Promise<{ totalFolders: number; totalNotes: number }> {
    const response = await this.get<{ data: { totalFolders: number; totalNotes: number } }>(
      `${API_CONFIG.ENDPOINTS.FOLDERS}/stats`
    )

    if (response.success && response.data) {
      return response.data.data
    }

    throw new Error(response.error || 'Failed to fetch folder statistics')
  }
}

export default new FoldersService()
