'use client'

import { useAuth } from '@/providers/auth-provider'
import { Sidebar } from '@/components/sidebar'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { user, loading } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)]">
        <main className="flex-1">{children}</main>
      </div>
    )
  }

  // If user is authenticated, show sidebar + main content
  if (user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    )
  }

  // If not authenticated, show only main content (full width)
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <main className="w-full">{children}</main>
    </div>
  )
}
