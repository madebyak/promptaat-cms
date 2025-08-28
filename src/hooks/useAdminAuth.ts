'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { supabase } from '@/lib/supabase'

interface AdminData {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  created_at: string
  last_login: string | null
}

export function useAdminAuth() {
  const { user, loading: authLoading } = useAuth()
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (authLoading) return
      
      if (!user) {
        setAdminData(null)
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error || !data) {
          setAdminData(null)
          setIsAdmin(false)
        } else {
          setAdminData(data)
          setIsAdmin(true)
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        setAdminData(null)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [user, authLoading])

  const hasRole = (requiredRoles: string[]) => {
    if (!adminData) return false
    return requiredRoles.includes(adminData.role)
  }

  const isSuperAdmin = () => {
    return adminData?.role === 'super_admin'
  }

  const isContentAdmin = () => {
    return adminData?.role === 'content_admin'
  }

  const isModerator = () => {
    return adminData?.role === 'moderator'
  }

  return {
    adminData,
    loading,
    isAdmin,
    hasRole,
    isSuperAdmin,
    isContentAdmin,
    isModerator,
  }
}
