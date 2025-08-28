'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface UserData {
  first_name: string;
  last_name: string;
  company?: string;
  role?: string;
  usage_purpose: string;
  referral_source?: string;
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, userData?: UserData) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting initial session:', error)
          // Clear any corrupted session data
          await supabase.auth.signOut()
        }
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Failed to get initial session:', error)
        setSession(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Handle different auth events
      if (event === 'SIGNED_OUT') {
        // Clear any client-side state
        setSession(null)
        setUser(null)
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully')
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Update user profile in background (non-blocking)
        setTimeout(async () => {
          try {
            console.log('Checking user profile for:', session.user.id)
            // First check if user profile exists (don't use .single() to avoid errors)
            const { data: existingProfile, error: profileError } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('id', session.user.id)
              .limit(1)

            if (profileError) {
              console.log('No user profile found (admin user):', profileError.message)
              return
            }

            if (existingProfile && existingProfile.length > 0) {
              console.log('Updating user profile last_login')
              // Update existing profile
              const { error } = await supabase
                .from('user_profiles')
                .update({
                  last_login: new Date().toISOString(),
                  last_activity: new Date().toISOString(),
                })
                .eq('id', session.user.id)
              
              if (error) {
                console.error('Error updating user profile:', error)
              } else {
                console.log('User profile updated successfully')
              }
            } else {
              console.log('No user profile found - this is normal for admin users')
            }
          } catch (error) {
            console.error('Error checking/updating user profile:', error)
          }
        }, 100) // Small delay to make it non-blocking
      }
    })

    // Set up periodic session refresh check
    const intervalId = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session && session.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000)
        const now = new Date()
        const timeUntilExpiry = expiresAt.getTime() - now.getTime()
        
        // Refresh token if it expires in the next 5 minutes
        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
          console.log('Proactively refreshing token')
          await supabase.auth.refreshSession()
        }
      }
    }, 60000) // Check every minute

    return () => {
      subscription.unsubscribe()
      clearInterval(intervalId)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, userData?: UserData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })

    // If signup is successful and we have user data, create user profile
    if (data.user && !error && userData) {
      try {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            company: userData.company || null,
            role: userData.role || null,
            usage_purpose: userData.usage_purpose,
            referral_source: userData.referral_source || null,
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
        }
      } catch (profileError) {
        console.error('Error creating user profile:', profileError)
      }
    }

    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return { error }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
