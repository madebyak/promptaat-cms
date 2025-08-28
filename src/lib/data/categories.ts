import { Category, Subcategory, LegacyCategory } from '@/types/category';
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
export async function getCategories(): Promise<LegacyCategory[]> {
  return withAuthRetry(async () => {
    // Get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw categoriesError;
    }

    // Get all subcategories
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('subcategories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (subcategoriesError) {
      console.error('Error fetching subcategories:', subcategoriesError);
      throw subcategoriesError;
    }

    // Convert to legacy format for existing components
    const legacyCategories: LegacyCategory[] = (categories || []).map(category => ({
      id: category.id,
      name: category.name,
      slug: category.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
      description: category.description || undefined,
      parentId: null,
      children: (subcategories || [])
        .filter(sub => sub.category_id === category.id)
        .map(sub => ({
          id: sub.id,
          name: sub.name,
          slug: sub.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
          description: sub.description || undefined,
          parentId: sub.category_id,
          postCount: 0, // TODO: Calculate from actual posts
          isActive: true,
          createdAt: sub.created_at,
          sort_order: sub.sort_order,
          children: undefined
        })),
      postCount: 0, // TODO: Calculate from actual posts
      isActive: true,
      createdAt: category.created_at,
      sort_order: category.sort_order
    }));

    return legacyCategories;
  });
}

export async function getCategoryById(id: string): Promise<LegacyCategory | null> {
  try {
    // Try to find as main category first
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (!categoryError && category) {
      // Get subcategories for this category
      const { data: subcategories } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', id)
        .order('sort_order', { ascending: true });

      return {
        id: category.id,
        name: category.name,
        slug: category.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
        description: category.description || undefined,
        parentId: null,
        children: (subcategories || []).map(sub => ({
          id: sub.id,
          name: sub.name,
          slug: sub.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
          description: sub.description || undefined,
          parentId: sub.category_id,
          postCount: 0,
          isActive: true,
          createdAt: sub.created_at,
          sort_order: sub.sort_order
        })),
        postCount: 0,
        isActive: true,
        createdAt: category.created_at,
        sort_order: category.sort_order
      };
    }

    // Try to find as subcategory
    const { data: subcategory, error: subcategoryError } = await supabase
      .from('subcategories')
      .select('*')
      .eq('id', id)
      .single();

    if (!subcategoryError && subcategory) {
      return {
        id: subcategory.id,
        name: subcategory.name,
        slug: subcategory.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
        description: subcategory.description || undefined,
        parentId: subcategory.category_id,
        children: undefined,
        postCount: 0,
        isActive: true,
        createdAt: subcategory.created_at,
        sort_order: subcategory.sort_order
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch category by ID:', error);
    throw error;
  }
}

export async function createCategory(categoryData: {
  name: string;
  description?: string;
  parentId?: string | null;
  sort_order?: number;
}): Promise<LegacyCategory> {
  return withAuthRetry(async () => {
    if (categoryData.parentId) {
      // Creating a subcategory - calculate sort order if not provided
      let sortOrder = categoryData.sort_order;
      if (!sortOrder) {
        const { data: siblings } = await supabase
          .from('subcategories')
          .select('sort_order')
          .eq('category_id', categoryData.parentId)
          .order('sort_order', { ascending: false })
          .limit(1);
        
        sortOrder = siblings && siblings.length > 0 ? siblings[0].sort_order + 1 : 1;
      }

      const { data: subcategory, error } = await supabase
        .from('subcategories')
        .insert({
          category_id: categoryData.parentId,
          name: categoryData.name,
          description: categoryData.description || null,
          sort_order: sortOrder
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating subcategory:', error);
        throw error;
      }

      return {
        id: subcategory.id,
        name: subcategory.name,
        slug: subcategory.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
        description: subcategory.description || undefined,
        parentId: subcategory.category_id,
        children: undefined,
        postCount: 0,
        isActive: true,
        createdAt: subcategory.created_at,
        sort_order: subcategory.sort_order
      };
    } else {
      // Creating a main category - calculate sort order if not provided
      let sortOrder = categoryData.sort_order;
      if (!sortOrder) {
        const { data: mainCategories } = await supabase
          .from('categories')
          .select('sort_order')
          .order('sort_order', { ascending: false })
          .limit(1);
        
        sortOrder = mainCategories && mainCategories.length > 0 ? mainCategories[0].sort_order + 1 : 1;
      }

      const { data: category, error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          description: categoryData.description || null,
          sort_order: sortOrder
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        throw error;
      }

      return {
        id: category.id,
        name: category.name,
        slug: category.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
        description: category.description || undefined,
        parentId: null,
        children: [],
        postCount: 0,
        isActive: true,
        createdAt: category.created_at,
        sort_order: category.sort_order
      };
    }
  });
}

export async function updateCategory(
  id: string, 
  updates: { 
    name?: string;
    description?: string;
    sort_order?: number;
  }
): Promise<LegacyCategory | null> {
  return withAuthRetry(async () => {
    // Try updating as main category first
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!categoryError && category) {
      // Get subcategories for this category
      const { data: subcategories } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', id)
        .order('sort_order', { ascending: true });

      return {
        id: category.id,
        name: category.name,
        slug: category.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
        description: category.description || undefined,
        parentId: null,
        children: (subcategories || []).map(sub => ({
          id: sub.id,
          name: sub.name,
          slug: sub.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
          description: sub.description || undefined,
          parentId: sub.category_id,
          postCount: 0,
          isActive: true,
          createdAt: sub.created_at,
          sort_order: sub.sort_order
        })),
        postCount: 0,
        isActive: true,
        createdAt: category.created_at,
        sort_order: category.sort_order
      };
    }

    // Try updating as subcategory
    const { data: subcategory, error: subcategoryError } = await supabase
      .from('subcategories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!subcategoryError && subcategory) {
      return {
        id: subcategory.id,
        name: subcategory.name,
        slug: subcategory.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
        description: subcategory.description || undefined,
        parentId: subcategory.category_id,
        children: undefined,
        postCount: 0,
        isActive: true,
        createdAt: subcategory.created_at,
        sort_order: subcategory.sort_order
      };
    }

    return null;
  });
}

export async function deleteCategory(id: string): Promise<boolean> {
  return withAuthRetry(async () => {
    // Try deleting as main category first (this will cascade delete subcategories)
    const { error: categoryError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (!categoryError) {
      return true;
    }

    // Try deleting as subcategory
    const { error: subcategoryError } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', id);

    if (!subcategoryError) {
      return true;
    }

    console.error('Failed to delete category:', categoryError, subcategoryError);
    return false;
  });
}

// Utility function to fix duplicate sort orders
export async function fixDuplicateSortOrders(): Promise<boolean> {
  return withAuthRetry(async () => {
    try {
      // Fix main categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        throw categoriesError;
      }

      // Update sort orders for main categories (starting from 1)
      for (let i = 0; i < (categories || []).length; i++) {
        const category = categories[i];
        const newSortOrder = i + 1;
        console.log(`Updating category ${category.name} sort_order to ${newSortOrder}`);
        await supabase
          .from('categories')
          .update({ sort_order: newSortOrder })
          .eq('id', category.id);
      }

      // Fix subcategories for each main category
      for (const category of categories || []) {
        const { data: subcategories, error: subcategoriesError } = await supabase
          .from('subcategories')
          .select('*')
          .eq('category_id', category.id)
          .order('created_at', { ascending: true });

        if (subcategoriesError) {
          console.error('Error fetching subcategories:', subcategoriesError);
          continue;
        }

        // Update sort orders for subcategories (starting from 1)
        for (let i = 0; i < (subcategories || []).length; i++) {
          const subcategory = subcategories[i];
          const newSortOrder = i + 1;
          console.log(`Updating subcategory ${subcategory.name} sort_order to ${newSortOrder}`);
          await supabase
            .from('subcategories')
            .update({ sort_order: newSortOrder })
            .eq('id', subcategory.id);
        }
      }

      console.log('Successfully fixed duplicate sort orders');
      return true;
    } catch (error) {
      console.error('Failed to fix duplicate sort orders:', error);
      return false;
    }
  });
}