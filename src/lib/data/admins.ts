import { Admin, AdminRole } from '@/types/admin';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type AdminRow = Database['public']['Tables']['admins']['Row'];
type AdminInsert = Database['public']['Tables']['admins']['Insert'];
type AdminUpdate = Database['public']['Tables']['admins']['Update'];

// Helper function to convert database row to Admin type with created_by_name
async function enrichAdminWithCreatedBy(adminRow: AdminRow): Promise<Admin> {
  let created_by_name: string | undefined;
  
  if (adminRow.created_by) {
    const { data: creatorData } = await supabase
      .from('admins')
      .select('first_name, last_name')
      .eq('id', adminRow.created_by)
      .single();
    
    if (creatorData) {
      created_by_name = `${creatorData.first_name} ${creatorData.last_name}`;
    }
  }
  
  return {
    id: adminRow.id,
    email: adminRow.email,
    first_name: adminRow.first_name,
    last_name: adminRow.last_name,
    role: adminRow.role as AdminRole,
    created_by: adminRow.created_by || undefined,
    created_by_name,
    last_login: adminRow.last_login || undefined,
    created_at: adminRow.created_at,
    updated_at: adminRow.updated_at
  };
}

// Database functions
export async function getAdmins(): Promise<Admin[]> {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admins:', error);
      throw new Error('Failed to fetch admins');
    }

    if (!data) return [];

    // Enrich admins with created_by_name
    const enrichedAdmins = await Promise.all(
      data.map(admin => enrichAdminWithCreatedBy(admin))
    );

    return enrichedAdmins;
  } catch (error) {
    console.error('Error in getAdmins:', error);
    throw error;
  }
}

export async function getAdminById(id: string): Promise<Admin | null> {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching admin by ID:', error);
      throw new Error('Failed to fetch admin');
    }

    if (!data) return null;

    return await enrichAdminWithCreatedBy(data);
  } catch (error) {
    console.error('Error in getAdminById:', error);
    throw error;
  }
}

export async function createAdmin(admin: Omit<Admin, 'id' | 'created_at' | 'updated_at'>): Promise<Admin> {
  try {
    console.log('Creating admin with data:', admin);
    
    // Let Supabase handle UUID generation automatically
    const adminInsert: AdminInsert = {
      email: admin.email,
      first_name: admin.first_name,
      last_name: admin.last_name,
      role: admin.role,
      created_by: admin.created_by || null, // null is fine - Supabase will handle it
      last_login: null // Always null for new admins
    };

    console.log('AdminInsert object:', adminInsert);

    const { data, error } = await supabase
      .from('admins')
      .insert(adminInsert)
      .select()
      .single();

    console.log('Supabase response:', { data, error });

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      if (error.code === '23505') {
        throw new Error('An admin with this email already exists');
      }
      if (error.code === '42501') {
        throw new Error('Insufficient permissions to create admin');
      }
      if (error.message) {
        throw new Error(`Database error: ${error.message}`);
      }
      throw new Error('Failed to create admin');
    }

    if (!data) {
      throw new Error('No data returned after creating admin');
    }

    console.log('Admin created successfully:', data);
    
    // Return the admin with creator info (if any)
    return await enrichAdminWithCreatedBy(data);
  } catch (error) {
    console.error('Error in createAdmin:', error);
    throw error;
  }
}

export async function updateAdmin(id: string, updates: Partial<Omit<Admin, 'id' | 'created_at'>>): Promise<Admin | null> {
  try {
    const adminUpdate: AdminUpdate = {};
    
    if (updates.email) adminUpdate.email = updates.email;
    if (updates.first_name) adminUpdate.first_name = updates.first_name;
    if (updates.last_name) adminUpdate.last_name = updates.last_name;
    if (updates.role) adminUpdate.role = updates.role;
    if (updates.created_by !== undefined) adminUpdate.created_by = updates.created_by;
    if (updates.last_login !== undefined) adminUpdate.last_login = updates.last_login;

    const { data, error } = await supabase
      .from('admins')
      .update(adminUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating admin:', error);
      if (error.code === 'PGRST116') {
        return null; // Admin not found
      }
      if (error.code === '23505') {
        throw new Error('An admin with this email already exists');
      }
      throw new Error('Failed to update admin');
    }

    if (!data) return null;

    return await enrichAdminWithCreatedBy(data);
  } catch (error) {
    console.error('Error in updateAdmin:', error);
    throw error;
  }
}

export async function deleteAdmin(id: string): Promise<boolean> {
  try {
    // First check if this admin exists and get their role
    const { data: existingAdmin, error: fetchError } = await supabase
      .from('admins')
      .select('role')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return false; // Admin not found
      }
      throw new Error('Failed to verify admin exists');
    }

    // If this is a super_admin, check if it's the last one
    if (existingAdmin.role === 'super_admin') {
      const { count, error: countError } = await supabase
        .from('admins')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'super_admin');

      if (countError) {
        throw new Error('Failed to check super admin count');
      }

      if (count && count <= 1) {
        throw new Error('Cannot delete the last Super Admin');
      }
    }

    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting admin:', error);
      throw new Error('Failed to delete admin');
    }

    return true;
  } catch (error) {
    console.error('Error in deleteAdmin:', error);
    throw error;
  }
}
