# Supabase Storage Usage Guide

## Overview

Your PromptAAT CMS now has fully configured Supabase Storage with proper Row Level Security (RLS) policies. This guide shows you how to use each storage bucket correctly.

## Storage Buckets

### 1. 🔧 **tool-images** (Admin Only)
- **Purpose**: Store images for AI tools/agents
- **Access**: Admin users only
- **File Types**: All image formats recommended
- **Usage**: Tool management, tool thumbnails

### 2. 📝 **changelog-images** (Admin Only)
- **Purpose**: Store images for changelog entries
- **Access**: Admin users only  
- **File Types**: All image formats
- **Usage**: Release notes, feature announcements

### 3. 📦 **prompt-kit-images** (Admin Only)
- **Purpose**: Store images for prompt kits
- **Access**: Admin users only
- **File Types**: All image formats
- **Usage**: Prompt kit covers, thumbnails, examples

### 4. 👤 **profile-pictures** (Users + Admin)
- **Purpose**: Store user profile pictures
- **Access**: Users can manage their own, admins can manage all
- **File Types**: Image formats only
- **Structure**: `{user_id}/profile.{ext}`

## Code Examples

### Basic File Upload (Admin Only Buckets)

```typescript
import { uploadMedia } from '@/lib/data/media';

// Upload to tool-images bucket
const handleToolImageUpload = async (file: File) => {
  try {
    const media = await uploadMedia(file, {
      alt: 'Tool thumbnail',
      // other metadata
    }, 'tool-images');
    
    console.log('Uploaded:', media.url);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};

// Upload to changelog-images bucket
const handleChangelogImageUpload = async (file: File) => {
  try {
    const media = await uploadMedia(file, {
      alt: 'Feature screenshot',
    }, 'changelog-images');
    
    console.log('Uploaded:', media.url);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};

// Upload to prompt-kit-images bucket
const handlePromptKitImageUpload = async (file: File) => {
  try {
    const media = await uploadMedia(file, {
      alt: 'Prompt kit cover',
    }, 'prompt-kit-images');
    
    console.log('Uploaded:', media.url);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};
```

### Profile Picture Upload

```typescript
import { uploadProfilePicture } from '@/lib/data/media';
import { useAuth } from '@/providers/auth-provider';

const ProfilePictureUploader = () => {
  const { user } = useAuth();

  const handleProfilePictureUpload = async (file: File) => {
    if (!user) {
      alert('You must be logged in to upload a profile picture');
      return;
    }

    try {
      const profilePictureUrl = await uploadProfilePicture(file, user.id);
      
      // Update user profile in database
      const { error } = await supabase
        .from('user_profiles')
        .update({ profile_picture_url: profilePictureUrl })
        .eq('id', user.id);

      if (error) throw error;
      
      console.log('Profile picture updated:', profilePictureUrl);
    } catch (error) {
      console.error('Profile picture upload failed:', error.message);
    }
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleProfilePictureUpload(file);
      }}
    />
  );
};
```

### Using the Media Upload Component

```typescript
import { UploadArea } from '@/components/media/upload-area';
import { useMedia } from '@/hooks/useMedia';

const ToolImageUploader = () => {
  const { handleUpload, uploading } = useMedia();

  return (
    <UploadArea
      onUpload={(files) => handleUpload(files, {}, 'tool-images')}
      uploading={uploading}
      bucketName="tool-images"
      accept="image/*"
      maxFiles={5}
      maxSize={5} // 5MB
    />
  );
};

const ProfilePictureUploader = () => {
  const { handleUpload, uploading } = useMedia();

  return (
    <UploadArea
      onUpload={(files) => handleUpload(files, {}, 'profile-pictures')}
      uploading={uploading}
      bucketName="profile-pictures"
      accept="image/*"
      maxFiles={1}
      maxSize={2} // 2MB
    />
  );
};
```

### Direct Supabase Storage API

```typescript
import { supabase } from '@/lib/supabase';

// Admin upload to any bucket
const adminUpload = async (file: File, bucket: string) => {
  const filename = `${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, file);

  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename);
    
  return publicUrl;
};

// User profile picture upload
const userProfileUpload = async (file: File, userId: string) => {
  const filename = `${userId}/profile.${file.name.split('.').pop()}`;
  
  const { data, error } = await supabase.storage
    .from('profile-pictures')
    .upload(filename, file, { upsert: true });

  if (error) throw error;
  
  return supabase.storage
    .from('profile-pictures')
    .getPublicUrl(filename).data.publicUrl;
};
```

## Security Features

### Row Level Security (RLS)
- ✅ **Enabled** on all storage buckets
- ✅ **Admin verification** through `is_admin_user()` function
- ✅ **User folder isolation** for profile pictures
- ✅ **Public read access** for all buckets (as intended)

### Access Control
- **Anonymous users**: Can view all images (read-only)
- **Authenticated users**: Can upload their own profile pictures
- **Admin users**: Can manage all buckets and files
- **Folder structure**: Profile pictures use `{user_id}/` folders

### Error Handling
```typescript
// Always wrap uploads in try-catch
try {
  const result = await uploadMedia(file, metadata, bucket);
  // Success handling
} catch (error) {
  if (error.message.includes('403')) {
    // Permission denied - user not authorized
    alert('You do not have permission to upload to this bucket');
  } else if (error.message.includes('413')) {
    // File too large
    alert('File is too large. Please choose a smaller file');
  } else {
    // Other errors
    alert(`Upload failed: ${error.message}`);
  }
}
```

## File Size & Type Recommendations

### File Size Limits
- **tool-images**: 5MB max
- **profile-pictures**: 2MB max
- **changelog-images**: 5MB max
- **prompt-kit-images**: 5MB max

### Supported File Types
- **All buckets**: `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`
- **Additional for admin buckets**: `image/gif`, `image/avif`

## Testing Your Setup

### 1. Test Admin Uploads
```bash
# Login as admin user
# Try uploading to tool-images bucket
# Should succeed
```

### 2. Test User Uploads
```bash
# Login as regular user
# Try uploading to profile-pictures bucket
# Should succeed only to their own folder
# Try uploading to tool-images bucket
# Should fail with 403 error
```

### 3. Test Anonymous Access
```bash
# Logout completely
# Try viewing any uploaded image via public URL
# Should succeed (public read access)
```

## Troubleshooting

### Common Issues

1. **403 Forbidden Errors**
   - Check if user is logged in
   - Verify admin status for admin-only buckets
   - Ensure profile pictures use correct folder structure

2. **Upload Timeouts**
   - Check file size limits
   - Verify network connection
   - Check Supabase project quotas

3. **Policy Conflicts**
   - Run the updated SQL policies provided
   - Check for conflicting old policies
   - Verify `is_admin_user()` function exists

### Debug Commands

```sql
-- Check if admin function exists
SELECT proname FROM pg_proc WHERE proname = 'is_admin_user';

-- View current storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects';

-- Test admin status for a user
SELECT is_admin_user(); -- Run when logged in
```

## Next Steps

1. **Add Media Table**: Create a proper media table in your schema to track uploaded files
2. **Implement Thumbnails**: Add automatic thumbnail generation for images
3. **Add File Validation**: Implement server-side file type/size validation
4. **Monitor Usage**: Set up storage usage monitoring and alerts

## Integration with Your CMS

The storage system is now ready to integrate with your existing CMS components:

- **Tools**: Use `tool-images` bucket for tool thumbnails
- **Changelog**: Use `changelog-images` bucket for release notes
- **Prompt Kits**: Use `prompt-kit-images` bucket for kit covers
- **User Profiles**: Use `profile-pictures` bucket for user avatars

All uploads respect your existing authentication and authorization system!
