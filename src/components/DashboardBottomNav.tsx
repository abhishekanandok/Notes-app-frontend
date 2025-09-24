'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
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
    name: 'Notes',
    href: '/dashboard/notes',
    icon: FileText,
  },
  {
    name: 'Folders',
    href: '/dashboard/folders',
    icon: FolderOpen,
  },
  {
    name: 'Search',
    href: '/dashboard/search',
    icon: Search,
  },
  {
    name: 'New Note',
    href: '/dashboard/notes/new',
    icon: Plus,
  },
]

export function DashboardBottomNav() {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState(pathname)

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href === '/dashboard' && pathname === '/dashboard')
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setActiveTab(item.href)}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 px-2 py-2 rounded-lg transition-all duration-200",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 mb-1 transition-all duration-200",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-xs font-medium truncate transition-all duration-200",
                isActive && "font-semibold"
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
