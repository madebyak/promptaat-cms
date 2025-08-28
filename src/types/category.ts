export interface Category {
  id: string;
  name: string;
  slug?: string;  // Not in database schema, will be derived from name
  description?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Client-side computed fields
  children?: Subcategory[];
  postCount?: number;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Client-side computed fields
  postCount?: number;
}

// For backward compatibility with existing components
export interface LegacyCategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  children?: LegacyCategory[];
  postCount?: number;
  isActive?: boolean;
  createdAt: string;
  sort_order: number;
}