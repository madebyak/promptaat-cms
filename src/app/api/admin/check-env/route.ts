import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      url_value: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
        process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + '...' : 'MISSING',
      anon_key_length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      service_key_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
    };

    return NextResponse.json({
      message: 'Environment variables check',
      env: envCheck,
      allPresent: envCheck.NEXT_PUBLIC_SUPABASE_URL && 
                  envCheck.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
                  envCheck.SUPABASE_SERVICE_ROLE_KEY
    });

  } catch (error) {
    console.error('Error checking environment:', error);
    return NextResponse.json(
      { error: 'Failed to check environment' },
      { status: 500 }
    );
  }
}
