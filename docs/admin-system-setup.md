# Admin System Setup Guide

The admin system for Promptaat CMS has been successfully connected to the Supabase database. This guide explains how to set up and use the admin roles functionality.

## Database Schema

The admin system uses the `admins` table in your Supabase database with the following structure:

```sql
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- super_admin, content_admin, moderator
    created_by UUID, -- References another admin who created this account
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Admin Roles

The system supports three types of admin roles:

1. **Super Admin** (`super_admin`)
   - Full access to all admin functions
   - Can create, edit, and delete all admin types
   - Cannot be deleted if they are the last super admin

2. **Content Admin** (`content_admin`)
   - Can manage content-related functions
   - Can create and manage moderators
   - Cannot manage other content admins or super admins

3. **Moderator** (`moderator`)
   - Basic moderation capabilities
   - Cannot create or manage other admins

## Setup Process

### 1. Database Setup

Make sure your Supabase database has the admins table created. You can use the SQL from `docs/schema.md`.

### 2. Environment Variables

Ensure these environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Initialize the Admin System

Visit the Admin Roles page (`/admin-roles`) and use the "Initialize Admin System" button to create the first super admin account with these default credentials:

- Email: `admin@promptaat.com`
- Name: Super Admin
- Role: super_admin

### 4. Add Sample Data (Optional)

Use the "Add Sample Data" button to create test admin accounts:

- Content Manager (content_admin)
- John Moderator (moderator)
- Jane Moderator (moderator)

## Features

### Admin Management

- **View Admins**: See all admins in a sortable, filterable table
- **Create Admins**: Add new admin accounts with appropriate roles
- **Edit Admins**: Update admin information (not yet implemented in UI)
- **Delete Admins**: Remove admin accounts with proper safeguards
- **Role-based Access**: Admins can only manage lower-level roles

### Security Features

- **Last Super Admin Protection**: Cannot delete the last super admin
- **Role Hierarchy**: Enforced role-based permissions
- **Email Uniqueness**: Prevents duplicate admin emails
- **Database Validation**: Server-side validation for all operations

### API Endpoints

- `POST /api/admin/init` - Initialize admin system
- `POST /api/admin/seed` - Add sample data

## File Structure

```
src/
├── app/admin-roles/page.tsx              # Main admin roles page
├── components/admin-roles/
│   ├── admin-form.tsx                    # Form for creating/editing admins
│   ├── admin-roles-table.tsx             # Table displaying all admins
│   └── admin-setup.tsx                   # Setup utilities component
├── hooks/useAdmins.ts                    # React hook for admin operations
├── lib/data/admins.ts                    # Database functions for admins
├── types/admin.ts                        # TypeScript types
└── api/admin/
    ├── init/route.ts                     # Initialize admin system
    └── seed/route.ts                     # Add sample data
```

## Usage

1. Navigate to `/admin-roles` in your application
2. If it's the first time, use "Initialize Admin System"
3. Optionally add sample data for testing
4. Use the "Add Admin" button to create new admin accounts
5. Manage existing admins through the table interface

## Database Functions

The following functions are available in `src/lib/data/admins.ts`:

- `getAdmins()` - Fetch all admins with creator info
- `getAdminById(id)` - Fetch a specific admin
- `createAdmin(adminData)` - Create a new admin
- `updateAdmin(id, updates)` - Update an existing admin
- `deleteAdmin(id)` - Delete an admin (with safeguards)

## Error Handling

The system includes comprehensive error handling:

- Database connection errors
- Validation errors (duplicate emails, etc.)
- Permission errors
- Last super admin deletion prevention

## Future Enhancements

Potential improvements that could be added:

1. Edit admin functionality in the UI
2. Bulk admin operations
3. Admin activity logging
4. Email notifications for admin changes
5. Two-factor authentication
6. Password reset functionality
