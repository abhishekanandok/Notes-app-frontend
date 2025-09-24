'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, X, MoreVertical, Edit, Trash2, Move } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/SearchBar'
import useNotesService from '@/services/notesService'
import useFoldersService from '@/services/foldersService'
import type { Note } from '@/services/notesService'
import type { Folder } from '@/services/foldersService'

export function NoteList() {
  const router = useRouter()
  const notesService = useNotesService()
  const foldersService = useFoldersService()
  
  const [notes, setNotes] = useState<Note[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState<string>('')
  const [isCreating, setIsCreating] = useState(false)
  const [showNoteActions, setShowNoteActions] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter notes based on search query
  const filteredNotes = (notes || []).filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch notes and folders in parallel
        const [notesResult, foldersResult] = await Promise.all([
          notesService.getAllNotes(),
          foldersService.getAllFolders()
        ])

        if (notesResult.success && notesResult.data) {
          setNotes(notesResult.data.data)
        }

        if (foldersResult.success && foldersResult.data) {
          setFolders(foldersResult.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteTitle.trim()) return

    setIsCreating(true)
    try {
      const result = await notesService.createNote({
        title: noteTitle.trim(),
        content: noteContent.trim(),
        folderId: selectedFolderId || null
      })
      
      if (result.success && result.data) {
        setNotes(prev => [result.data!, ...prev])
        setNoteTitle('')
        setNoteContent('')
        setSelectedFolderId('')
        setShowCreateModal(false)
        // Navigate to the new note
        router.push(`/dashboard/notes/${result.data.id}`)
      }
    } catch (error) {
      console.error('Failed to create note:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const openCreateModal = () => {
    setShowCreateModal(true)
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
    setNoteTitle('')
    setNoteContent('')
    setSelectedFolderId('')
  }

  const openNote = (noteId: string) => {
    router.push(`/dashboard/notes/${noteId}`)
  }

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        const result = await notesService.deleteNote(noteId)
        if (result.success) {
          setNotes(prev => prev.filter(note => note.id !== noteId))
          setShowNoteActions(null)
        }
      } catch (error) {
        console.error('Failed to delete note:', error)
      }
    }
  }

  const handleMoveNote = async (noteId: string, folderId: string | null) => {
    try {
      const result = await notesService.updateNote(noteId, { folderId })
      if (result.success && result.data) {
        setNotes(prev => prev.map(note => 
          note.id === noteId ? result.data! : note
        ))
        setShowNoteActions(null)
      }
    } catch (error) {
      console.error('Failed to move note:', error)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <p>Loading notes...</p>
      </div>
    )
  }

  if (searchQuery) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Search Results ({filteredNotes.length})
          </h2>
        </div>
        
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No notes found matching {searchQuery}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="text-sm font-medium text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                      onClick={() => openNote(note.id)}
                    >
                      {note.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {note.content || 'No content'}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                      {note.folder && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {note.folder.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowNoteActions(showNoteActions === note.id ? null : note.id)
                      }}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                    {showNoteActions === note.id && (
                      <div className="absolute right-0 top-6 bg-card border border-border rounded-md shadow-lg z-10 min-w-[120px]">
                        <button
                          onClick={() => {
                            openNote(note.id)
                            setShowNoteActions(null)
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center space-x-2"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            handleMoveNote(note.id, null)
                            setShowNoteActions(null)
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center space-x-2"
                        >
                          <Move className="h-3 w-3" />
                          <span>Move Out</span>
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteNote(note.id)
                            setShowNoteActions(null)
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-accent text-destructive flex items-center space-x-2"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          {searchQuery ? `Search Results (${filteredNotes.length})` : `Recent Notes (${filteredNotes.length})`}
        </h2>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar 
          onSearch={setSearchQuery}
          placeholder="Search notes by title or content..."
        />
      </div>
      
      {filteredNotes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p>{searchQuery ? `No notes found matching "${searchQuery}"` : 'No notes yet. Create your first note to get started!'}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => openNote(note.id)}
              className="p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {note.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {note.content || 'No content'}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                    {note.folder && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {note.folder.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Note Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Create New Note
              </h3>
              <button
                onClick={closeCreateModal}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label htmlFor="noteTitle" className="block text-sm font-medium text-foreground mb-2">
                  Note Title *
                </label>
                <input
                  id="noteTitle"
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Enter note title"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="noteContent" className="block text-sm font-medium text-foreground mb-2">
                  Content (Optional)
                </label>
                <textarea
                  id="noteContent"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Enter note content"
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none"
                />
              </div>
              
              <div>
                <label htmlFor="folderSelect" className="block text-sm font-medium text-foreground mb-2">
                  Folder (Optional)
                </label>
                <select
                  id="folderSelect"
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                >
                  <option value="">No folder</option>
                  {(folders || []).map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !noteTitle.trim()}
                  className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
