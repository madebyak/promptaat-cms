# Supabase Setup Guide

This guide will help you connect your Next.js application to Supabase.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project created

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role key** (also starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 2: Create Environment Variables

Create a `.env.local` file in your project root with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

⚠️ **Important**: 
- Replace the placeholder values with your actual Supabase credentials
- Never commit `.env.local` to version control
- The service role key should only be used on the server-side

## Step 3: Set Up Your Database Schema

Run the SQL schema from `docs/schema.md` in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire schema from `docs/schema.md`
4. Click **Run** to execute the schema

## Step 4: Update Your Layout

Add the AuthProvider to your root layout in `src/app/layout.tsx`:

```tsx
import { AuthProvider } from '@/providers/auth-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

## Step 5: Configure Row Level Security (RLS)

For security, enable RLS on your tables. Here are some example policies:

### Enable RLS on all tables:
```sql
-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_kits ENABLE ROW LEVEL SECURITY;
-- ... enable for all other tables
```

### Example policies:

```sql
-- Allow public read access to published prompts
CREATE POLICY "Public prompts are viewable by everyone" ON prompts
  FOR SELECT USING (visibility = 'published');

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow authenticated users to create prompts
CREATE POLICY "Authenticated users can create prompts" ON prompts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## Step 6: Test Your Connection

Create a simple test component to verify your Supabase connection:

```tsx
// src/components/test-connection.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function TestConnection() {
  const [status, setStatus] = useState('Testing...')

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('count', { count: 'exact', head: true })
        
        if (error) {
          setStatus(`Error: ${error.message}`)
        } else {
          setStatus('✅ Connection successful!')
        }
      } catch (err) {
        setStatus(`Error: ${err.message}`)
      }
    }

    testConnection()
  }, [])

  return <div>Supabase Status: {status}</div>
}
```

## Available Services

Your project now includes several pre-built services:

### Authentication (`useAuth` hook)
```tsx
import { useAuth } from '@/providers/auth-provider'

function LoginComponent() {
  const { signIn, signUp, signOut, user } = useAuth()
  
  // Use authentication methods
}
```

### Database Operations
```tsx
import { 
  DatabaseService, 
  promptsService, 
  categoriesService,
  usersService 
} from '@/lib/db-utils'

// Generic CRUD
const categories = await DatabaseService.fetch('categories')

// Specific operations
const prompts = await promptsService.getPromptsWithCategories()
const categories = await categoriesService.getCategoriesWithSubcategories()
```

## Next Steps

1. **Set up authentication flows**: Create login/signup pages
2. **Implement user profiles**: Handle user registration and profile updates
3. **Add data management**: Create admin interfaces for content management
4. **Configure storage**: Set up Supabase storage for file uploads if needed
5. **Add real-time features**: Use Supabase real-time subscriptions for live updates

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Double-check your environment variables
2. **"Table doesn't exist"**: Make sure you've run the schema SQL
3. **"RLS policy violated"**: Check your Row Level Security policies
4. **CORS errors**: Ensure your domain is added to Supabase allowed origins

### Useful Commands:

```bash
# Check if environment variables are loaded
npm run dev
# Check browser console for any Supabase errors

# Test database connection
npx supabase status  # If you have Supabase CLI installed
```

## Security Best Practices

1. **Never expose service role key**: Only use in server-side code
2. **Use RLS policies**: Always enable and configure appropriate policies
3. **Validate input**: Always validate data before database operations
4. **Use TypeScript**: Leverage the generated types for type safety
5. **Audit regularly**: Review your RLS policies and access patterns

For more information, visit the [Supabase documentation](https://supabase.com/docs).
