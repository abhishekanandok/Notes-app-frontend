'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useNotes } from '@/contexts/NotesContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, FolderOpen } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function NewNotePage() {
  const router = useRouter()
  const { user } = useAuth()
  const { createNote, folders } = useNotes()
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState<string>('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const newNote = await createNote(
        title.trim(),
        content.trim(),
        selectedFolderId || undefined
      )
      
      toast({
        title: "Note created",
        description: "Your note has been created successfully",
      })
      
      // Navigate to the new note
      router.push(`/dashboard/notes/${newNote.id}`)
    } catch (error) {
      console.error('Failed to create note:', error)
      toast({
        title: "Creation failed",
        description: "Could not create the note",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/notes')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create New Note</h1>
            <p className="text-muted-foreground">Start writing your new note</p>
          </div>
        </div>
      </div>

      {/* Note Editor */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleCreateNote} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Title *
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title..."
                className="text-lg font-semibold"
                required
              />
            </div>
            
            <div>
              <label htmlFor="folder" className="block text-sm font-medium text-foreground mb-2">
                Folder (Optional)
              </label>
              <select
                id="folder"
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
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-foreground mb-2">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your note..."
                className="min-h-[400px] resize-none"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                {selectedFolderId && (
                  <div className="flex items-center space-x-1">
                    <FolderOpen className="h-4 w-4" />
                    <span>{folders.find(f => f.id === selectedFolderId)?.name}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/notes')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || !title.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isCreating ? 'Creating...' : 'Create Note'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
