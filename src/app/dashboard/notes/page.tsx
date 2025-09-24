'use client'

import { NoteList } from '@/components/NoteList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function NotesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Notes</h1>
          <p className="text-muted-foreground">
            Manage and organize your notes
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/notes/new">
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Link>
        </Button>
      </div>

      {/* Notes List */}
      <NoteList />
    </div>
  )
}
