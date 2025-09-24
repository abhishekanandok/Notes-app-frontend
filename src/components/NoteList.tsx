'use client'

import { useState } from 'react'
import { useNotes } from '@/contexts/NotesContext'
import { useRouter } from 'next/navigation'
import { FileText, Plus, X } from 'lucide-react'

export function NoteList() {
  const { filteredNotes, searchQuery, createNote, folders } = useNotes()
  const router = useRouter()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState<string>('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteTitle.trim()) return

    setIsCreating(true)
    try {
      const newNote = await createNote(
        noteTitle.trim(),
        noteContent.trim(),
        selectedFolderId || undefined
      )
      setNoteTitle('')
      setNoteContent('')
      setSelectedFolderId('')
      setShowCreateModal(false)
      // Navigate to the new note
      router.push(`/notes/${newNote.id}`)
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
    router.push(`/notes/${noteId}`)
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
                onClick={() => openNote(note.id)}
                className="p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {note.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {note.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
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
          Recent Notes
        </h2>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </button>
      </div>
      
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <p>No notes yet. Create your first note to get started!</p>
      </div>

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
                  {folders.map((folder) => (
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
