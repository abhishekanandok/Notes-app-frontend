'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotes } from '@/contexts/NotesContext'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { DashboardSidebar } from '@/components/DashboardSidebar'
import { DashboardBottomNav } from '@/components/DashboardBottomNav'
import { FolderList } from '@/components/FolderList'
import { SearchBar } from '@/components/SearchBar'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, token, loading: authLoading } = useAuth()
  const { fetchFolders, fetchNotes } = useNotes()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
  }, [token, fetchFolders, fetchNotes])

  if (!mounted || authLoading) {
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
      {/* Navbar */}
      <Navbar />
      
      {/* Main Layout */}
      <div className="flex h-[calc(100vh-6rem)] pt-24">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-24 lg:pb-4">
          <DashboardSidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border pt-24">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h2 className="text-lg font-semibold">Navigation</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <DashboardSidebar />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 lg:pl-80">
          <div className="h-full overflow-y-auto">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4 mr-2" />
                Menu
              </Button>
              <h1 className="text-lg font-semibold">NotesApp</h1>
              <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Content */}
            <div className="p-4 lg:p-6 pb-20 lg:pb-6">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <DashboardBottomNav />
    </div>
  )
}
