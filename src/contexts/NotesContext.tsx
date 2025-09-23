'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface Note {
  id: string
  title: string
  content: string
  folderId: string
  updatedAt: string
}

interface Folder {
  id: string
  name: string
  notes: Note[]
}

interface NotesContextType {
  folders: Folder[]
  activeNote: Note | null
  setActiveNote: (note: Note | null) => void
  updateNoteContent: (noteId: string, content: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  filteredNotes: Note[]
  loading: boolean
  setLoading: (loading: boolean) => void
}

const NotesContext = createContext<NotesContextType | undefined>(undefined)

export function NotesProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const updateNoteContent = (noteId: string, content: string) => {
    setFolders(prev => prev.map(folder => ({
      ...folder,
      notes: folder.notes.map(note => 
        note.id === noteId ? { ...note, content } : note
      )
    })))

    if (activeNote?.id === noteId) {
      setActiveNote(prev => prev ? { ...prev, content } : null)
    }
  }

  const filteredNotes = folders.flatMap(folder => 
    folder.notes.filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return (
    <NotesContext.Provider value={{
      folders,
      activeNote,
      setActiveNote,
      updateNoteContent,
      searchQuery,
      setSearchQuery,
      filteredNotes,
      loading,
      setLoading
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
