'use client'

import { useState } from 'react'
import { useNotes } from '@/contexts/NotesContext'
import { ChevronDown, ChevronRight, Folder, Plus } from 'lucide-react'

export function FolderList() {
  const { folders } = useNotes()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const createNewFolder = async () => {
    // Implementation for creating new folder
    console.log('Create new folder')
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          Folders
        </h2>
        <button
          onClick={createNewFolder}
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
                {folder.notes.length}
              </span>
            </button>
            
            {expandedFolders.has(folder.id) && (
              <div className="ml-6 mt-1 space-y-1">
                {folder.notes.map((note) => (
                  <button
                    key={note.id}
                    className="w-full text-left px-3 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                  >
                    {note.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
