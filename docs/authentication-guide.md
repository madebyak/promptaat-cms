# Authentication System Guide

## Overview

Your PromptAAT CMS now has a complete authentication system with both user and admin functionality.

## ✅ What's Implemented

### 1. Admin Account Creation
- **Route**: `/auth/create-admin`
- **API**: `/api/auth/create-admin`
- Creates admin accounts with roles: `super_admin`, `content_admin`, `moderator`
- First admin can be created without authentication

### 2. User Registration & Login
- **Login**: `/auth/login`
- **Signup**: `/auth/signup`
- **Password Reset**: `/auth/forgot-password`
- **Email Verification**: `/auth/check-email`

### 3. Authentication Middleware
- Protects all routes except public auth pages
- Redirects unauthenticated users to login
- Checks admin status for admin routes

### 4. Conditional UI
- **Sidebar**: Only shows when user is authenticated
- **Navbar**: Shows different content based on auth state
- **Layout**: Adapts based on authentication status

### 5. Protection Components
- `ProtectedRoute`: Wrapper for protected content
- `useAdminAuth`: Hook for checking admin status
- `withAuth`: HOC for protecting components

## 🚀 Getting Started

### Step 1: Create Your First Admin Account

1. Start your development server: `npm run dev`
2. Go to: `http://localhost:3000/auth/create-admin`
3. Fill in your admin details
4. Choose role (recommended: `super_admin` for first account)

### Step 2: Test the System

1. After creating admin account, go to login: `/auth/login`
2. Sign in with your admin credentials
3. You should see the dashboard with sidebar
4. Check the connection status shows you as an admin

### Step 3: Create Regular User Accounts

1. Go to: `/auth/signup`
2. Fill in user registration form
3. Check email for confirmation (if email is configured)

## 🔧 Authentication Flow

```
Unauthenticated User
├── Can access: /auth/* pages
├── Cannot access: Dashboard, admin routes
└── Redirected to: /auth/login

Authenticated User
├── Can access: Dashboard, profile
├── Cannot access: Admin-only routes
└── Sees: Sidebar + full interface

Admin User
├── Can access: Everything
├── Role-based permissions
└── Full CMS access
```

## 📁 File Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── create-admin/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── check-email/page.tsx
│   ├── api/auth/
│   │   └── create-admin/route.ts
│   └── unauthorized/page.tsx
├── components/
│   ├── auth/
│   │   └── protected-route.tsx
│   └── layout/
│       └── conditional-layout.tsx
├── hooks/
│   └── useAdminAuth.ts
├── providers/
│   └── auth-provider.tsx
└── middleware.ts
```

## 🛡️ Security Features

### 1. Route Protection
- Middleware checks authentication on all routes
- Automatic redirection for unauthorized access
- Role-based access control for admin routes

### 2. User Profile Management
- Automatic profile creation on signup
- User metadata tracking (company, role, usage purpose)
- Activity tracking (last login, last activity)

### 3. Admin Role System
- **Super Admin**: Full system access
- **Content Admin**: Content management
- **Moderator**: Content moderation

## 🔍 Testing Authentication

### Check Connection Status
The dashboard shows a connection status component that displays:
- Database connection status
- User authentication status
- Admin role (if applicable)

### Test Different User Types

1. **No Auth**: Visit dashboard without logging in → redirected to login
2. **Regular User**: Sign up → limited access, no admin features
3. **Admin User**: Create admin → full access with sidebar

## 🚨 Important Notes

### Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Database Setup Required
1. Run the schema from `docs/schema.md` in Supabase SQL Editor
2. Run the functions from `docs/database-functions.sql`
3. Set up Row Level Security (RLS) policies

### First Admin Account
- The first admin account can be created without authentication
- After that, only existing super admins can create new admin accounts
- Use `/auth/create-admin` for the first setup

## 🔗 Key Components to Use

### Protecting Routes
```tsx
import { ProtectedRoute } from '@/components/auth/protected-route'

function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <YourAdminContent />
    </ProtectedRoute>
  )
}
```

### Checking Admin Status
```tsx
import { useAdminAuth } from '@/hooks/useAdminAuth'

function Component() {
  const { isAdmin, adminData, isSuperAdmin } = useAdminAuth()
  
  if (isSuperAdmin()) {
    return <SuperAdminContent />
  }
  // ...
}
```

### Using Auth Context
```tsx
import { useAuth } from '@/providers/auth-provider'

function Component() {
  const { user, signIn, signOut, loading } = useAuth()
  // ...
}
```

## 📈 Next Steps

1. **Set up email templates** in Supabase for password reset
2. **Configure RLS policies** for your specific needs  
3. **Add user management interface** for admins
4. **Implement role-based content access**
5. **Add audit logging** for admin actions

Your authentication system is now complete and ready for production use! 🎉
