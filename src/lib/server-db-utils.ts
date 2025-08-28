// Server-side only database utilities
// This file should only be imported in server components or API routes

import { getSupabaseAdmin } from './supabase'
import { Database } from './database.types'

type Tables = Database['public']['Tables']

// Server-side admin operations that bypass RLS
export class AdminDatabaseService {
  private static getClient() {
    return getSupabaseAdmin()
  }

  // Admin-only operations for managing content
  static async adminFetch<T extends keyof Tables>(
    table: T,
    options: {
      select?: string
      filters?: Record<string, unknown>
      orderBy?: { column: string; ascending?: boolean }
      limit?: number
      offset?: number
    } = {}
  ) {
    const client = this.getClient()
    let query = client.from(table).select(options.select || '*')

    // Apply filters - apply each filter individually to avoid type issues
    if (options.filters) {
      // Create a new query by chaining filter conditions
      query = Object.entries(options.filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          // We need to use a type assertion because TypeScript can't verify
          // that the dynamic key is a valid column at compile time
          /* eslint-disable @typescript-eslint/no-explicit-any */
          const result = acc.eq(key, value as any)
          /* eslint-enable @typescript-eslint/no-explicit-any */
          return result
        }
        return acc
      }, query)
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
      throw new Error(`Admin error fetching from ${table}: ${error.message}`)
    }

    return { data, count }
  }

  // Admin insert with bypass RLS
  static async adminInsert<T extends keyof Tables>(
    table: T,
    data: Tables[T]['Insert']
  ) {
    const client = this.getClient()
    // We need to cast data to handle the type checking for different table schemas
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const { data: result, error } = await client
      .from(table)
      .insert(data as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */
      .select()
      .single()

    if (error) {
      throw new Error(`Admin error inserting into ${table}: ${error.message}`)
    }

    return result
  }

  // Admin update with bypass RLS
  static async adminUpdate<T extends keyof Tables>(
    table: T,
    id: string,
    data: Tables[T]['Update']
  ) {
    const client = this.getClient()
    // We need to cast data to handle the type checking for different table schemas
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const { data: result, error } = await client
      .from(table)
      .update(data as any)
      .eq('id' as any, id)
      .select()
      .single()
    /* eslint-enable @typescript-eslint/no-explicit-any */

    if (error) {
      throw new Error(`Admin error updating ${table}: ${error.message}`)
    }

    return result
  }

  // Admin delete with bypass RLS
  static async adminDelete<T extends keyof Tables>(table: T, id: string) {
    const client = this.getClient()
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const { error } = await client.from(table).delete().eq('id' as any, id)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    if (error) {
      throw new Error(`Admin error deleting from ${table}: ${error.message}`)
    }

    return true
  }
}

// Admin-specific operations for your schema
export const adminService = {
  // Manage admins
  async createAdmin(admin: Tables['admins']['Insert']) {
    return AdminDatabaseService.adminInsert('admins', admin)
  },

  async getAllAdmins() {
    return AdminDatabaseService.adminFetch('admins', {
      orderBy: { column: 'created_at', ascending: false }
    })
  },

  // Content moderation
  async moderatePrompt(promptId: string, action: 'approve' | 'reject') {
    const visibility = action === 'approve' ? 'published' : 'draft'
    return AdminDatabaseService.adminUpdate('prompts', promptId, { visibility })
  },

  async moderatePromptKit(kitId: string, action: 'approve' | 'reject') {
    const visibility = action === 'approve' ? 'published' : 'draft'
    return AdminDatabaseService.adminUpdate('prompt_kits', kitId, { visibility })
  },

  // Analytics and stats
  async getFullStats() {
    const client = getSupabaseAdmin()
    
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const [
      { data: userStats },
      { data: contentStats }
    ] = await Promise.all([
      client.rpc('get_user_activity_stats' as any),
      client.rpc('get_content_stats' as any)
    ])
    /* eslint-enable @typescript-eslint/no-explicit-any */

    return {
      users: userStats?.[0] || {},
      content: contentStats?.[0] || {}
    }
  },

  // User management
  async getAllUsers(options: {
    limit?: number
    offset?: number
    orderBy?: 'created_at' | 'last_login' | 'last_activity'
  } = {}) {
    return AdminDatabaseService.adminFetch('user_profiles', {
      orderBy: { 
        column: options.orderBy || 'created_at', 
        ascending: false 
      },
      limit: options.limit,
      offset: options.offset
    })
  },

  async updateUserStatus(userId: string, updates: Tables['user_profiles']['Update']) {
    return AdminDatabaseService.adminUpdate('user_profiles', userId, updates)
  }
}
