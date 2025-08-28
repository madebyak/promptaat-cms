'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { supabase } from '@/lib/supabase'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  allowedRoles?: string[]
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  allowedRoles = [] 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [adminRole, setAdminRole] = useState<string | null>(null)

  useEffect(() => {
    const checkAuthorization = async () => {
      if (loading) return

      // If no user, redirect to login
      if (!user) {
        setIsAuthorized(false)
        router.push('/auth/login')
        return
      }

      // Verify the session is still valid
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          console.log('Session invalid, redirecting to login')
          setIsAuthorized(false)
          router.push('/auth/login')
          return
        }

        // If admin access is required, check admin status
        if (requireAdmin) {
          try {
            const { data: adminData, error: adminError } = await supabase
              .from('admins')
              .select('role')
              .eq('id', user.id)
              .single()

            if (adminError || !adminData) {
              // User is not an admin
              console.log('User is not an admin:', adminError)
              setIsAuthorized(false)
              router.push('/unauthorized')
              return
            }

            setAdminRole(adminData.role)

            // Check if user's role is in allowed roles (if specified)
            if (allowedRoles.length > 0 && !allowedRoles.includes(adminData.role)) {
              setIsAuthorized(false)
              router.push('/unauthorized')
              return
            }

            setIsAuthorized(true)
          } catch (error) {
            console.error('Authorization check failed:', error)
            setIsAuthorized(false)
            router.push('/unauthorized')
          }
        } else {
          // No admin requirement, just need to be authenticated
          setIsAuthorized(true)
        }
      } catch (error) {
        console.error('Session verification failed:', error)
        setIsAuthorized(false)
        router.push('/auth/login')
      }
    }

    checkAuthorization()
  }, [user, loading, router, requireAdmin, allowedRoles])

  // Show loading state
  if (loading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show unauthorized message
  if (isAuthorized === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Unauthorized</h1>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    )
  }

  // Render children if authorized
  return <>{children}</>
}

// Higher-order component for easier use
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { requireAdmin?: boolean; allowedRoles?: string[] } = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute
        requireAdmin={options.requireAdmin}
        allowedRoles={options.allowedRoles}
      >
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}
