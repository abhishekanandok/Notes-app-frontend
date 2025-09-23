// Export all services
export { default as authService } from './authService'
export { default as notesService } from './notesService'
export { default as foldersService } from './foldersService'
export { default as websocketService } from './websocketService'

// Export types and config
export * from './config'
export type { RegisterData, LoginData, AuthResponse } from './authService'
export type { CreateNoteData, UpdateNoteData, NotesResponse } from './notesService'
export type { CreateFolderData, UpdateFolderData, FoldersResponse } from './foldersService'
export type { WSEventType, WSEventHandlers } from './websocketService'
