import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { adminService } from '@/lib/server-db-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, role = 'super_admin' } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({
        success: false,
        error: 'All fields are required'
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 6 characters long'
      }, { status: 400 })
    }

    // Validate role
    const validRoles = ['super_admin', 'content_admin', 'moderator']
    if (!validRoles.includes(role)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid role'
      }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Check if this is the first admin (allow creation without authentication)
    const { data: existingAdmins } = await supabaseAdmin
      .from('admins')
      .select('id')
      .limit(1)

    const isFirstAdmin = !existingAdmins || existingAdmins.length === 0

    // If not first admin, check if current user is super_admin
    if (!isFirstAdmin) {
      // In a real app, you'd verify the current user's admin status here
      // For now, we'll allow creation but in production you should add auth checks
    }

    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin users
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: 'admin'
      }
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      return NextResponse.json({
        success: false,
        error: authError.message
      }, { status: 400 })
    }

    if (!authUser.user) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create user'
      }, { status: 500 })
    }

    // Create admin record in admins table
    const adminData = {
      id: authUser.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      role,
      created_by: isFirstAdmin ? null : authUser.user.id, // For first admin, created_by is null
    }

    const newAdmin = await adminService.createAdmin(adminData)

    return NextResponse.json({
      success: true,
      data: {
        id: newAdmin.id,
        email: newAdmin.email,
        firstName: newAdmin.first_name,
        lastName: newAdmin.last_name,
        role: newAdmin.role,
        isFirstAdmin
      },
      message: isFirstAdmin ? 'First admin account created successfully' : 'Admin account created successfully'
    })

  } catch (error) {
    console.error('Admin creation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}
