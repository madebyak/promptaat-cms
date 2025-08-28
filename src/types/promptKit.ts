export interface PromptKit {
  id: string;
  name: string;
  description: string;
  instructions: string;
  article: string;
  image_url: string;
  tags: string[];
  rating: number;
  likes_count: number;
  views_count: number;
  uses_count: number;
  visibility: 'published' | 'draft';
  tier: 'free' | 'pro';
  createdAt: string;
  updatedAt: string;
  categories: string[];
  subcategories: string[];
  tool_ids: string[];
}

export type PromptKitTier = PromptKit['tier'];
export type PromptKitVisibility = PromptKit['visibility'];
