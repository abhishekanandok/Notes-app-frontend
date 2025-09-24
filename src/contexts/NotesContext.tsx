'use client'

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'
import useNotesService from '@/services/notesService'
import useFoldersService from '@/services/foldersService'
import type { Note } from '@/services/notesService'
import type { Folder } from '@/services/foldersService'

// Note and Folder interfaces are now imported from services

interface NotesContextType {
  folders: Folder[]
  notes: Note[]
  activeNote: Note | null
  setActiveNote: (note: Note | null) => void
  updateNoteContent: (noteId: string, content: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  filteredNotes: Note[]
  loading: boolean
  setLoading: (loading: boolean) => void
  fetchFolders: () => Promise<void>
  fetchNotes: () => Promise<void>
  createNote: (title: string, content: string, folderId?: string) => Promise<Note>
  updateNote: (id: string, data: { title?: string; content?: string; folderId?: string }) => Promise<Note>
  deleteNote: (id: string) => Promise<void>
  createFolder: (name: string, description?: string) => Promise<Folder>
  updateFolder: (id: string, data: { name?: string; description?: string }) => Promise<Folder>
  deleteFolder: (id: string) => Promise<void>
}

const NotesContext = createContext<NotesContextType | undefined>(undefined)

export function NotesProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const notesService = useNotesService()
  const foldersService = useFoldersService()

  const fetchFolders = useCallback(async () => {
    setLoading(true)
    try {
      const response = await foldersService.getAllFolders()
      if (response.success && response.data) {
        setFolders(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error)
    } finally {
      setLoading(false)
    }
  }, [foldersService])

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const response = await notesService.getAllNotes()
      if (response.success && response.data) {
        setNotes(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setLoading(false)
    }
  }, [notesService])

  const createNote = useCallback(async (title: string, content: string, folderId?: string): Promise<Note> => {
    try {
      const result = await notesService.createNote({ title, content, folderId: folderId || null })
      if (result.success && result.data) {
        setNotes(prev => [result.data, ...prev])
        return result.data
      } else {
        throw new Error(result.error || 'Failed to create note')
      }
    } catch (error) {
      console.error('Failed to create note:', error)
      throw error
    }
  }, [notesService])

  const updateNote = useCallback(async (id: string, data: { title?: string; content?: string; folderId?: string }): Promise<Note> => {
    try {
      const result = await notesService.updateNote(id, data)
      if (result.success && result.data) {
        const updatedNote = result.data
        setNotes(prev => prev.map(note => note.id === id ? updatedNote : note))
        
        if (activeNote?.id === id) {
          setActiveNote(updatedNote)
        }
        
        return updatedNote
      } else {
        throw new Error(result.error || 'Failed to update note')
      }
    } catch (error) {
      console.error('Failed to update note:', error)
      throw error
    }
  }, [activeNote, notesService])

  const deleteNote = useCallback(async (id: string): Promise<void> => {
    try {
      const result = await notesService.deleteNote(id)
      if (result.success) {
        setNotes(prev => prev.filter(note => note.id !== id))
        
        if (activeNote?.id === id) {
          setActiveNote(null)
        }
      } else {
        throw new Error(result.error || 'Failed to delete note')
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
      throw error
    }
  }, [activeNote, notesService])

  const createFolder = useCallback(async (name: string, description?: string): Promise<Folder> => {
    try {
      const result = await foldersService.createFolder({ name, description })
      if (result.success && result.data) {
        setFolders(prev => [result.data, ...prev])
        return result.data
      } else {
        throw new Error(result.error || 'Failed to create folder')
      }
    } catch (error) {
      console.error('Failed to create folder:', error)
      throw error
    }
  }, [foldersService])

  const updateFolder = useCallback(async (id: string, data: { name?: string; description?: string }): Promise<Folder> => {
    try {
      const result = await foldersService.updateFolder(id, data)
      if (result.success && result.data) {
        const updatedFolder = result.data
        setFolders(prev => prev.map(folder => folder.id === id ? updatedFolder : folder))
        return updatedFolder
      } else {
        throw new Error(result.error || 'Failed to update folder')
      }
    } catch (error) {
      console.error('Failed to update folder:', error)
      throw error
    }
  }, [foldersService])

  const deleteFolder = useCallback(async (id: string): Promise<void> => {
    try {
      const result = await foldersService.deleteFolder(id)
      if (result.success) {
        setFolders(prev => prev.filter(folder => folder.id !== id))
      } else {
        throw new Error(result.error || 'Failed to delete folder')
      }
    } catch (error) {
      console.error('Failed to delete folder:', error)
      throw error
    }
  }, [foldersService])

  const updateNoteContent = useCallback((noteId: string, content: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, content } : note
    ))

    if (activeNote?.id === noteId) {
      setActiveNote(prev => prev ? { ...prev, content } : null)
    }
  }, [activeNote])

  const filteredNotes = searchQuery 
    ? notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes

  return (
    <NotesContext.Provider value={{
      folders,
      notes,
      activeNote,
      setActiveNote,
      updateNoteContent,
      searchQuery,
      setSearchQuery,
      filteredNotes,
      loading,
      setLoading,
      fetchFolders,
      fetchNotes,
      createNote,
      updateNote,
      deleteNote,
      createFolder,
      updateFolder,
      deleteFolder
    }}>
      {children}
    </NotesContext.Provider>
  )
}

export function useNotes() {
  const context = useContext(NotesContext)
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider')
  }
  return context
}
