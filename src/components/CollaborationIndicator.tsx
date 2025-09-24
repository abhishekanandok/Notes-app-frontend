'use client'

import { useState, useEffect } from 'react'
import { Users, Wifi, WifiOff, Circle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Collaborator {
  id: string
  username: string
  cursorPosition?: { line: number; column: number }
}

interface CollaborationIndicatorProps {
  isConnected: boolean
  collaborators: Collaborator[]
  currentUser?: { id: string; username: string }
}

export function CollaborationIndicator({ 
  isConnected, 
  collaborators, 
  currentUser 
}: CollaborationIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false)

  // Filter out current user from collaborators
  const otherCollaborators = collaborators.filter(c => c.id !== currentUser?.id)

  if (!isConnected && otherCollaborators.length === 0) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
      >
        {isConnected ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <Users className="h-4 w-4" />
        <span className="text-sm font-medium">
          {otherCollaborators.length + (isConnected ? 1 : 0)}
        </span>
      </button>

      {showDetails && (
        <Card className="absolute top-8 right-0 z-50 min-w-[200px]">
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                Collaboration Status
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-muted-foreground">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {currentUser && (
                <div className="flex items-center space-x-2 text-sm">
                  <Circle className="h-3 w-3 fill-blue-500 text-blue-500" />
                  <span className="font-medium">{currentUser.username}</span>
                  <span className="text-xs text-muted-foreground">(You)</span>
                </div>
              )}

              {otherCollaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center space-x-2 text-sm">
                  <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                  <span className="font-medium">{collaborator.username}</span>
                  {collaborator.cursorPosition && (
                    <span className="text-xs text-muted-foreground">
                      (line {collaborator.cursorPosition.line})
                    </span>
                  )}
                </div>
              ))}

              {otherCollaborators.length === 0 && isConnected && (
                <div className="text-sm text-muted-foreground">
                  You're the only one editing this note
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
