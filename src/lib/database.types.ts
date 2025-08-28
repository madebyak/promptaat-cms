export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          id: string
          category_id: string
          name: string
          description: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          description?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          description?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      admins: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: string
          created_by: string | null
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          role: string
          created_by?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: string
          created_by?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tools: {
        Row: {
          id: string
          name: string
          image_url: string | null
          website_link: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          image_url?: string | null
          website_link?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          image_url?: string | null
          website_link?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          email: string | null
          first_name: string
          last_name: string
          company: string | null
          role: string | null
          usage_purpose: string
          referral_source: string | null
          profile_picture_url: string | null
          status: string
          last_login: string | null
          last_activity: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          first_name: string
          last_name: string
          company?: string | null
          role?: string | null
          usage_purpose: string
          referral_source?: string | null
          profile_picture_url?: string | null
          status?: string
          last_login?: string | null
          last_activity?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          first_name?: string
          last_name?: string
          company?: string | null
          role?: string | null
          usage_purpose?: string
          referral_source?: string | null
          profile_picture_url?: string | null
          status?: string
          last_login?: string | null
          last_activity?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      prompts: {
        Row: {
          id: string
          name: string
          description: string | null
          prompt_content: string
          instructions: string | null
          keywords: string[] | null
          rating: number
          likes_count: number
          copies_count: number
          visibility: string
          tier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          prompt_content: string
          instructions?: string | null
          keywords?: string[] | null
          rating?: number
          likes_count?: number
          copies_count?: number
          visibility?: string
          tier?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          prompt_content?: string
          instructions?: string | null
          keywords?: string[] | null
          rating?: number
          likes_count?: number
          copies_count?: number
          visibility?: string
          tier?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      prompt_kits: {
        Row: {
          id: string
          name: string
          description: string | null
          article: string | null
          image_url: string | null
          keywords: string[] | null
          rating: number
          likes_count: number
          views_count: number
          uses_count: number
          visibility: string
          tier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          article?: string | null
          image_url?: string | null
          keywords?: string[] | null
          rating?: number
          likes_count?: number
          views_count?: number
          uses_count?: number
          visibility?: string
          tier?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          article?: string | null
          image_url?: string | null
          keywords?: string[] | null
          rating?: number
          likes_count?: number
          views_count?: number
          uses_count?: number
          visibility?: string
          tier?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      prompt_categories: {
        Row: {
          id: string
          prompt_id: string
          category_id: string
          subcategory_id: string
          created_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          category_id: string
          subcategory_id: string
          created_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          category_id?: string
          subcategory_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_categories_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_categories_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          }
        ]
      }
      kit_categories: {
        Row: {
          id: string
          kit_id: string
          category_id: string
          subcategory_id: string
          created_at: string
        }
        Insert: {
          id?: string
          kit_id: string
          category_id: string
          subcategory_id: string
          created_at?: string
        }
        Update: {
          id?: string
          kit_id?: string
          category_id?: string
          subcategory_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kit_categories_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "prompt_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_categories_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          }
        ]
      }
      prompt_tools: {
        Row: {
          id: string
          prompt_id: string
          tool_id: string
          created_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          tool_id: string
          created_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          tool_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_tools_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          }
        ]
      }
      kit_tools: {
        Row: {
          id: string
          kit_id: string
          tool_id: string
          created_at: string
        }
        Insert: {
          id?: string
          kit_id: string
          tool_id: string
          created_at?: string
        }
        Update: {
          id?: string
          kit_id?: string
          tool_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kit_tools_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "prompt_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          }
        ]
      }
      user_liked_prompts: {
        Row: {
          id: string
          user_id: string
          prompt_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_liked_prompts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_liked_prompts_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          }
        ]
      }
      user_liked_kits: {
        Row: {
          id: string
          user_id: string
          kit_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          kit_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          kit_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_liked_kits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_liked_kits_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "prompt_kits"
            referencedColumns: ["id"]
          }
        ]
      }
      prompt_reviews: {
        Row: {
          id: string
          prompt_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_reviews_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      kit_reviews: {
        Row: {
          id: string
          kit_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kit_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          kit_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kit_reviews_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "prompt_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      collections: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          visibility: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          visibility?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          visibility?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      collection_prompts: {
        Row: {
          id: string
          collection_id: string
          prompt_id: string
          created_at: string
        }
        Insert: {
          id?: string
          collection_id: string
          prompt_id: string
          created_at?: string
        }
        Update: {
          id?: string
          collection_id?: string
          prompt_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_prompts_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_prompts_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          }
        ]
      }
      collection_kits: {
        Row: {
          id: string
          collection_id: string
          kit_id: string
          created_at: string
        }
        Insert: {
          id?: string
          collection_id: string
          kit_id: string
          created_at?: string
        }
        Update: {
          id?: string
          collection_id?: string
          kit_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_kits_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_kits_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "prompt_kits"
            referencedColumns: ["id"]
          }
        ]
      }
      change_logs: {
        Row: {
          id: string
          name: string
          image_url: string | null
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          image_url?: string | null
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          image_url?: string | null
          description?: string
          created_at?: string
        }
        Relationships: []
      }
      prompt_requests: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_prompt_likes: {
        Args: { prompt_id: string }
        Returns: number
      },
      increment_prompt_copies: {
        Args: { prompt_id: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
