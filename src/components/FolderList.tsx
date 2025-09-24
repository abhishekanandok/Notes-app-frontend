'use client'

import { useState } from 'react'
import { useNotes } from '@/contexts/NotesContext'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, Folder, Plus, X, FileText, MoreVertical, Edit, Trash2, Move } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FolderList() {
  const { folders, createFolder, updateFolder, deleteFolder, notes, updateNote } = useNotes()
  const router = useRouter()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [folderDescription, setFolderDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [showNoteActions, setShowNoteActions] = useState<string | null>(null)

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderName.trim()) return

    setIsCreating(true)
    try {
      await createFolder(folderName.trim(), folderDescription.trim() || undefined)
      setFolderName('')
      setFolderDescription('')
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create folder:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const openCreateModal = () => {
    setShowCreateModal(true)
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
    setFolderName('')
    setFolderDescription('')
  }

  const openNote = (noteId: string) => {
    router.push(`/dashboard/notes/${noteId}`)
  }

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        // Note: deleteNote function should be available from useNotes
        // await deleteNote(noteId)
        console.log('Delete note:', noteId)
      } catch (error) {
        console.error('Failed to delete note:', error)
      }
    }
  }

  const handleMoveNote = async (noteId: string, folderId: string | null) => {
    try {
      await updateNote(noteId, { folderId })
    } catch (error) {
      console.error('Failed to move note:', error)
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          Folders
        </h2>
        <button
          onClick={openCreateModal}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      <div className="space-y-1">
        {folders.map((folder) => (
          <div key={folder.id}>
            <button
              onClick={() => toggleFolder(folder.id)}
              className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                selectedFolder === folder.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {expandedFolders.has(folder.id) ? (
                <ChevronDown className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              <Folder className="h-4 w-4 mr-2" />
              <span className="truncate">{folder.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {folder._count?.notes || 0}
              </span>
            </button>
            
            {expandedFolders.has(folder.id) && (
              <div className="ml-6 mt-1 space-y-1">
                {notes.filter(note => note.folder?.id === folder.id).map((note) => (
                  <div
                    key={note.id}
                    className="group flex items-center justify-between px-3 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                  >
                    <button
                      onClick={() => openNote(note.id)}
                      className="flex items-center space-x-2 flex-1 text-left"
                    >
                      <FileText className="h-3 w-3" />
                      <span className="truncate">{note.title}</span>
                    </button>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setShowNoteActions(showNoteActions === note.id ? null : note.id)}
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
                ))}
                {notes.filter(note => note.folder?.id === folder.id).length === 0 && (
                  <div className="px-3 py-1 text-sm text-muted-foreground">
                    No notes in this folder
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Folder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Create New Folder
              </h3>
              <button
                onClick={closeCreateModal}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label htmlFor="folderName" className="block text-sm font-medium text-foreground mb-2">
                  Folder Name *
                </label>
                <input
                  id="folderName"
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="folderDescription" className="block text-sm font-medium text-foreground mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="folderDescription"
                  value={folderDescription}
                  onChange={(e) => setFolderDescription(e.target.value)}
                  placeholder="Enter folder description"
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none"
                />
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
                  disabled={isCreating || !folderName.trim()}
                  className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
