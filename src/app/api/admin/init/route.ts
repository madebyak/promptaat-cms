import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { AdminRole } from '@/types/admin';

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();
    
    // Check if any super admin exists
    const { count, error: countError } = await supabase
      .from('admins')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'super_admin');

    if (countError) {
      console.error('Error checking admin count:', countError);
      return NextResponse.json(
        { error: 'Failed to check existing admins' },
        { status: 500 }
      );
    }

    // If super admin already exists, return success
    if (count && count > 0) {
      return NextResponse.json({
        message: 'Admin system already initialized',
        adminCount: count
      });
    }

    // Create the first super admin - let Supabase handle the UUID
    const { data, error } = await supabase
      .from('admins')
      .insert({
        email: 'admin@promptaat.com',
        first_name: 'Super',
        last_name: 'Admin',
        role: 'super_admin' as AdminRole,
        created_by: null, // No creator for the first admin
        last_login: null  // New admin hasn't logged in yet
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating initial admin:', error);
      return NextResponse.json(
        { error: 'Failed to create initial admin' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Admin system initialized successfully',
      admin: {
        id: data.id,
        email: data.email,
        name: `${data.first_name} ${data.last_name}`,
        role: data.role
      }
    });

  } catch (error) {
    console.error('Error in admin init:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
