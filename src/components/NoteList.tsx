'use client'

import { useNotes } from '@/contexts/NotesContext'
import { useRouter } from 'next/navigation'
import { FileText, Plus } from 'lucide-react'

export function NoteList() {
  const { filteredNotes, searchQuery } = useNotes()
  const router = useRouter()

  const createNewNote = async () => {
    // Implementation for creating new note
    console.log('Create new note')
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
            No notes found matching "{searchQuery}"
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
          onClick={createNewNote}
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
    </div>
  )
}
