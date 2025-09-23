'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { notesService, foldersService, Note, Folder } from '@/services'

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

  const fetchFolders = async () => {
    setLoading(true)
    try {
      const response = await foldersService.getAllFolders()
      setFolders(response.data)
    } catch (error) {
      console.error('Failed to fetch folders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const response = await notesService.getAllNotes()
      setNotes(response.data)
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNote = async (title: string, content: string, folderId?: string): Promise<Note> => {
    try {
      const note = await notesService.createNote({ title, content, folderId: folderId || null })
      setNotes(prev => [note, ...prev])
      return note
    } catch (error) {
      console.error('Failed to create note:', error)
      throw error
    }
  }

  const updateNote = async (id: string, data: { title?: string; content?: string; folderId?: string }): Promise<Note> => {
    try {
      const updatedNote = await notesService.updateNote(id, data)
      setNotes(prev => prev.map(note => note.id === id ? updatedNote : note))
      
      if (activeNote?.id === id) {
        setActiveNote(updatedNote)
      }
      
      return updatedNote
    } catch (error) {
      console.error('Failed to update note:', error)
      throw error
    }
  }

  const deleteNote = async (id: string): Promise<void> => {
    try {
      await notesService.deleteNote(id)
      setNotes(prev => prev.filter(note => note.id !== id))
      
      if (activeNote?.id === id) {
        setActiveNote(null)
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
      throw error
    }
  }

  const createFolder = async (name: string, description?: string): Promise<Folder> => {
    try {
      const folder = await foldersService.createFolder({ name, description })
      setFolders(prev => [folder, ...prev])
      return folder
    } catch (error) {
      console.error('Failed to create folder:', error)
      throw error
    }
  }

  const updateFolder = async (id: string, data: { name?: string; description?: string }): Promise<Folder> => {
    try {
      const updatedFolder = await foldersService.updateFolder(id, data)
      setFolders(prev => prev.map(folder => folder.id === id ? updatedFolder : folder))
      return updatedFolder
    } catch (error) {
      console.error('Failed to update folder:', error)
      throw error
    }
  }

  const deleteFolder = async (id: string): Promise<void> => {
    try {
      await foldersService.deleteFolder(id)
      setFolders(prev => prev.filter(folder => folder.id !== id))
    } catch (error) {
      console.error('Failed to delete folder:', error)
      throw error
    }
  }

  const updateNoteContent = (noteId: string, content: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, content } : note
    ))

    if (activeNote?.id === noteId) {
      setActiveNote(prev => prev ? { ...prev, content } : null)
    }
  }

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
