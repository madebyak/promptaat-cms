import { PromptKit } from '@/types/promptKit';
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

// Keep mock data for development fallback
const mockPromptKits: PromptKit[] = [
  {
    id: '1',
    name: 'SEO Content Strategy Kit',
    description: 'A comprehensive set of prompts for planning, creating, and optimizing SEO content.',
    article: 'This kit contains 5 prompts that work together to help you build a complete SEO content strategy...',
    image_url: '/images/prompt-kits/seo-kit.png',
    tags: ['SEO', 'content marketing', 'blogging', 'keyword research'],
    rating: 4.9,
    likes_count: 856,
    views_count: 12845,
    uses_count: 3267,
    visibility: 'published',
    tier: 'pro',
    createdAt: '2023-04-15T10:30:00Z',
    updatedAt: '2023-06-22T14:15:22Z',
    categories: ['Marketing'],
    subcategories: ['SEO', 'Content Marketing'],
    tool_ids: []
  },
  {
    id: '2',
    name: 'Social Media Campaign Bundle',
    description: 'Everything you need to plan, create, and schedule a successful social media campaign.',
    article: 'This bundle includes campaign planning, content creation for 5 platforms, and analytics review prompts...',
    image_url: '/images/prompt-kits/social-media-bundle.png',
    tags: ['social media', 'marketing', 'campaign', 'content creation'],
    rating: 4.8,
    likes_count: 743,
    views_count: 9876,
    uses_count: 2814,
    tier: 'pro',
    visibility: 'published',
    createdAt: '2023-05-18T09:45:12Z',
    updatedAt: '2023-07-02T16:20:35Z',
    categories: ['Marketing'],
    subcategories: ['Social Media'],
    tool_ids: []
  },
  {
    id: '3',
    name: 'Academic Research Assistant Kit',
    description: 'A collection of prompts designed to help researchers at every stage of the academic process.',
    article: 'The Academic Research Assistant Kit provides specialized prompts for literature reviews, methodology planning...',
    image_url: '/images/prompt-kits/research-kit.png',
    tags: ['academic', 'research', 'literature review', 'thesis', 'dissertation'],
    rating: 4.7,
    likes_count: 612,
    views_count: 7532,
    uses_count: 2156,
    tier: 'free',
    visibility: 'published',
    createdAt: '2023-03-22T11:25:40Z',
    updatedAt: '2023-05-14T09:10:18Z',
    categories: ['Education'],
    subcategories: ['Academic Research'],
    tool_ids: []
  },
  {
    id: '4',
    name: 'E-Commerce Product Launch Kit',
    description: 'Launch new products successfully with this comprehensive set of prompts covering all aspects of product marketing.',
    article: 'The E-Commerce Product Launch Kit contains 8 specialized prompts that cover every touchpoint in a successful product launch...',
    image_url: '/images/prompt-kits/ecommerce-kit.png',
    tags: ['e-commerce', 'product launch', 'marketing', 'sales'],
    rating: 4.9,
    likes_count: 892,
    views_count: 14568,
    uses_count: 4125,
    tier: 'pro',
    visibility: 'published',
    createdAt: '2023-06-05T13:40:22Z',
    updatedAt: '2023-07-18T11:30:45Z',
    categories: ['E-commerce'],
    subcategories: ['Product Marketing'],
    tool_ids: []
  },
  {
    id: '5',
    name: 'UX Design Process Kit',
    description: 'A complete set of prompts covering the entire UX design process from research to usability testing.',
    article: 'The UX Design Process Kit contains specialized prompts for user research, persona development, journey mapping...',
    image_url: '/images/prompt-kits/ux-kit.png',
    tags: ['UX design', 'user research', 'wireframing', 'usability', 'design thinking'],
    rating: 4.8,
    likes_count: 723,
    views_count: 9125,
    uses_count: 2576,
    tier: 'pro',
    visibility: 'published',
    createdAt: '2023-04-28T15:20:10Z',
    updatedAt: '2023-06-17T10:35:42Z',
    categories: ['Design'],
    subcategories: ['UX/UI'],
    tool_ids: []
  },
  {
    id: '6',
    name: 'Fiction Writing Workshop',
    description: 'Develop compelling characters, plotlines, and worlds with this fiction writing prompt collection.',
    article: 'This workshop kit contains prompts designed to help fiction writers overcome common challenges and craft compelling stories...',
    image_url: '/images/prompt-kits/fiction-kit.png',
    tags: ['fiction', 'writing', 'creative', 'storytelling'],
    rating: 4.9,
    likes_count: 1256,
    views_count: 19875,
    uses_count: 6542,
    tier: 'free',
    visibility: 'published',
    createdAt: '2023-02-14T11:10:25Z',
    updatedAt: '2023-04-22T09:45:30Z',
    categories: ['Creative Writing'],
    subcategories: ['Fiction'],
    tool_ids: []
  },
  {
    id: '7',
    name: 'Data Analysis Starter Pack',
    description: 'Prompts for cleaning data, performing analysis, creating visualizations, and interpreting results.',
    article: 'The Data Analysis Starter Pack provides structured prompts for every stage of the data analysis process...',
    image_url: '/images/prompt-kits/data-analysis-kit.png',
    tags: ['data analysis', 'statistics', 'visualization', 'reporting'],
    rating: 4.6,
    likes_count: 584,
    views_count: 8954,
    uses_count: 2376,
    tier: 'pro',
    visibility: 'published',
    createdAt: '2023-05-30T14:20:15Z',
    updatedAt: '2023-06-28T12:15:40Z',
    categories: ['Data Science'],
    subcategories: ['Analysis'],
    tool_ids: []
  },
  {
    id: '8',
    name: 'Personal Branding Toolkit',
    description: 'Build and strengthen your personal brand with this collection of specialized prompts.',
    article: 'The Personal Branding Toolkit helps you define your unique value proposition, develop a consistent voice...',
    image_url: '/images/prompt-kits/personal-branding-kit.png',
    tags: ['personal branding', 'professional development', 'LinkedIn', 'content creation'],
    rating: 4.7,
    likes_count: 678,
    views_count: 9876,
    uses_count: 2854,
    tier: 'free',
    visibility: 'published',
    createdAt: '2023-03-12T09:30:20Z',
    updatedAt: '2023-05-24T11:40:35Z',
    categories: ['Career Development'],
    subcategories: ['Personal Branding'],
    tool_ids: []
  },
  {
    id: '9',
    name: 'Web Development Project Templates',
    description: 'A collection of prompts to help structure and document every phase of a web development project.',
    article: 'These templates cover requirements gathering, architecture planning, coding standards, testing protocols...',
    image_url: '/images/prompt-kits/web-dev-kit.png',
    tags: ['web development', 'project management', 'documentation', 'coding'],
    rating: 4.8,
    likes_count: 745,
    views_count: 11245,
    uses_count: 3215,
    tier: 'pro',
    visibility: 'published',
    createdAt: '2023-06-18T13:10:45Z',
    updatedAt: '2023-07-20T10:25:30Z',
    categories: ['Programming'],
    subcategories: ['Web Development'],
    tool_ids: []
  },
  {
    id: '10',
    name: 'Product Management Essentials',
    description: 'Essential prompts for product managers covering roadmap planning, user stories, and feature prioritization.',
    article: 'The Product Management Essentials kit provides specialized prompts for creating user stories, defining acceptance criteria...',
    image_url: '/images/prompt-kits/product-mgmt-kit.png',
    tags: ['product management', 'user stories', 'roadmap', 'agile'],
    rating: 4.7,
    likes_count: 634,
    views_count: 9528,
    uses_count: 2746,
    tier: 'pro',
    visibility: 'published',
    createdAt: '2023-05-10T10:15:25Z',
    updatedAt: '2023-06-30T14:20:10Z',
    categories: ['Business'],
    subcategories: ['Product Management'],
    tool_ids: []
  }
];

// Database functions
export async function getPromptKits(): Promise<PromptKit[]> {
  return withAuthRetry(async () => {
    try {
      // Get all prompt kits
      const { data: promptKits, error } = await supabase
        .from('prompt_kits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching prompt kits:', error);
        throw error;
      }

      // For each prompt kit, get its categories, subcategories, and tools
      const kitsWithCategories = await Promise.all((promptKits || []).map(async (kit) => {
        // Get categories for this kit
        const { data: kitCategories, error: catError } = await supabase
          .from('kit_categories')
          .select(`
            category_id,
            subcategory_id,
            categories(name),
            subcategories(name)
          `)
          .eq('kit_id', kit.id);

        if (catError) {
          console.error(`Error fetching categories for kit ${kit.id}:`, catError);
        }

        // Get tools for this kit
        const { data: kitTools, error: toolError } = await supabase
          .from('kit_tools')
          .select('tool_id')
          .eq('kit_id', kit.id);

        if (toolError) {
          console.error(`Error fetching tools for kit ${kit.id}:`, toolError);
        }

        // Extract category and subcategory names
        const categories = kitCategories
          ?.filter(kc => kc.categories)
          .map(kc => kc.categories.name) || [];
        
        const subcategories = kitCategories
          ?.filter(kc => kc.subcategories)
          .map(kc => kc.subcategories.name) || [];

        // Extract tool IDs
        const tool_ids = kitTools?.map(kt => kt.tool_id) || [];

        return mapKitToClientFormat(kit, categories, subcategories, tool_ids);
      }));

      return kitsWithCategories;
    } catch (error) {
      console.error('Failed to load prompt kits:', error);
      // Fallback to mock data in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock prompt kits data as fallback');
        return mockPromptKits;
      }
      throw error;
    }
  });
}

export async function getPromptKitById(id: string): Promise<PromptKit | null> {
  return withAuthRetry(async () => {
    try {
      // Get the prompt kit
      const { data: kit, error } = await supabase
        .from('prompt_kits')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !kit) {
        console.error('Error fetching prompt kit:', error);
        return null;
      }

      // Get categories for this kit
      const { data: kitCategories, error: catError } = await supabase
        .from('kit_categories')
        .select(`
          category_id,
          subcategory_id,
          categories(name),
          subcategories(name)
        `)
        .eq('kit_id', id);

      if (catError) {
        console.error(`Error fetching categories for kit ${id}:`, catError);
      }

      // Get tools for this kit
      const { data: kitTools, error: toolError } = await supabase
        .from('kit_tools')
        .select('tool_id')
        .eq('kit_id', id);

      if (toolError) {
        console.error(`Error fetching tools for kit ${id}:`, toolError);
      }

      // Extract category and subcategory names
      const categories = kitCategories
        ?.filter(kc => kc.categories)
        .map(kc => kc.categories.name) || [];
      
      const subcategories = kitCategories
        ?.filter(kc => kc.subcategories)
        .map(kc => kc.subcategories.name) || [];

      // Extract tool IDs
      const tool_ids = kitTools?.map(kt => kt.tool_id) || [];

      return mapKitToClientFormat(kit, categories, subcategories, tool_ids);
    } catch (error) {
      console.error('Failed to fetch prompt kit by ID:', error);
      // Fallback to mock data in development
      if (process.env.NODE_ENV === 'development') {
        return mockPromptKits.find(kit => kit.id === id) || null;
      }
      return null;
    }
  });
}

export async function createPromptKit(kitData: Omit<PromptKit, 'id' | 'createdAt' | 'updatedAt'>): Promise<PromptKit> {
  return withAuthRetry(async () => {
    try {
      // Extract categories, subcategories, and tool_ids
      const { categories, subcategories, tool_ids, ...kitInfo } = kitData;

      // Insert the prompt kit
      const { data: kit, error } = await supabase
        .from('prompt_kits')
        .insert({
          name: kitInfo.name,
          description: kitInfo.description,

          article: kitInfo.article,
          image_url: kitInfo.image_url,
          keywords: kitInfo.tags, // Map tags to keywords in DB
          rating: 0, // Start with 0 rating
          likes_count: 0,
          views_count: 0,
          uses_count: 0,
          visibility: kitInfo.visibility,
          tier: kitInfo.tier
        })
        .select()
        .single();

      if (error || !kit) {
        console.error('Error creating prompt kit:', error);
        throw error;
      }

      // Add categories and subcategories
      await addKitCategories(kit.id, categories, subcategories);

      // Add tool associations
      if (tool_ids.length > 0) {
        const toolInserts = tool_ids.map(toolId => ({
          kit_id: kit.id,
          tool_id: toolId
        }));

        const { error: toolError } = await supabase
          .from('kit_tools')
          .insert(toolInserts);

        if (toolError) {
          console.error('Error creating kit tools:', toolError);
          // Clean up the kit if tool insertion fails
          await supabase.from('prompt_kits').delete().eq('id', kit.id);
          throw toolError;
        }
      }

      return {
        ...kitInfo,
        id: kit.id,
        createdAt: kit.created_at,
        updatedAt: kit.updated_at,
        categories,
        subcategories,
        tool_ids,
        rating: 0,
        likes_count: 0,
        views_count: 0,
        uses_count: 0
      };
    } catch (error) {
      console.error('Failed to create prompt kit:', error);
      throw error;
    }
  });
}

export async function updatePromptKit(id: string, updates: Partial<Omit<PromptKit, 'id' | 'createdAt'>>): Promise<PromptKit | null> {
  return withAuthRetry(async () => {
    try {
      // Extract categories, subcategories, and tool_ids if they exist
      const { categories, subcategories, tool_ids, ...kitUpdates } = updates;

      // Prepare database updates
      const dbUpdates: Record<string, unknown> = {};
      if (kitUpdates.name) dbUpdates.name = kitUpdates.name;
      if (kitUpdates.description) dbUpdates.description = kitUpdates.description;

      if (kitUpdates.article) dbUpdates.article = kitUpdates.article;
      if (kitUpdates.image_url) dbUpdates.image_url = kitUpdates.image_url;
      if (kitUpdates.tags) dbUpdates.keywords = kitUpdates.tags;
      if (kitUpdates.visibility) dbUpdates.visibility = kitUpdates.visibility;
      if (kitUpdates.tier) dbUpdates.tier = kitUpdates.tier;

      // Update the prompt kit
      const { data: kit, error } = await supabase
        .from('prompt_kits')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error || !kit) {
        console.error('Error updating prompt kit:', error);
        return null;
      }

      // If categories or subcategories were provided, update them
      if (categories || subcategories) {
        // First remove existing associations
        await supabase
          .from('kit_categories')
          .delete()
          .eq('kit_id', id);

        // Then add new ones
        await addKitCategories(id, categories || [], subcategories || []);
      }

      // If tool_ids were provided, update them
      if (tool_ids !== undefined) {
        // First remove existing tool associations
        await supabase
          .from('kit_tools')
          .delete()
          .eq('kit_id', id);

        // Then add new tool associations
        if (tool_ids.length > 0) {
          const toolInserts = tool_ids.map(toolId => ({
            kit_id: id,
            tool_id: toolId
          }));

          const { error: toolError } = await supabase
            .from('kit_tools')
            .insert(toolInserts);

          if (toolError) {
            console.error('Error updating kit tools:', toolError);
            throw toolError;
          }
        }
      }

      // Get the updated kit with categories
      return getPromptKitById(id);
    } catch (error) {
      console.error('Failed to update prompt kit:', error);
      return null;
    }
  });
}

export async function deletePromptKit(id: string): Promise<boolean> {
  return withAuthRetry(async () => {
    try {
      // Delete the prompt kit (will cascade delete kit_categories entries)
      const { error } = await supabase
        .from('prompt_kits')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting prompt kit:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete prompt kit:', error);
      return false;
    }
  });
}

// Helper function to map database kit to client format
function mapKitToClientFormat(kit: Record<string, unknown>, categories: string[], subcategories: string[], tool_ids: string[] = []): PromptKit {
  return {
    id: kit.id as string,
    name: kit.name as string,
    description: (kit.description as string) || '',

    article: (kit.article as string) || '',
    image_url: (kit.image_url as string) || '',
    tags: (kit.keywords as string[]) || [],
    rating: (kit.rating as number) || 0,
    likes_count: (kit.likes_count as number) || 0,
    views_count: (kit.views_count as number) || 0,
    uses_count: (kit.uses_count as number) || 0,
    visibility: (kit.visibility as 'published' | 'draft') || 'draft',
    tier: (kit.tier as 'free' | 'pro') || 'free',
    createdAt: kit.created_at as string,
    updatedAt: kit.updated_at as string,
    categories,
    subcategories,
    tool_ids
  };
}

// Helper function to add kit categories
async function addKitCategories(kitId: string, categories: string[], subcategories: string[]): Promise<void> {
  try {
    // Get category IDs from names
    const { data: categoryData, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .in('name', categories);

    if (catError) {
      console.error('Error fetching category IDs:', catError);
      return;
    }

    // Get subcategory IDs from names
    const { data: subcategoryData, error: subcatError } = await supabase
      .from('subcategories')
      .select('id, name, category_id')
      .in('name', subcategories);

    if (subcatError) {
      console.error('Error fetching subcategory IDs:', subcatError);
      return;
    }

    // Create category associations
    const categoryInserts = categoryData?.map(cat => ({
      kit_id: kitId,
      category_id: cat.id,
      subcategory_id: '' // Use empty string instead of null
    })) || [];

    // Create subcategory associations
    const subcategoryInserts = subcategoryData?.map(subcat => ({
      kit_id: kitId,
      category_id: subcat.category_id,
      subcategory_id: subcat.id
    })) || [];

    // Combine and insert all associations
    const allInserts = [...categoryInserts, ...subcategoryInserts];
    if (allInserts.length > 0) {
      const { error: insertError } = await supabase
        .from('kit_categories')
        .insert(allInserts);

      if (insertError) {
        console.error('Error inserting kit categories:', insertError);
      }
    }
  } catch (error) {
    console.error('Failed to add kit categories:', error);
  }
}
