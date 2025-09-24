'use client'

import { useTheme } from 'next-themes'
import { useAuth } from '@/contexts/AuthContext'
import { Moon, Sun, LogOut, User, NotebookPen, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-7xl px-4">
      <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-lg shadow-black/5">
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-between items-center h-20 px-6">
          <div className="flex items-center">
            <Link 
              href={user ? "/dashboard" : "/"} 
              className="flex items-center space-x-3 hover:opacity-80 transition-all duration-200 group"
            >
              <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                <NotebookPen className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-caveat">
                NotesApp
              </h1>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            {user ? (
              <>
                <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-muted/50 text-sm text-muted-foreground">
                  <div className="p-1.5 bg-primary/10 rounded-xl">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{user.username}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout}
                  
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                 
                  asChild
                 
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button 
                  
                  asChild
                  
                >
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex justify-between items-center h-20 px-4">
            <Link 
              href={user ? "/dashboard" : "/"} 
              className="flex items-center space-x-2 hover:opacity-80 transition-all duration-200 group"
            >
              <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                <NotebookPen className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-caveat">
                NotesApp
              </h1>
            </Link>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="border-t border-border/50 bg-background/95 backdrop-blur-sm rounded-b-3xl">
              <div className="px-4 py-4 space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-muted/50 text-sm text-muted-foreground">
                      <div className="p-1.5 bg-primary/10 rounded-xl">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{user.username}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        logout()
                        setIsMobileMenuOpen(false)
                      }}
                      
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      asChild
                      
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button 
                      size="sm"
                      asChild
                      
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href="/signup">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
