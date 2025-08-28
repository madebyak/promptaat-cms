import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('admins')
      .select('count(*)')
      .limit(1);

    if (connectionError) {
      console.error('Connection error:', connectionError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionError
      }, { status: 500 });
    }

    // Test insert permissions by trying to insert a test record (we'll delete it)
    const testAdmin = {
      email: 'test@test.com',
      first_name: 'Test',
      last_name: 'User',
      role: 'moderator',
      created_by: null
    };

    const { data: insertTest, error: insertError } = await supabase
      .from('admins')
      .insert(testAdmin)
      .select()
      .single();

    if (insertError) {
      console.error('Insert permission error:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Insert permission denied',
        details: insertError
      }, { status: 403 });
    }

    // Clean up the test record
    if (insertTest) {
      await supabase
        .from('admins')
        .delete()
        .eq('id', insertTest.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection and permissions are working correctly',
      testData: insertTest
    });

  } catch (error) {
    console.error('Test connection error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error during connection test',
      details: error
    }, { status: 500 });
  }
}
