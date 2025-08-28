'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/auth-provider'
import { useAdminAuth } from '@/hooks/useAdminAuth'

export function TestConnection() {
  const [dbStatus, setDbStatus] = useState('Testing database connection...')
  const { user, loading } = useAuth()
  const { adminData, isAdmin, loading: adminLoading } = useAdminAuth()

  useEffect(() => {
    async function testConnection() {
      try {
        // Test basic database connection by trying to access a simple table
        const { error } = await supabase
          .from('categories')
          .select('id')
          .limit(1)
        
        if (error) {
          // If table doesn't exist or no RLS policy, that's expected during initial setup
          if (error.code === 'PGRST116' || error.message.includes('relation "categories" does not exist')) {
            setDbStatus('⚠️ Database connected, but schema not yet created')
          } else if (error.message.includes('RLS') || error.message.includes('policy')) {
            setDbStatus('✅ Database connected (RLS policies active)')
          } else {
            setDbStatus(`❌ Database Error: ${error.message}`)
          }
        } else {
          setDbStatus('✅ Database connection and schema ready!')
        }
      } catch (err) {
        setDbStatus(`❌ Connection Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-4 border rounded-lg bg-muted/50">
      <h3 className="font-semibold mb-2">Supabase Connection Status</h3>
      <div className="space-y-2 text-sm">
        <div>Database: {dbStatus}</div>
        <div>
          Auth: {loading ? 'Loading...' : user ? '✅ User authenticated' : '⚪ No user authenticated'}
        </div>
        {user && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">
              User ID: {user.id}
              <br />
              Email: {user.email}
            </div>
            <div className="text-xs">
              Admin Status: {adminLoading ? 'Checking...' : isAdmin ? `✅ Admin (${adminData?.role})` : '⚪ Regular User'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
