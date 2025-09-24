'use client'

import { SearchBar } from '@/components/SearchBar'
import { NoteList } from '@/components/NoteList'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search } from 'lucide-react'

export default function SearchPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Search Notes</h1>
        <p className="text-muted-foreground">
          Find your notes quickly and easily
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search
          </CardTitle>
          <CardDescription>
            Search through all your notes and folders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchBar />
        </CardContent>
      </Card>

      {/* Search Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Search Results</h2>
        <NoteList />
      </div>
    </div>
  )
}
