import { Media, MediaFilters } from '@/types/media';
import { supabase } from '../supabase';

// Mock media data using placeholder images from Unsplash (free to use)
export const mockMedia: Media[] = [
  // Images
  {
    id: 1,
    filename: 'mountain-landscape.jpg',
    originalName: 'mountain-landscape.jpg',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
    type: 'image',
    mimeType: 'image/jpeg',
    size: 245760,
    alt: 'Beautiful mountain landscape with lake reflection',
    caption: 'Scenic mountain view captured during sunrise',
    uploadedBy: 1,
    uploadedAt: '2024-01-15',
    isPublic: true,
    tags: ['nature', 'landscape', 'mountains'],
    width: 800,
    height: 600
  },
  {
    id: 2,
    filename: 'office-workspace.jpg',
    originalName: 'modern-office.jpg',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop',
    type: 'image',
    mimeType: 'image/jpeg',
    size: 198432,
    alt: 'Modern office workspace with laptop',
    caption: 'Clean and organized workspace setup',
    uploadedBy: 1,
    uploadedAt: '2024-01-14',
    isPublic: true,
    tags: ['office', 'workspace', 'business'],
    width: 800,
    height: 600
  },
  {
    id: 3,
    filename: 'coffee-cup.jpg',
    originalName: 'morning-coffee.jpg',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop',
    type: 'image',
    mimeType: 'image/jpeg',
    size: 187264,
    alt: 'Steaming coffee cup on wooden table',
    caption: 'Perfect morning coffee moment',
    uploadedBy: 2,
    uploadedAt: '2024-01-13',
    isPublic: false,
    tags: ['coffee', 'morning', 'lifestyle'],
    width: 800,
    height: 600
  },
  {
    id: 4,
    filename: 'team-meeting.jpg',
    originalName: 'business-meeting.jpg',
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop',
    type: 'image',
    mimeType: 'image/jpeg',
    size: 312576,
    alt: 'Business team having a meeting',
    caption: 'Collaborative team discussion in progress',
    uploadedBy: 1,
    uploadedAt: '2024-01-12',
    isPublic: true,
    tags: ['business', 'team', 'meeting'],
    width: 800,
    height: 600
  },
  {
    id: 5,
    filename: 'code-screen.jpg',
    originalName: 'programming-code.jpg',
    url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop',
    type: 'image',
    mimeType: 'image/jpeg',
    size: 156789,
    alt: 'Code displayed on computer screen',
    caption: 'Web development in action',
    uploadedBy: 2,
    uploadedAt: '2024-01-11',
    isPublic: true,
    tags: ['programming', 'code', 'development'],
    width: 800,
    height: 600
  },
  {
    id: 6,
    filename: 'city-night.jpg',
    originalName: 'urban-nightscape.jpg',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=300&h=200&fit=crop',
    type: 'image',
    mimeType: 'image/jpeg',
    size: 278912,
    alt: 'City skyline at night with lights',
    caption: 'Urban architecture illuminated after dark',
    uploadedBy: 1,
    uploadedAt: '2024-01-10',
    isPublic: true,
    tags: ['city', 'night', 'urban', 'architecture'],
    width: 800,
    height: 600
  },
  {
    id: 7,
    filename: 'presentation.pdf',
    originalName: 'quarterly-report.pdf',
    url: '/documents/presentation.pdf',
    type: 'document',
    mimeType: 'application/pdf',
    size: 1048576,
    caption: 'Q4 2023 Business Report',
    uploadedBy: 1,
    uploadedAt: '2024-01-09',
    isPublic: false,
    tags: ['business', 'report', 'quarterly']
  },
  {
    id: 8,
    filename: 'demo-video.mp4',
    originalName: 'product-demo.mp4',
    url: '/videos/demo-video.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop',
    type: 'video',
    mimeType: 'video/mp4',
    size: 15728640,
    alt: 'Product demonstration video',
    caption: 'Feature walkthrough and tutorial',
    uploadedBy: 2,
    uploadedAt: '2024-01-08',
    isPublic: true,
    tags: ['demo', 'tutorial', 'product'],
    width: 1920,
    height: 1080,
    duration: 120
  }
];

// Database-ready functions
export async function getMedia(filters?: MediaFilters): Promise<Media[]> {
  // TODO: Replace with actual database call
  // Example: return await db.media.findMany({ where: filters, orderBy: { uploadedAt: 'desc' } });
  
  let filteredMedia = [...mockMedia];
  
  if (filters) {
    if (filters.type) {
      filteredMedia = filteredMedia.filter(media => media.type === filters.type);
    }
    if (filters.isPublic !== undefined && filters.isPublic !== '') {
      filteredMedia = filteredMedia.filter(media => media.isPublic === filters.isPublic);
    }
    if (filters.uploadedBy) {
      filteredMedia = filteredMedia.filter(media => media.uploadedBy === filters.uploadedBy);
    }
    if (filters.dateRange) {
      filteredMedia = filteredMedia.filter(media => 
        media.uploadedAt >= filters.dateRange!.start && 
        media.uploadedAt <= filters.dateRange!.end
      );
    }
  }
  
  return filteredMedia.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export async function getMediaById(id: number): Promise<Media | null> {
  // TODO: Replace with actual database call
  // Example: return await db.media.findUnique({ where: { id } });
  return mockMedia.find(media => media.id === id) || null;
}

export async function uploadMedia(file: File, metadata: Partial<Media>, bucketName: string = 'tool-images'): Promise<Media> {
  console.log('🚀 Starting upload:', { fileName: file.name, bucketName, fileSize: file.size });
  
  // Check authentication first
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error('❌ Auth error:', authError);
    throw new Error(`Authentication failed: ${authError.message}`);
  }
  
  if (!user) {
    console.error('❌ No authenticated user');
    throw new Error('You must be logged in to upload files');
  }
  
  console.log('✅ User authenticated:', user.email, 'User ID:', user.id);
  
  // Check if user is admin for admin-only buckets
  if (['tool-images', 'changelog-images', 'prompt-kit-images', 'article-images'].includes(bucketName)) {
    console.log('🔒 Checking admin status for bucket:', bucketName);
    
    // For admin users, check the admins table directly first (since they might not have user_profiles)
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('role, email')
      .eq('id', user.id)
      .single();
      
    if (adminData) {
      console.log('✅ Admin verified (direct):', adminData.email, 'with role:', adminData.role);
    } else {
      // If not found in admins table directly, try via user_profiles
      console.log('🔍 Not found in admins table directly, checking via user_profiles...');
      
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('id', user.id)
        .single();
        
      if (profileError || !userProfile) {
        console.error('❌ No admin record or user profile found:', { adminError, profileError });
        throw new Error('You must be an admin to upload to this bucket. No admin access found.');
      }
      
      console.log('✅ User profile found:', userProfile.email);
      
      // Then check if that email exists in admins table
      if (!userProfile.email) {
        console.error('❌ User profile has no email');
        throw new Error('User profile has no email. Cannot verify admin status.');
      }
      
      const { data: adminByEmail, error: adminByEmailError } = await supabase
        .from('admins')
        .select('role, email')
        .eq('email', userProfile.email)
        .single();
        
      if (adminByEmailError || !adminByEmail) {
        console.error('❌ Admin check via email failed:', adminByEmailError);
        throw new Error('You must be an admin to upload to this bucket. Your email is not in the admins table.');
      }
      
      console.log('✅ Admin verified (via email):', adminByEmail.email, 'with role:', adminByEmail.role);
    }
  }
  
  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.name.split('.').pop();
  const filename = `${timestamp}-${randomString}.${fileExtension}`;
  
  console.log('📁 Generated filename:', filename);
  
  try {
    // Upload file to Supabase Storage
    console.log('⬆️ Uploading to bucket:', bucketName, 'with filename:', filename);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Upload error details:', {
        message: uploadError.message,
        details: uploadError,
        bucketName,
        filename,
        fileSize: file.size,
        fileType: file.type
      });
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log('✅ Upload successful:', uploadData);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filename);

    console.log('🔗 Public URL generated:', publicUrl);

    // Create media record
    const newMedia: Media = {
      id: timestamp,
      filename: filename,
      originalName: file.name,
      url: publicUrl,
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' : 
            file.type.startsWith('audio/') ? 'audio' : 'document',
      mimeType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString().split('T')[0],
      isPublic: true,
      uploadedBy: 1,
      ...metadata
    };
    
    // Add to mock array for now
    mockMedia.unshift(newMedia);
    console.log('✅ Media object created and added to mock array');
    return newMedia;
    
  } catch (error) {
    console.error('💥 Upload failed:', error);
    throw error;
  }
}

// Helper function for profile picture uploads
export async function uploadProfilePicture(file: File, userId: string): Promise<string> {
  // Generate filename with user folder structure
  const fileExtension = file.name.split('.').pop();
  const filename = `${userId}/profile.${fileExtension}`;
  
  try {
    // Upload to profile-pictures bucket with user folder
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: true // Allow overwriting existing profile picture
      });

    if (uploadError) {
      throw new Error(`Profile picture upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filename);

    return publicUrl;
    
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
}

export async function updateMedia(id: number, updates: Partial<Omit<Media, 'id' | 'uploadedAt'>>): Promise<Media | null> {
  // TODO: Replace with actual database call
  // Example: return await db.media.update({ where: { id }, data: updates });
  
  const media = mockMedia.find(m => m.id === id);
  if (!media) return null;
  
  Object.assign(media, updates);
  return media;
}

export async function deleteMedia(id: number): Promise<boolean> {
  // TODO: Replace with actual database call and file deletion
  // This would typically involve:
  // 1. Delete file from storage service
  // 2. Delete database record
  
  const index = mockMedia.findIndex(m => m.id === id);
  if (index === -1) return false;
  
  mockMedia.splice(index, 1);
  return true;
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to get file type icon
export function getFileTypeIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('doc')) return '📝';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
  return '📎';
}