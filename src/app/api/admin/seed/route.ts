import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { AdminRole } from '@/types/admin';

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();
    
    // Check if we already have sample data
    const { count, error: countError } = await supabase
      .from('admins')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error checking admin count:', countError);
      return NextResponse.json(
        { error: 'Failed to check existing admins' },
        { status: 500 }
      );
    }

    // If we already have 2 or more admins, don't seed
    if (count && count >= 2) {
      return NextResponse.json({
        message: 'Sample data already exists',
        adminCount: count
      });
    }

    // Get the first super admin to use as creator
    const { data: superAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('role', 'super_admin')
      .limit(1)
      .single();

    if (!superAdmin) {
      return NextResponse.json(
        { error: 'No super admin found. Initialize admin system first.' },
        { status: 400 }
      );
    }

    // Create sample admins - Supabase will generate UUIDs automatically
    const sampleAdmins = [
      {
        email: 'content@promptaat.com',
        first_name: 'Content',
        last_name: 'Manager',
        role: 'content_admin' as AdminRole,
        created_by: superAdmin.id,
        last_login: null
      },
      {
        email: 'john.moderator@promptaat.com',
        first_name: 'John',
        last_name: 'Moderator',
        role: 'moderator' as AdminRole,
        created_by: superAdmin.id,
        last_login: null
      },
      {
        email: 'jane.moderator@promptaat.com',
        first_name: 'Jane',
        last_name: 'Moderator',
        role: 'moderator' as AdminRole,
        created_by: superAdmin.id,
        last_login: null
      }
    ];

    const { data, error } = await supabase
      .from('admins')
      .insert(sampleAdmins)
      .select();

    if (error) {
      console.error('Error creating sample admins:', error);
      return NextResponse.json(
        { error: 'Failed to create sample admins' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Sample admin data created successfully',
      admins: data?.map(admin => ({
        id: admin.id,
        email: admin.email,
        name: `${admin.first_name} ${admin.last_name}`,
        role: admin.role
      }))
    });

  } catch (error) {
    console.error('Error in admin seed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
