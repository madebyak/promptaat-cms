import { ChangeLog } from '@/types/changeLog';
import { supabase } from '@/lib/supabase';

// Auth-aware database wrapper to handle session refresh on auth failures
async function withAuthRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    // If it's an RLS/auth error, refresh session and retry once
    if (err.code === 'PGRST301' || 
        err.message?.includes('policy') || 
        err.message?.includes('RLS') ||
        err.message?.includes('permission') ||
        err.code === '42501') {
      console.log('Auth/RLS error detected, refreshing session and retrying...', err.message);
      await supabase.auth.refreshSession();
      // Small delay to ensure auth context is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      return await operation();
    }
    throw error;
  }
}

// Database functions
export async function getChangeLogs(): Promise<ChangeLog[]> {
  return withAuthRetry(async () => {
    const { data: changeLogs, error } = await supabase
      .from('change_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching change logs:', error);
      throw error;
    }

    // Convert database format to our ChangeLog type
    return (changeLogs || []).map(log => ({
      id: log.id,
      name: log.name,
      image_url: log.image_url || '',
      description: log.description,
      createdAt: log.created_at
    }));
  });
}

export async function getChangeLogById(id: string): Promise<ChangeLog | null> {
  return withAuthRetry(async () => {
    const { data: changeLog, error } = await supabase
      .from('change_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching change log by ID:', error);
      throw error;
    }

    return {
      id: changeLog.id,
      name: changeLog.name,
      image_url: changeLog.image_url || '',
      description: changeLog.description,
      createdAt: changeLog.created_at
    };
  });
}

export async function createChangeLog(log: Omit<ChangeLog, 'id' | 'createdAt'>): Promise<ChangeLog> {
  return withAuthRetry(async () => {
    const { data: newChangeLog, error } = await supabase
      .from('change_logs')
      .insert({
        name: log.name,
        image_url: log.image_url || null,
        description: log.description
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating change log:', error);
      throw error;
    }

    return {
      id: newChangeLog.id,
      name: newChangeLog.name,
      image_url: newChangeLog.image_url || '',
      description: newChangeLog.description,
      createdAt: newChangeLog.created_at
    };
  });
}

export async function updateChangeLog(id: string, updates: Partial<Omit<ChangeLog, 'id' | 'createdAt'>>): Promise<ChangeLog | null> {
  return withAuthRetry(async () => {
    const { data: updatedChangeLog, error } = await supabase
      .from('change_logs')
      .update({
        name: updates.name,
        image_url: updates.image_url || null,
        description: updates.description
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error updating change log:', error);
      throw error;
    }

    return {
      id: updatedChangeLog.id,
      name: updatedChangeLog.name,
      image_url: updatedChangeLog.image_url || '',
      description: updatedChangeLog.description,
      createdAt: updatedChangeLog.created_at
    };
  });
}

export async function deleteChangeLog(id: string): Promise<boolean> {
  return withAuthRetry(async () => {
    const { error } = await supabase
      .from('change_logs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting change log:', error);
      throw error;
    }

    return true;
  });
}
