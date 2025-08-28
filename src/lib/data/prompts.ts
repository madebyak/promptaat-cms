import { Prompt, CreatePromptData, PromptCategory, PromptTool, CategoriesResponse, ToolsResponse } from '@/types/prompt';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

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

// Helper function to transform database rows to Prompt objects
function transformPromptData(
  promptRow: Database['public']['Tables']['prompts']['Row'], // Use the actual database type
  categories: PromptCategory[] = [],
  tools: PromptTool[] = []
): Prompt {
  return {
    id: promptRow.id,
    name: promptRow.name,
    description: promptRow.description || '',
    prompt_content: promptRow.prompt_content,
    instructions: promptRow.instructions || undefined,
    keywords: promptRow.keywords || [],
    tier: (promptRow.tier as 'free' | 'pro'),
    visibility: (promptRow.visibility as 'published' | 'draft'),
    createdAt: promptRow.created_at,
    updatedAt: promptRow.updated_at,
    rating: promptRow.rating,
    likesCount: promptRow.likes_count,
    copiesCount: promptRow.copies_count,
    viewsCount: 0, // Default value since views_count is not in prompts table
    categories: categories.map(cat => ({ category_id: cat.category_id, subcategory_id: cat.subcategory_id })),
    subcategories: categories.map(cat => cat.subcategory_name).filter(Boolean) as string[],
    tools: tools.map(tool => ({ tool_id: tool.tool_id }))
  };
}

// Database functions
export async function getPrompts(): Promise<Prompt[]> {
  return withAuthRetry(async () => {
    // Get all prompts
    const { data: promptsData, error: promptsError } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false });

    if (promptsError) {
      console.error('Error fetching prompts:', promptsError);
      throw promptsError;
    }

    if (!promptsData || promptsData.length === 0) {
      return [];
    }

    const promptIds = promptsData.map(p => p.id);

    // Get categories for all prompts
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('prompt_categories')
      .select(`
        id,
        prompt_id,
        category_id,
        subcategory_id,
        categories!inner(name),
        subcategories(name)
      `)
      .in('prompt_id', promptIds);

    if (categoriesError) {
      console.error('Error fetching prompt categories:', categoriesError);
      throw categoriesError;
    }

    // Get tools for all prompts
    const { data: toolsData, error: toolsError } = await supabase
      .from('prompt_tools')
      .select(`
        id,
        prompt_id,
        tool_id,
        tools!inner(name, image_url)
      `)
      .in('prompt_id', promptIds);

    if (toolsError) {
      console.error('Error fetching prompt tools:', toolsError);
      throw toolsError;
    }

    // Transform data
    return promptsData.map(promptRow => {
      const promptCategories: PromptCategory[] = (categoriesData || [])
        .filter(cat => cat.prompt_id === promptRow.id)
        .map((cat: CategoriesResponse) => ({
          id: cat.id,
          prompt_id: cat.prompt_id,
          category_id: cat.category_id,
          subcategory_id: cat.subcategory_id,
          category_name: cat.categories?.name || '',
          subcategory_name: cat.subcategories?.name
        }));

      const promptTools: PromptTool[] = (toolsData || [])
        .filter(tool => tool.prompt_id === promptRow.id)
        .map((tool: ToolsResponse) => ({
          id: tool.id,
          prompt_id: tool.prompt_id,
          tool_id: tool.tool_id,
          tool_name: tool.tools?.name || '',
          tool_image_url: tool.tools?.image_url
        }));

      return transformPromptData(promptRow, promptCategories, promptTools);
    });
  });
}

export async function getPromptById(id: string): Promise<Prompt | null> {
  return withAuthRetry(async () => {
    // Get the prompt
    const { data: promptData, error: promptError } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single();

    if (promptError || !promptData) {
      console.error('Error fetching prompt:', promptError);
      return null;
    }

    // Get categories for this prompt
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('prompt_categories')
      .select(`
        id,
        prompt_id,
        category_id,
        subcategory_id,
        categories!inner(name),
        subcategories(name)
      `)
      .eq('prompt_id', id);

    if (categoriesError) {
      console.error('Error fetching prompt categories:', categoriesError);
      throw categoriesError;
    }

    // Get tools for this prompt
    const { data: toolsData, error: toolsError } = await supabase
      .from('prompt_tools')
      .select(`
        id,
        prompt_id,
        tool_id,
        tools!inner(name, image_url)
      `)
      .eq('prompt_id', id);

    if (toolsError) {
      console.error('Error fetching prompt tools:', toolsError);
      throw toolsError;
    }

    const promptCategories: PromptCategory[] = (categoriesData || [])
      .map((cat: CategoriesResponse) => ({
        id: cat.id,
        prompt_id: cat.prompt_id,
        category_id: cat.category_id,
        subcategory_id: cat.subcategory_id,
        category_name: cat.categories?.name || '',
        subcategory_name: cat.subcategories?.name
      }));

    const promptTools: PromptTool[] = (toolsData || [])
      .map((tool: ToolsResponse) => ({
        id: tool.id,
        prompt_id: tool.prompt_id,
        tool_id: tool.tool_id,
        tool_name: tool.tools?.name || '',
        tool_image_url: tool.tools?.image_url
      }));

    return transformPromptData(promptData, promptCategories, promptTools);
  });
}

export async function createPrompt(promptData: CreatePromptData): Promise<Prompt> {
  return withAuthRetry(async () => {
    // Insert the main prompt record
    const { data: newPrompt, error: promptError } = await supabase
      .from('prompts')
      .insert({
        name: promptData.name,
        description: promptData.description,
        prompt_content: promptData.prompt_content,
        instructions: promptData.instructions,
        keywords: promptData.keywords,
        visibility: promptData.visibility,
        tier: promptData.tier,
        rating: 0,
        likes_count: 0,
        copies_count: 0
      })
      .select()
      .single();

    if (promptError || !newPrompt) {
      console.error('Error creating prompt:', promptError);
      throw promptError;
    }

    // Insert category associations
    if (promptData.category_ids && promptData.category_ids.length > 0) {
      const categoryInserts = promptData.category_ids.map((categoryId, index) => ({
        prompt_id: newPrompt.id,
        category_id: categoryId,
        subcategory_id: promptData.subcategory_ids?.[index] || categoryId // fallback to categoryId if no subcategory
      }));

      const { error: categoryError } = await supabase
        .from('prompt_categories')
        .insert(categoryInserts);

      if (categoryError) {
        console.error('Error creating prompt categories:', categoryError);
        // Clean up the prompt if category insertion fails
        await supabase.from('prompts').delete().eq('id', newPrompt.id);
        throw categoryError;
      }
    }

    // Insert tool associations
    if (promptData.tool_ids && promptData.tool_ids.length > 0) {
      const toolInserts = promptData.tool_ids.map(toolId => ({
        prompt_id: newPrompt.id,
        tool_id: toolId
      }));

      const { error: toolError } = await supabase
        .from('prompt_tools')
        .insert(toolInserts);

      if (toolError) {
        console.error('Error creating prompt tools:', toolError);
        // Clean up the prompt if tool insertion fails
        await supabase.from('prompts').delete().eq('id', newPrompt.id);
        throw toolError;
      }
    }

    // Fetch the complete prompt with relations
    const createdPrompt = await getPromptById(newPrompt.id);
    if (!createdPrompt) {
      throw new Error('Failed to fetch created prompt');
    }

    return createdPrompt;
  });
}

export async function updatePrompt(id: string, updates: Partial<CreatePromptData>): Promise<Prompt | null> {
  return withAuthRetry(async () => {
    // Update the main prompt record
    const promptUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) promptUpdates.name = updates.name;
    if (updates.description !== undefined) promptUpdates.description = updates.description;
    if (updates.prompt_content !== undefined) promptUpdates.prompt_content = updates.prompt_content;
    if (updates.instructions !== undefined) promptUpdates.instructions = updates.instructions;
    if (updates.keywords !== undefined) promptUpdates.keywords = updates.keywords;
    if (updates.visibility !== undefined) promptUpdates.visibility = updates.visibility;
    if (updates.tier !== undefined) promptUpdates.tier = updates.tier;

    if (Object.keys(promptUpdates).length > 0) {
      const { error: promptError } = await supabase
        .from('prompts')
        .update(promptUpdates)
        .eq('id', id);

      if (promptError) {
        console.error('Error updating prompt:', promptError);
        throw promptError;
      }
    }

    // Update categories if provided
    if (updates.category_ids !== undefined) {
      // Delete existing categories
      await supabase
        .from('prompt_categories')
        .delete()
        .eq('prompt_id', id);

      // Insert new categories
      if (updates.category_ids.length > 0) {
        const categoryInserts = updates.category_ids.map((categoryId, index) => ({
          prompt_id: id,
          category_id: categoryId,
          subcategory_id: updates.subcategory_ids?.[index] || categoryId // fallback to categoryId if no subcategory
        }));

        const { error: categoryError } = await supabase
          .from('prompt_categories')
          .insert(categoryInserts);

        if (categoryError) {
          console.error('Error updating prompt categories:', categoryError);
          throw categoryError;
        }
      }
    }

    // Update tools if provided
    if (updates.tool_ids !== undefined) {
      // Delete existing tools
      await supabase
        .from('prompt_tools')
        .delete()
        .eq('prompt_id', id);

      // Insert new tools
      if (updates.tool_ids.length > 0) {
        const toolInserts = updates.tool_ids.map(toolId => ({
          prompt_id: id,
          tool_id: toolId
        }));

        const { error: toolError } = await supabase
          .from('prompt_tools')
          .insert(toolInserts);

        if (toolError) {
          console.error('Error updating prompt tools:', toolError);
          throw toolError;
        }
      }
    }

    // Fetch the updated prompt with relations
    return await getPromptById(id);
  });
}

export async function deletePrompt(id: string): Promise<boolean> {
  return withAuthRetry(async () => {
    // Delete the prompt (cascade will handle related records)
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting prompt:', error);
      return false;
    }

  return true;
  });
}
