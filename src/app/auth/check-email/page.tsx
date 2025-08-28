'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We&apos;ve sent a confirmation link to your email address.
          </p>
          <p className="mt-4 text-sm text-gray-600">
            Please check your email and click the confirmation link to activate your account.
          </p>
          
          <div className="mt-8 space-y-4">
            <p className="text-xs text-gray-500">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
            
            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Resend confirmation email
              </Button>
              
              <Link href="/auth/login">
                <Button variant="default" className="w-full">
                  Back to login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
