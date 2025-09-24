'use client'

import { FolderList } from '@/components/FolderList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function FoldersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Folders</h1>
          <p className="text-muted-foreground">
            Organize your notes into folders
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Folder
        </Button>
      </div>

      {/* Folders List */}
      <FolderList />
    </div>
  )
}
