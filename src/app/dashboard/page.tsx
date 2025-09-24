'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotes } from '@/contexts/NotesContext'
import { Navbar } from '@/components/Navbar'
import { FolderList } from '@/components/FolderList'
import { NoteList } from '@/components/NoteList'
import { SearchBar } from '@/components/SearchBar'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth()
  const { fetchFolders, fetchNotes } = useNotes()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login')
    }
  }, [token, authLoading, router])

  useEffect(() => {
    if (token) {
      fetchFolders()
      fetchNotes()
    }
  }, [token, fetchFolders, fetchNotes]) // Now safe to include since they're memoized

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-80 border-r border-border bg-card">
          <div className="p-4">
            <SearchBar />
          </div>
          <FolderList />
        </div>
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-foreground mb-6">
              Welcome back, {user.username}
            </h1>
            <NoteList />
          </div>
        </div>
      </div>
    </div>
  )
}
