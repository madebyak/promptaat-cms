import { NextResponse } from 'next/server'
import { adminService } from '@/lib/server-db-utils'

// Example API route showing how to use server-side admin utilities
export async function GET() {
  try {
    // This will only work on the server side with the service role key
    const stats = await adminService.getFullStats()
    
    return NextResponse.json({
      success: true,
      data: stats,
      message: 'Admin API working correctly'
    })
  } catch (error) {
    console.error('Admin API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Admin API failed - check server logs'
    }, { status: 500 })
  }
}
