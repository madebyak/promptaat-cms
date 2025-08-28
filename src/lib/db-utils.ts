/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase, getSupabaseAdmin } from './supabase'
import { Database } from './database.types'

type Tables = Database['public']['Tables']

// Generic CRUD operations
export class DatabaseService {
  // Generic fetch with filters and pagination
  static async fetch<T extends keyof Tables>(
    table: T,
    options: {
      select?: string
      filters?: Record<string, unknown>
      orderBy?: { column: string; ascending?: boolean }
      limit?: number
      offset?: number
    } = {}
  ) {
    let query = supabase.from(table).select(options.select || '*')

    // Apply filters
    if (options.filters) {
      // Need to handle the filters in a type-safe way for Supabase
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key as any, value)
        }
      })
    }

    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true,
      })
    }

    // Apply pagination
    if (options.limit) {
      const from = options.offset || 0
      const to = from + options.limit - 1
      query = query.range(from, to)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error fetching from ${table}: ${error.message}`)
    }

    return { data, count }
  }

  // Generic insert
  static async insert<T extends keyof Tables>(
    table: T, 
    data: any // Using any here is necessary due to Supabase's complex typed generic APIs
  ) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single()

    if (error) {
      throw new Error(`Error inserting into ${table}: ${error.message}`)
    }

    return result
  }

  // Generic update
  static async update<T extends keyof Tables>(
    table: T,
    id: string,
    data: any // Using any here is necessary due to Supabase's complex typed generic APIs
  ) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id' as any, id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating ${table}: ${error.message}`)
    }

    return result
  }

  // Generic delete
  static async delete<T extends keyof Tables>(table: T, id: string) {
    const { error } = await supabase.from(table).delete().eq('id' as any, id)

    if (error) {
      throw new Error(`Error deleting from ${table}: ${error.message}`)
    }

    return true
  }

  // Get by ID
  static async getById<T extends keyof Tables>(table: T, id: string) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id' as any, id)
      .single()

    if (error) {
      throw new Error(`Error fetching ${table} by ID: ${error.message}`)
    }

    return data
  }
}

// Specific database operations for your schema

// Categories with subcategories
export const categoriesService = {
  async getCategoriesWithSubcategories() {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        subcategories (*)
      `)
      .order('sort_order')

    if (error) throw new Error(`Error fetching categories: ${error.message}`)
    return data
  },

  async createCategory(category: Tables['categories']['Insert']) {
    return DatabaseService.insert('categories', category)
  },

  async createSubcategory(subcategory: Tables['subcategories']['Insert']) {
    return DatabaseService.insert('subcategories', subcategory)
  },
}

// Prompts with related data
export const promptsService = {
  async getPromptsWithCategories(options: {
    limit?: number
    offset?: number
    categoryId?: string
    tier?: string
    visibility?: string
  } = {}) {
    let query = supabase
      .from('prompts')
      .select(`
        *,
        prompt_categories (
          categories (*),
          subcategories (*)
        ),
        prompt_tools (
          tools (*)
        )
      `)

    if (options.categoryId) {
      query = query.eq('prompt_categories.category_id', options.categoryId)
    }

    if (options.tier) {
      query = query.eq('tier', options.tier)
    }

    if (options.visibility) {
      query = query.eq('visibility', options.visibility)
    }

    query = query.order('created_at', { ascending: false })

    if (options.limit) {
      const from = options.offset || 0
      const to = from + options.limit - 1
      query = query.range(from, to)
    }

    const { data, error } = await query

    if (error) throw new Error(`Error fetching prompts: ${error.message}`)
    return data
  },

  async createPrompt(prompt: Tables['prompts']['Insert']) {
    return DatabaseService.insert('prompts', prompt)
  },

  async incrementLikes(promptId: string) {
    const { data, error } = await supabase.rpc('increment_prompt_likes', {
      prompt_id: promptId
    })

    if (error) throw new Error(`Error incrementing likes: ${error.message}`)
    return data
  },

  async incrementCopies(promptId: string) {
    const { data, error } = await supabase.rpc('increment_prompt_copies', {
      prompt_id: promptId
    })

    if (error) throw new Error(`Error incrementing copies: ${error.message}`)
    return data
  },
}

// Prompt Kits
export const promptKitsService = {
  async getPromptKitsWithCategories(options: {
    limit?: number
    offset?: number
    categoryId?: string
    tier?: string
    visibility?: string
  } = {}) {
    let query = supabase
      .from('prompt_kits')
      .select(`
        *,
        kit_categories (
          categories (*),
          subcategories (*)
        ),
        kit_tools (
          tools (*)
        )
      `)

    if (options.categoryId) {
      query = query.eq('kit_categories.category_id', options.categoryId)
    }

    if (options.tier) {
      query = query.eq('tier', options.tier)
    }

    if (options.visibility) {
      query = query.eq('visibility', options.visibility)
    }

    query = query.order('created_at', { ascending: false })

    if (options.limit) {
      const from = options.offset || 0
      const to = from + options.limit - 1
      query = query.range(from, to)
    }

    const { data, error } = await query

    if (error) throw new Error(`Error fetching prompt kits: ${error.message}`)
    return data
  },

  async createPromptKit(kit: Tables['prompt_kits']['Insert']) {
    return DatabaseService.insert('prompt_kits', kit)
  },
}

// User operations
export const usersService = {
  async createUserProfile(profile: Tables['user_profiles']['Insert']) {
    return DatabaseService.insert('user_profiles', profile)
  },

  async updateUserProfile(userId: string, updates: Tables['user_profiles']['Update']) {
    return DatabaseService.update('user_profiles', userId, updates)
  },

  async getUserProfile(userId: string) {
    return DatabaseService.getById('user_profiles', userId)
  },

  async updateLastActivity(userId: string) {
    return DatabaseService.update('user_profiles', userId, {
      last_activity: new Date().toISOString(),
    })
  },
}

// Search functionality
export const searchService = {
  async searchPrompts(query: string, options: {
    limit?: number
    categoryId?: string
    tier?: string
  } = {}) {
    let dbQuery = supabase
      .from('prompts')
      .select(`
        *,
        prompt_categories (
          categories (*),
          subcategories (*)
        )
      `)
      .or(`name.ilike.%${query}%, description.ilike.%${query}%, keywords.cs.{${query}}`)
      .eq('visibility', 'published')

    if (options.categoryId) {
      dbQuery = dbQuery.eq('prompt_categories.category_id', options.categoryId)
    }

    if (options.tier) {
      dbQuery = dbQuery.eq('tier', options.tier)
    }

    if (options.limit) {
      dbQuery = dbQuery.limit(options.limit)
    }

    const { data, error } = await dbQuery

    if (error) throw new Error(`Error searching prompts: ${error.message}`)
    return data
  },

  async searchPromptKits(query: string, options: {
    limit?: number
    categoryId?: string
    tier?: string
  } = {}) {
    let dbQuery = supabase
      .from('prompt_kits')
      .select(`
        *,
        kit_categories (
          categories (*),
          subcategories (*)
        )
      `)
      .or(`name.ilike.%${query}%, description.ilike.%${query}%, keywords.cs.{${query}}`)
      .eq('visibility', 'published')

    if (options.categoryId) {
      dbQuery = dbQuery.eq('kit_categories.category_id', options.categoryId)
    }

    if (options.tier) {
      dbQuery = dbQuery.eq('tier', options.tier)
    }

    if (options.limit) {
      dbQuery = dbQuery.limit(options.limit)
    }

    const { data, error } = await dbQuery

    if (error) throw new Error(`Error searching prompt kits: ${error.message}`)
    return data
  },
}
