'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { HomePage } from '@/components/HomePage'

export default function Home() {
  const { token, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && token) {
      router.push('/dashboard')
    }
  }, [token, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (token) {
    return null // Will redirect to dashboard
  }

  return <HomePage />
}