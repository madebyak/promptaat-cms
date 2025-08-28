'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { Button } from './ui/button'
import { ThemeToggle } from './ui/theme-toggle'
import { ThemeLogo } from './ui/theme-logo'

export function Navbar() {
  const { user, loading, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      console.log('Starting sign out...')
      const { error } = await signOut()
      if (error) {
        console.error('Sign out error:', error)
      } else {
        console.log('Sign out successful')
      }
      // Force redirect to login page and refresh
      window.location.replace('/auth/login')
    } catch (error) {
      console.error('Sign out error:', error)
      // Force redirect even if there's an error
      window.location.replace('/auth/login')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <nav className="border-b border-border bg-background text-foreground transition-colors">
      <div className="mx-auto px-24 sm:px-24">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Navigation */}
          <Link 
            href="/" 
            className="transition-opacity hover:opacity-80"
          >
            <ThemeLogo width={160} height={32} />
          </Link>

          {/* Right side - Auth & Theme */}
          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">
                      Welcome, {user.email}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      disabled={signingOut}
                    >
                      {signingOut ? 'Signing Out...' : 'Sign Out'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/auth/login">
                      <Button variant="outline" size="sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button size="sm">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}