'use client'

import { useState } from 'react'
import { useNotes } from '@/contexts/NotesContext'
import { ChevronDown, ChevronRight, Folder, Plus, X } from 'lucide-react'

export function FolderList() {
  const { folders, createFolder } = useNotes()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [folderDescription, setFolderDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

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
                {folder.notes?.map((note) => (
                  <button
                    key={note.id}
                    className="w-full text-left px-3 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                  >
                    {note.title}
                  </button>
                )) || (
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
