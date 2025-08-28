import { Tool } from '@/types/tool';
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
export async function getTools(): Promise<Tool[]> {
  return withAuthRetry(async () => {
    const { data: tools, error } = await supabase
      .from('tools')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching tools:', error);
      throw error;
    }

    return (tools || []).map(tool => ({
      id: tool.id,
      name: tool.name,
      image_url: tool.image_url || undefined,
      website_link: tool.website_link || undefined,
      sort_order: tool.sort_order,
      created_at: tool.created_at,
      updated_at: tool.updated_at
    }));
  });
}

export async function getToolById(id: string): Promise<Tool | null> {
  return withAuthRetry(async () => {
    const { data: tool, error } = await supabase
      .from('tools')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching tool by ID:', error);
      throw error;
    }

    if (!tool) return null;

    return {
      id: tool.id,
      name: tool.name,
      image_url: tool.image_url || undefined,
      website_link: tool.website_link || undefined,
      sort_order: tool.sort_order,
      created_at: tool.created_at,
      updated_at: tool.updated_at
    };
  });
}

export async function createTool(toolData: {
  name: string;
  image_url?: string;
  website_link?: string;
  sort_order?: number;
}): Promise<Tool> {
  return withAuthRetry(async () => {
    // Calculate sort order if not provided
    let sortOrder = toolData.sort_order;
    if (!sortOrder) {
      const { data: tools } = await supabase
        .from('tools')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1);
      
      sortOrder = tools && tools.length > 0 ? tools[0].sort_order + 1 : 1;
    }

    const { data: tool, error } = await supabase
      .from('tools')
      .insert({
        name: toolData.name,
        image_url: toolData.image_url || null,
        website_link: toolData.website_link || null,
        sort_order: sortOrder
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tool:', error);
      throw error;
    }

    return {
      id: tool.id,
      name: tool.name,
      image_url: tool.image_url || undefined,
      website_link: tool.website_link || undefined,
      sort_order: tool.sort_order,
      created_at: tool.created_at,
      updated_at: tool.updated_at
    };
  });
}

export async function updateTool(
  id: string, 
  updates: { 
    name?: string;
    image_url?: string;
    website_link?: string;
    sort_order?: number;
  }
): Promise<Tool | null> {
  return withAuthRetry(async () => {
    const { data: tool, error } = await supabase
      .from('tools')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tool:', error);
      throw error;
    }

    if (!tool) return null;

    return {
      id: tool.id,
      name: tool.name,
      image_url: tool.image_url || undefined,
      website_link: tool.website_link || undefined,
      sort_order: tool.sort_order,
      created_at: tool.created_at,
      updated_at: tool.updated_at
    };
  });
}

export async function deleteTool(id: string): Promise<boolean> {
  return withAuthRetry(async () => {
    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting tool:', error);
      return false;
    }

    return true;
  });
}

// Utility function to fix duplicate sort orders
export async function fixDuplicateToolSortOrders(): Promise<boolean> {
  return withAuthRetry(async () => {
    try {
      // Fix tools
      const { data: tools, error: toolsError } = await supabase
        .from('tools')
        .select('*')
        .order('created_at', { ascending: true });

      if (toolsError) {
        console.error('Error fetching tools:', toolsError);
        throw toolsError;
      }

      // Update sort orders for tools (starting from 1)
      for (let i = 0; i < (tools || []).length; i++) {
        const tool = tools[i];
        const newSortOrder = i + 1;
        console.log(`Updating tool ${tool.name} sort_order to ${newSortOrder}`);
        await supabase
          .from('tools')
          .update({ sort_order: newSortOrder })
          .eq('id', tool.id);
      }

      console.log('Successfully fixed duplicate tool sort orders');
      return true;
    } catch (error) {
      console.error('Failed to fix duplicate tool sort orders:', error);
      return false;
    }
  });
}
