'use client'

import { ThemeProvider } from 'next-themes'
import { ReactNode } from 'react'
import { NotificationProvider } from '@/components/NotificationProvider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </ThemeProvider>
  )
}
