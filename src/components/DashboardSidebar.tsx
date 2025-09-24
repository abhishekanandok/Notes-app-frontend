'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  FolderOpen, 
  Search, 
  Plus,
  FileText
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'All Notes',
    href: '/dashboard/notes',
    icon: FileText,
  },
  {
    name: 'Folders',
    href: '/dashboard/folders',
    icon: FolderOpen,
  },
]

const secondaryNavigation = [
  {
    name: 'Search',
    href: '/dashboard/search',
    icon: Search,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* New Note Button */}
      <div className="p-4 border-b border-border">
        <Button asChild className="w-full">
          <Link href="/dashboard/notes/new" className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Link>
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === '/dashboard' && pathname === '/dashboard')
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="pt-4 border-t border-border">
          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
