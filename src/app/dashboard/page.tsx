'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Edit, Save, X, Trash2, FolderOpen, FileText, Share2, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import useNotesService from '@/services/notesService'
import useFoldersService from '@/services/foldersService'
import useShareService from '@/services/shareService'
import useUserService from '@/services/userService'
import type { Note } from '@/services/notesService'
import type { Folder } from '@/services/foldersService'
import type { NoteShare, SharedNote } from '@/services/shareService'
import type { User } from '@/services/userService'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const notesService = useNotesService()
  const foldersService = useFoldersService()
  const shareService = useShareService()
  const userService = useUserService()
  
  const [notes, setNotes] = useState<Note[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'notes' | 'folders' | 'shared'>('notes')
  
  // Add/Edit note modal state
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState<string>('')
  const [isSavingNote, setIsSavingNote] = useState(false)

  // Add/Edit folder modal state
  const [showFolderModal, setShowFolderModal] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [folderName, setFolderName] = useState('')
  const [folderDescription, setFolderDescription] = useState('')
  const [isSavingFolder, setIsSavingFolder] = useState(false)

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false)
  const [sharingNote, setSharingNote] = useState<Note | null>(null)
  const [noteShares, setNoteShares] = useState<NoteShare[]>([])
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [shareRole, setShareRole] = useState<'viewer' | 'editor' | 'admin'>('editor')
  const [isSharing, setIsSharing] = useState(false)
  const [isLoadingShares, setIsLoadingShares] = useState(false)

  // Real-time editor state (removed - now using separate page)

  // Filter based on search query
  const filteredNotes = (notes || []).filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredFolders = (folders || []).filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (folder.description && folder.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredSharedNotes = (sharedNotes || []).filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.sharedBy.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch notes, folders, and shared notes in parallel
        const [notesResult, foldersResult, sharedNotesResult] = await Promise.all([
          notesService.getAllNotes(),
          foldersService.getAllFolders(),
          shareService.getSharedNotes()
        ])

        if (notesResult.success && notesResult.data) {
          setNotes(notesResult.data.data || notesResult.data)
        }

        if (foldersResult.success && foldersResult.data) {
          setFolders(foldersResult.data.data || foldersResult.data)
        }

        if (sharedNotesResult.success && sharedNotesResult.data) {
          setSharedNotes(sharedNotesResult.data)
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

  // Note modal functions
  const openAddNoteModal = () => {
    setEditingNote(null)
    setNoteTitle('')
    setNoteContent('')
    setSelectedFolderId('')
    setShowNoteModal(true)
  }

 

  const closeNoteModal = () => {
    setShowNoteModal(false)
    setEditingNote(null)
    setNoteTitle('')
    setNoteContent('')
    setSelectedFolderId('')
  }

  // Folder modal functions
  const openAddFolderModal = () => {
    setEditingFolder(null)
    setFolderName('')
    setFolderDescription('')
    setShowFolderModal(true)
  }

  const openEditFolderModal = (folder: Folder) => {
    setEditingFolder(folder)
    setFolderName(folder.name)
    setFolderDescription(folder.description || '')
    setShowFolderModal(true)
  }

  const closeFolderModal = () => {
    setShowFolderModal(false)
    setEditingFolder(null)
    setFolderName('')
    setFolderDescription('')
  }

  // Share modal functions
  const openShareModal = async (note: Note) => {
    setSharingNote(note)
    setUserSearchQuery('')
    setSearchResults([])
    setSelectedUser(null)
    setShareRole('editor')
    setShowShareModal(true)
    
    // Load existing shares
    setIsLoadingShares(true)
    try {
      const result = await shareService.getNoteShares(note.id)
      if (result.success && result.data) {
        setNoteShares(result.data)
      }
    } catch (error) {
      console.error('Failed to load note shares:', error)
    } finally {
      setIsLoadingShares(false)
    }
  }

  const closeShareModal = () => {
    setShowShareModal(false)
    setSharingNote(null)
    setNoteShares([])
    setUserSearchQuery('')
    setSearchResults([])
    setSelectedUser(null)
    setShareRole('editor')
  }

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    
    try {
      const result = await userService.searchUsers(query)
      if (result.success && result.data) {
        // Filter out current user and already shared users
        const filteredUsers = result.data.filter((u: User) => 
          u.username !== user?.username && 
          !noteShares.some(share => share.user.username === u.username)
        )
        setSearchResults(filteredUsers)
      }
    } catch (error) {
      console.error('Failed to search users:', error)
    }
  }

  // Real-time editor functions
  const openRealTimeEditor = (noteId: string) => {
    router.push(`/dashboard/notes/${noteId}/realtime`)
  }

  // closeRealTimeEditor function removed - no longer needed

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note",
        variant: "destructive",
      })
      return
    }

    setIsSavingNote(true)
    try {
      if (editingNote) {
        // Update existing note
        const result = await notesService.updateNote(editingNote.id, {
          title: noteTitle.trim(),
          content: noteContent.trim(),
          folderId: selectedFolderId || null
        })
        
        if (result.success && result.data) {
          setNotes(prev => prev.map(note => 
            note.id === editingNote.id ? result.data! : note
          ))
          toast({
            title: "Note updated",
            description: "Your note has been updated successfully",
          })
        }
      } else {
        // Create new note
        const result = await notesService.createNote({
          title: noteTitle.trim(),
          content: noteContent.trim(),
          folderId: selectedFolderId || null
        })
        
        if (result.success && result.data) {
          setNotes(prev => [result.data!, ...prev])
          toast({
            title: "Note created",
            description: "Your note has been created successfully",
          })
        }
      }
      
      closeNoteModal()
    } catch (error) {
      console.error('Failed to save note:', error)
      toast({
        title: "Save failed",
        description: "Could not save the note",
        variant: "destructive",
      })
    } finally {
      setIsSavingNote(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        const result = await notesService.deleteNote(noteId)
        if (result.success) {
          setNotes(prev => prev.filter(note => note.id !== noteId))
          toast({
            title: "Note deleted",
            description: "The note has been deleted successfully",
          })
        }
      } catch (error) {
        console.error('Failed to delete note:', error)
        toast({
          title: "Delete failed",
          description: "Could not delete the note",
          variant: "destructive",
        })
      }
    }
  }

  const handleSaveFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your folder",
        variant: "destructive",
      })
      return
    }

    setIsSavingFolder(true)
    try {
      if (editingFolder) {
        // Update existing folder
        const result = await foldersService.updateFolder(editingFolder.id, {
          name: folderName.trim(),
          description: folderDescription.trim() || undefined
        })
        
        if (result.success && result.data) {
          setFolders(prev => prev.map(folder => 
            folder.id === editingFolder.id ? result.data! : folder
          ))
          toast({
            title: "Folder updated",
            description: "Your folder has been updated successfully",
          })
        }
      } else {
        // Create new folder
        const result = await foldersService.createFolder({
          name: folderName.trim(),
          description: folderDescription.trim() || undefined
        })
        
        if (result.success && result.data) {
          setFolders(prev => [result.data!, ...prev])
          toast({
            title: "Folder created",
            description: "Your folder has been created successfully",
          })
        }
      }
      
      closeFolderModal()
    } catch (error) {
      console.error('Failed to save folder:', error)
      toast({
        title: "Save failed",
        description: "Could not save the folder",
        variant: "destructive",
      })
    } finally {
      setIsSavingFolder(false)
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    if (confirm('Are you sure you want to delete this folder? All notes in this folder will be moved to "No folder".')) {
      try {
        const result = await foldersService.deleteFolder(folderId)
        if (result.success) {
          setFolders(prev => prev.filter(folder => folder.id !== folderId))
          // Update notes to remove folder reference
          setNotes(prev => prev.map(note => 
            note.folder?.id === folderId ? { ...note, folder: null, folderId: null } : note
          ))
          toast({
            title: "Folder deleted",
            description: "The folder has been deleted successfully",
          })
        }
      } catch (error) {
        console.error('Failed to delete folder:', error)
        toast({
          title: "Delete failed",
          description: "Could not delete the folder",
          variant: "destructive",
        })
      }
    }
  }

  const handleShareNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !sharingNote) return

    setIsSharing(true)
    try {
      const result = await shareService.shareNote(sharingNote.id, {
        username: selectedUser.username,
        role: shareRole
      })
      
      if (result.success && result.data) {
        setNoteShares(prev => [...prev, result.data!])
        setSelectedUser(null)
        setUserSearchQuery('')
        setSearchResults([])
        toast({
          title: "Note shared",
          description: `Note shared with ${selectedUser.username} as ${shareRole}`,
        })
      }
    } catch (error) {
      console.error('Failed to share note:', error)
      toast({
        title: "Share failed",
        description: "Could not share the note",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleRemoveShare = async (shareId: string, username: string) => {
    if (!sharingNote) return

    try {
      const result = await shareService.removeNoteShare(sharingNote.id, username)
      if (result.success) {
        setNoteShares(prev => prev.filter(share => share.id !== shareId))
        toast({
          title: "Share removed",
          description: "User access to the note has been removed",
        })
      }
    } catch (error) {
      console.error('Failed to remove share:', error)
      toast({
        title: "Remove failed",
        description: "Could not remove the share",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pt-16 p-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.username}
          </h1>
          <p className="text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pt-16 p-4">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.username}
        </h1>
        <p className="text-muted-foreground">
          Manage your notes and folders
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'notes'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Notes ({notes.length})
        </button>
        <button
          onClick={() => setActiveTab('folders')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'folders'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Folders ({folders.length})
        </button>
        <button
          onClick={() => setActiveTab('shared')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'shared'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Shared ({sharedNotes.length})
        </button>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        {activeTab !== 'shared' && (
          <Button onClick={activeTab === 'notes' ? openAddNoteModal : openAddFolderModal}>
            <Plus className="h-4 w-4 mr-2" />
            New {activeTab === 'notes' ? 'Note' : 'Folder'}
          </Button>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'notes' && (
        filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? `No notes match "${searchQuery}"` 
                : 'Create your first note to get started!'
              }
            </p>
            {!searchQuery && (
              <Button onClick={openAddNoteModal}>
                <Plus className="h-4 w-4 mr-2" />
                Create Note
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note) => (
              <Card 
                key={note.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openRealTimeEditor(note.id)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-foreground line-clamp-2">
                        {note.title}
                      </h3>
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            openShareModal(note)
                          }}
                          className="h-6 w-6 p-0"
                          title="Share note"
                        >
                          <Share2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteNote(note.id)
                          }}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {note.content || 'No content'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                      {note.folder && (
                        <div className="flex items-center space-x-1">
                          <FolderOpen className="h-3 w-3" />
                          <span>{note.folder.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
          </CardContent>
        </Card>
            ))}
          </div>
        )
      )}

      {activeTab === 'folders' && (
        filteredFolders.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? 'No folders found' : 'No folders yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? `No folders match "${searchQuery}"` 
                : 'Create your first folder to organize your notes!'
              }
            </p>
            {!searchQuery && (
              <Button onClick={openAddFolderModal}>
                <Plus className="h-4 w-4 mr-2" />
                Create Folder
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFolders.map((folder) => (
              <Card key={folder.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-foreground line-clamp-2">
                        {folder.name}
                      </h3>
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditFolderModal(folder)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFolder(folder.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {folder.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {folder.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {new Date(folder.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-3 w-3" />
                        <span>{folder._count?.notes || 0} notes</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {activeTab === 'shared' && (
        filteredSharedNotes.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? 'No shared notes found' : 'No shared notes yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? `No shared notes match "${searchQuery}"` 
                : 'Notes shared with you will appear here!'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSharedNotes.map((note) => (
              <Card 
                key={note.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openRealTimeEditor(note.id)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-foreground line-clamp-2">
                        {note.title}
                      </h3>
                      <div className="flex items-center space-x-1 ml-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          note.shareRole === 'admin' ? 'bg-red-100 text-red-800' :
                          note.shareRole === 'editor' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {note.shareRole}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {note.content || 'No content'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>by {note.sharedBy.username}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Add/Edit Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {editingNote ? 'Edit Note' : 'Create New Note'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeNoteModal}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <form onSubmit={handleSaveNote} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                    Title *
                  </label>
                  <Input
                    id="title"
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Enter note title"
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
                    {(folders || []).map((folder) => (
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
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Enter note content"
                    rows={5}
                    className="resize-none"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeNoteModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSavingNote || !noteTitle.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSavingNote ? 'Saving...' : (editingNote ? 'Update' : 'Create')}
            </Button>
                </div>
              </form>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Add/Edit Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {editingFolder ? 'Edit Folder' : 'Create New Folder'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeFolderModal}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <form onSubmit={handleSaveFolder} className="space-y-4">
                <div>
                  <label htmlFor="folderName" className="block text-sm font-medium text-foreground mb-2">
                    Folder Name *
                  </label>
                  <Input
                    id="folderName"
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="Enter folder name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="folderDescription" className="block text-sm font-medium text-foreground mb-2">
                    Description (Optional)
                  </label>
                  <Textarea
                    id="folderDescription"
                    value={folderDescription}
                    onChange={(e) => setFolderDescription(e.target.value)}
                    placeholder="Enter folder description"
                    rows={3}
                    className="resize-none"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeFolderModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSavingFolder || !folderName.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSavingFolder ? 'Saving...' : (editingFolder ? 'Update' : 'Create')}
          </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && sharingNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Share &ldquo;{sharingNote.title}&rdquo;
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeShareModal}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Add new share */}
              <form onSubmit={handleShareNote} className="space-y-4 mb-6">
                <div>
                  <label htmlFor="userSearch" className="block text-sm font-medium text-foreground mb-2">
                    Search Users
                  </label>
                  <Input
                    id="userSearch"
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => {
                      setUserSearchQuery(e.target.value)
                      searchUsers(e.target.value)
                    }}
                    placeholder="Search by username or email..."
                  />
                  
                  {/* Search results */}
                  {searchResults.length > 0 && (
                    <div className="mt-2 border border-border rounded-md bg-background max-h-32 overflow-y-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setSelectedUser(user)
                            setUserSearchQuery(user.username)
                            setSearchResults([])
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground border-b border-border last:border-b-0"
                        >
                          <div className="font-medium">{user.username}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {selectedUser && (
                  <div>
                    <label htmlFor="shareRole" className="block text-sm font-medium text-foreground mb-2">
                      Permission Level
                    </label>
                    <select
                      id="shareRole"
                      value={shareRole}
                      onChange={(e) => setShareRole(e.target.value as  'editor')}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                    >
                      
                      <option value="editor">Editor (Read & Write)</option>
                      
                    </select>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedUser(null)
                      setUserSearchQuery('')
                      setSearchResults([])
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    type="submit"
                    disabled={!selectedUser || isSharing}
                  >
                    {isSharing ? 'Sharing...' : 'Share'}
                  </Button>
                </div>
              </form>

              {/* Existing shares */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Current Shares</h3>
                {isLoadingShares ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Loading shares...
                  </div>
                ) : noteShares.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No shares yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {noteShares.map((share) => (
                      <div key={share.id} className="flex items-center justify-between p-3 border border-border rounded-md">
                        <div>
                          <div className="font-medium text-sm">{share.user.username}</div>
                          <div className="text-xs text-muted-foreground">{share.user.email}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            share.role === 'admin' ? 'bg-red-100 text-red-800' :
                            share.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {share.role}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveShare(share.id, share.user.username)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  )
}