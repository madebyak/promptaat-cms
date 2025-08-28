import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { AdminRole } from '@/types/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Server-side admin creation request:', body);
    
    const { email, first_name, last_name, role, created_by } = body;

    // Validate required fields
    if (!email || !first_name || !last_name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    
    const adminInsert = {
      email,
      first_name,
      last_name,
      role: role as AdminRole,
      created_by: created_by || null,
      last_login: null
    };

    console.log('Inserting admin with server client:', adminInsert);

    const { data, error } = await supabase
      .from('admins')
      .insert(adminInsert)
      .select()
      .single();

    console.log('Server response:', { data, error });

    if (error) {
      console.error('Server-side error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      return NextResponse.json(
        { 
          error: `Database error: ${error.message}`,
          code: error.code,
          details: error.details 
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No data returned after creating admin' },
        { status: 500 }
      );
    }

    // Get creator name if exists
    let created_by_name;
    if (data.created_by) {
      const { data: creatorData } = await supabase
        .from('admins')
        .select('first_name, last_name')
        .eq('id', data.created_by)
        .single();
      
      if (creatorData) {
        created_by_name = `${creatorData.first_name} ${creatorData.last_name}`;
      }
    }

    const adminResponse = {
      id: data.id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      role: data.role,
      created_by: data.created_by,
      created_by_name,
      last_login: data.last_login,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    console.log('Admin created successfully via server:', adminResponse);

    return NextResponse.json({
      message: 'Admin created successfully',
      admin: adminResponse
    });

  } catch (error) {
    console.error('Unexpected error in server admin creation:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
