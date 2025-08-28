-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subcategories table
CREATE TABLE subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admins table (FIXED: removed foreign key constraint initially)
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- super_admin, content_admin, moderator
    created_by UUID, -- FIXED: No foreign key constraint initially, nullable
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tools table (AI agents/tools)
CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    website_link TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    role VARCHAR(100), -- Designer, Developer, Marketer, etc. (optional)
    usage_purpose VARCHAR(50) NOT NULL, -- personal, studies, work (required)
    referral_source VARCHAR(50), -- linkedin, twitter, google, etc. (optional)
    profile_picture_url TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, blocked
    last_login TIMESTAMP WITH TIME ZONE, -- Tracks actual authentication events
    last_activity TIMESTAMP WITH TIME ZONE, -- Tracks any site interaction/visit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Text prompts table
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    prompt_content TEXT NOT NULL,
    instructions TEXT, -- Instructions on how to use the    prompt
    keywords TEXT[], -- Array of keywords for search
    rating DECIMAL(3,2) DEFAULT 0, -- Average rating 0-5
    likes_count INTEGER DEFAULT 0,
    copies_count INTEGER DEFAULT 0, -- Times copied
    visibility VARCHAR(50) DEFAULT 'published', -- published or draft
    tier VARCHAR(10) DEFAULT 'free', -- free or pro
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompt kits table
CREATE TABLE prompt_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    article TEXT, -- Detailed article/tutorial content
    image_url TEXT, -- Kit thumbnail/cover image
    keywords TEXT[], -- Array of keywords for search
    rating DECIMAL(3,2) DEFAULT 0, -- Average rating 0-5
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    uses_count INTEGER DEFAULT 0,
    visibility VARCHAR(50) DEFAULT 'published', -- published or draft
    tier VARCHAR(10) DEFAULT 'free', -- free or pro
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompt categories junction table
CREATE TABLE prompt_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(prompt_id, category_id, subcategory_id)
);

-- Prompt kit categories junction table
CREATE TABLE kit_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kit_id UUID REFERENCES prompt_kits(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE CASCADE, -- Made nullable to allow category-only associations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraints that handle NULLs properly
CREATE UNIQUE INDEX kit_categories_unique_with_nulls 
ON kit_categories (kit_id, category_id) 
WHERE subcategory_id IS NULL;

CREATE UNIQUE INDEX kit_categories_unique_with_subcategory 
ON kit_categories (kit_id, category_id, subcategory_id) 
WHERE subcategory_id IS NOT NULL;

-- Prompt tools junction table
CREATE TABLE prompt_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(prompt_id, tool_id)
);

-- Kit tools junction table
CREATE TABLE kit_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kit_id UUID REFERENCES prompt_kits(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(kit_id, tool_id)
);

-- User liked prompts (formerly bookmarks)
CREATE TABLE user_liked_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, prompt_id)
);

-- User liked kits (formerly bookmarks)
CREATE TABLE user_liked_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    kit_id UUID REFERENCES prompt_kits(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, kit_id)
);

-- Reviews for prompts
CREATE TABLE prompt_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(prompt_id, user_id)
);

-- Reviews for kits
CREATE TABLE kit_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kit_id UUID REFERENCES prompt_kits(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(kit_id, user_id)
);

-- Collections table
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    visibility VARCHAR(50) DEFAULT 'private', -- public or private
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection prompts junction table
CREATE TABLE collection_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(collection_id, prompt_id)
);

-- Collection kits junction table
CREATE TABLE collection_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    kit_id UUID REFERENCES prompt_kits(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(collection_id, kit_id)
);

-- Change logs table
CREATE TABLE change_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompt requests table (formerly feature requests)
CREATE TABLE prompt_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'in_review', -- in_review, approved, rejected, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better search performance
CREATE INDEX idx_prompts_keywords ON prompts USING GIN (keywords);
CREATE INDEX idx_prompt_kits_keywords ON prompt_kits USING GIN (keywords);
CREATE INDEX idx_prompts_name ON prompts(name);
CREATE INDEX idx_prompts_rating ON prompts(rating);
CREATE INDEX idx_prompts_likes ON prompts(likes_count);
CREATE INDEX idx_prompts_copies ON prompts(copies_count);
CREATE INDEX idx_prompts_tier ON prompts(tier);
CREATE INDEX idx_prompts_visibility ON prompts(visibility);
CREATE INDEX idx_kits_name ON prompt_kits(name);
CREATE INDEX idx_kits_rating ON prompt_kits(rating);
CREATE INDEX idx_kits_likes ON prompt_kits(likes_count);
CREATE INDEX idx_kits_views ON prompt_kits(views_count);
CREATE INDEX idx_kits_uses ON prompt_kits(uses_count);
CREATE INDEX idx_kits_tier ON prompt_kits(tier);
CREATE INDEX idx_kits_visibility ON prompt_kits(visibility);
CREATE INDEX idx_tools_sort ON tools(sort_order);
CREATE INDEX idx_categories_sort ON categories(sort_order);
CREATE INDEX idx_subcategories_sort ON subcategories(sort_order);
CREATE INDEX idx_collections_user ON collections(user_id);
CREATE INDEX idx_collections_visibility ON collections(visibility);
CREATE INDEX idx_prompt_requests_user ON prompt_requests(user_id);
CREATE INDEX idx_prompt_requests_status ON prompt_requests(status);
CREATE INDEX idx_user_profiles_last_login ON user_profiles(last_login);
CREATE INDEX idx_user_profiles_last_activity ON user_profiles(last_activity);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompt_kits_updated_at BEFORE UPDATE ON prompt_kits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompt_reviews_updated_at BEFORE UPDATE ON prompt_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kit_reviews_updated_at BEFORE UPDATE ON kit_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompt_requests_updated_at BEFORE UPDATE ON prompt_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- OPTIONAL: After you've inserted your first admin, you can add the foreign key constraint
-- ALTER TABLE admins ADD CONSTRAINT admins_created_by_fkey 
--   FOREIGN KEY (created_by) REFERENCES admins(id);