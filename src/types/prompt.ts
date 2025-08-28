export interface Prompt {
  id: string;
  name: string;
  description: string;
  prompt_content?: string;
  promptContent?: string;
  instructions?: string;
  keywords: string[];
  tier: 'free' | 'pro';
  visibility: 'published' | 'draft';
  createdAt: string;
  updatedAt: string;
  rating: number;
  likesCount: number;
  copiesCount: number;
  viewsCount: number;
  categories: Array<{ category_id: string; subcategory_id?: string | null }>;
  subcategories: string[];
  tools?: Array<{ tool_id: string }>;
}

// Database row interfaces
export interface PromptDbRow {
  id: string;
  name: string;
  description: string;
  prompt_content: string;
  instructions: string;
  keywords: string[];
  tier: 'free' | 'pro';
  visibility: 'published' | 'draft';
  created_at: string;
  updated_at: string;
  rating: number;
  likes_count: number;
  copies_count: number;
  views_count: number;
}

// Database-specific interfaces for creation/updates
export interface CreatePromptData {
  name: string;
  description: string;
  prompt_content: string;
  instructions: string;
  keywords: string[];
  visibility: 'published' | 'draft';
  tier: 'free' | 'pro';
  category_id?: string | null;
  subcategory_id?: string | null;
  category_ids?: string[];
  subcategory_ids?: string[];
  tool_ids?: string[];
}

export type PromptTier = Prompt['tier'];
export type PromptVisibility = Prompt['visibility'];

// Helper interfaces for working with database relations
export interface PromptCategory {
  id: string;
  prompt_id: string;
  category_id: string;
  subcategory_id?: string | null;
  category_name: string;
  subcategory_name?: string | null;
}

export interface PromptTool {
  id: string;
  prompt_id: string;
  tool_id: string;
  tool_name: string;
  tool_image_url?: string | null;
}

// Database response types
export interface CategoriesResponse {
  id: string;
  prompt_id: string;
  category_id: string;
  subcategory_id?: string | null;
  categories: {
    name: string;
  };
  subcategories?: {
    name?: string | null;
  } | null;
}

export interface ToolsResponse {
  id: string;
  prompt_id: string;
  tool_id: string;
  tools: {
    name: string;
    image_url?: string | null;
  };
}
