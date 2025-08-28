-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- First, enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_liked_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_liked_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's profile ID
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NEW FUNCTION: Check if user has pro access
-- For now returns true for all authenticated users
-- Update this function when you add payment/subscription system
CREATE OR REPLACE FUNCTION user_has_pro_access()
RETURNS BOOLEAN AS $$
BEGIN
  -- For now, all authenticated users can access pro content
  -- This makes development and testing easier
  RETURN auth.uid() IS NOT NULL;
  
  -- When you add a payment system later, update this function to:
  -- RETURN EXISTS (
  --   SELECT 1 FROM subscriptions 
  --   WHERE user_id = auth.uid() 
  --   AND status = 'active'
  --   AND tier IN ('pro', 'enterprise')
  --   AND current_period_end > NOW()
  -- );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ADMIN POLICIES (Full Access)
-- ============================================

-- Admins table - only admins can access
CREATE POLICY "Admins full access to admins table" ON admins
    FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================
-- PUBLIC READ POLICIES (Content Discovery)
-- ============================================

-- Categories - everyone can read
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify categories" ON categories
    FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Subcategories - everyone can read
CREATE POLICY "Anyone can view subcategories" ON subcategories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify subcategories" ON subcategories
    FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Tools - everyone can read
CREATE POLICY "Anyone can view tools" ON tools
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify tools" ON tools
    FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- UPDATED POLICY: Prompts - tier-based access
CREATE POLICY "View prompts based on tier" ON prompts
    FOR SELECT USING (
        visibility = 'published' AND (
            tier = 'free' OR 
            (tier = 'pro' AND user_has_pro_access()) OR
            is_admin()
        )
    );

CREATE POLICY "Only admins can modify prompts" ON prompts
    FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- UPDATED POLICY: Prompt Kits - tier-based access
CREATE POLICY "View kits based on tier" ON prompt_kits
    FOR SELECT USING (
        visibility = 'published' AND (
            tier = 'free' OR 
            (tier = 'pro' AND user_has_pro_access()) OR
            is_admin()
        )
    );

CREATE POLICY "Only admins can modify prompt kits" ON prompt_kits
    FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================
-- JUNCTION TABLE POLICIES
-- ============================================

-- Prompt Categories - everyone can read, admins can modify
CREATE POLICY "Anyone can view prompt categories" ON prompt_categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify prompt categories" ON prompt_categories
    FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Kit Categories - everyone can read, admins can modify
CREATE POLICY "Anyone can view kit categories" ON kit_categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify kit categories" ON kit_categories
    FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Prompt Tools - everyone can read, admins can modify
CREATE POLICY "Anyone can view prompt tools" ON prompt_tools
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify prompt tools" ON prompt_tools
    FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Kit Tools - everyone can read, admins can modify
CREATE POLICY "Anyone can view kit tools" ON kit_tools
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify kit tools" ON kit_tools
    FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================
-- USER PROFILE POLICIES
-- ============================================

-- User Profiles - users can only see their own, admins see all
CREATE POLICY "Users can view own profile, admins see all" ON user_profiles
    FOR SELECT USING (
        auth.uid() = id OR is_admin()
    );

CREATE POLICY "Users can update own profile, admins can update any" ON user_profiles
    FOR UPDATE USING (
        auth.uid() = id OR is_admin()
    ) WITH CHECK (
        auth.uid() = id OR is_admin()
    );

CREATE POLICY "Users can insert own profile, admins can insert any" ON user_profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id OR is_admin()
    );

CREATE POLICY "Only admins can delete user profiles" ON user_profiles
    FOR DELETE USING (is_admin());

-- ============================================
-- USER INTERACTION POLICIES
-- ============================================

-- User Liked Prompts - users manage their own likes
CREATE POLICY "Users can manage their own liked prompts" ON user_liked_prompts
    FOR ALL USING (
        auth.uid() = user_id OR is_admin()
    ) WITH CHECK (
        auth.uid() = user_id OR is_admin()
    );

-- User Liked Kits - users manage their own likes
CREATE POLICY "Users can manage their own liked kits" ON user_liked_kits
    FOR ALL USING (
        auth.uid() = user_id OR is_admin()
    ) WITH CHECK (
        auth.uid() = user_id OR is_admin()
    );

-- Prompt Reviews - users can read all, manage their own
CREATE POLICY "Anyone can view prompt reviews" ON prompt_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own prompt reviews" ON prompt_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompt reviews" ON prompt_reviews
    FOR UPDATE USING (auth.uid() = user_id OR is_admin())
    WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can delete their own prompt reviews, admins can delete any" ON prompt_reviews
    FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Kit Reviews - users can read all, manage their own
CREATE POLICY "Anyone can view kit reviews" ON kit_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own kit reviews" ON kit_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kit reviews" ON kit_reviews
    FOR UPDATE USING (auth.uid() = user_id OR is_admin())
    WITH CHECK (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can delete their own kit reviews, admins can delete any" ON kit_reviews
    FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- ============================================
-- COLLECTIONS POLICIES
-- ============================================

-- Collections - users see public collections + their own, admins see all
CREATE POLICY "Users can view public collections and their own" ON collections
    FOR SELECT USING (
        visibility = 'public' OR 
        auth.uid() = user_id OR 
        is_admin()
    );

CREATE POLICY "Users can manage their own collections" ON collections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections, admins can update any" ON collections
    FOR UPDATE USING (
        auth.uid() = user_id OR is_admin()
    ) WITH CHECK (
        auth.uid() = user_id OR is_admin()
    );

CREATE POLICY "Users can delete their own collections, admins can delete any" ON collections
    FOR DELETE USING (
        auth.uid() = user_id OR is_admin()
    );

-- Collection Prompts - based on collection visibility
CREATE POLICY "Users can view collection prompts based on collection access" ON collection_prompts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM collections c 
            WHERE c.id = collection_id 
            AND (
                c.visibility = 'public' OR 
                c.user_id = auth.uid() OR 
                is_admin()
            )
        )
    );

CREATE POLICY "Users can manage their own collection prompts" ON collection_prompts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM collections c 
            WHERE c.id = collection_id 
            AND (c.user_id = auth.uid() OR is_admin())
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM collections c 
            WHERE c.id = collection_id 
            AND (c.user_id = auth.uid() OR is_admin())
        )
    );

-- Collection Kits - based on collection visibility
CREATE POLICY "Users can view collection kits based on collection access" ON collection_kits
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM collections c 
            WHERE c.id = collection_id 
            AND (
                c.visibility = 'public' OR 
                c.user_id = auth.uid() OR 
                is_admin()
            )
        )
    );

CREATE POLICY "Users can manage their own collection kits" ON collection_kits
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM collections c 
            WHERE c.id = collection_id 
            AND (c.user_id = auth.uid() OR is_admin())
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM collections c 
            WHERE c.id = collection_id 
            AND (c.user_id = auth.uid() OR is_admin())
        )
    );

-- ============================================
-- CHANGE LOGS POLICIES
-- ============================================

-- Change Logs - everyone can read, only admins can modify
CREATE POLICY "Anyone can view change logs" ON change_logs
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify change logs" ON change_logs
    FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================
-- PROMPT REQUESTS POLICIES
-- ============================================

-- Prompt Requests - users see their own, admins see all
CREATE POLICY "Users can view their own requests, admins see all" ON prompt_requests
    FOR SELECT USING (
        auth.uid() = user_id OR is_admin()
    );

CREATE POLICY "Users can create their own requests" ON prompt_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests, admins can update any" ON prompt_requests
    FOR UPDATE USING (
        auth.uid() = user_id OR is_admin()
    ) WITH CHECK (
        auth.uid() = user_id OR is_admin()
    );

CREATE POLICY "Users can delete their own requests, admins can delete any" ON prompt_requests
    FOR DELETE USING (
        auth.uid() = user_id OR is_admin()
    );

-- ============================================
-- ADDITIONAL SECURITY FUNCTIONS
-- ============================================

-- Function to check if user can access specific collection
CREATE OR REPLACE FUNCTION can_access_collection(collection_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM collections 
    WHERE id = collection_uuid 
    AND (
      visibility = 'public' OR 
      user_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns collection
CREATE OR REPLACE FUNCTION owns_collection(collection_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM collections 
    WHERE id = collection_uuid 
    AND (
      user_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PERFORMANCE INDEXES FOR RLS
-- ============================================

-- Indexes to support RLS policies efficiently
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_collections_user_visibility ON collections(user_id, visibility);
CREATE INDEX IF NOT EXISTS idx_prompts_visibility ON prompts(visibility);
CREATE INDEX IF NOT EXISTS idx_prompts_tier ON prompts(tier);
CREATE INDEX IF NOT EXISTS idx_prompt_kits_visibility ON prompt_kits(visibility);
CREATE INDEX IF NOT EXISTS idx_prompt_kits_tier ON prompt_kits(tier);
CREATE INDEX IF NOT EXISTS idx_user_liked_prompts_user ON user_liked_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_liked_kits_user ON user_liked_kits(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_reviews_user ON prompt_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_kit_reviews_user ON kit_reviews(user_id);

-- ============================================
-- ADMIN SETUP (FIXED)
-- ============================================

-- FIX: Make created_by nullable to avoid circular reference
ALTER TABLE admins ALTER COLUMN created_by DROP NOT NULL;

-- Insert the first admin (replace with your actual admin email)
-- This admin will have created_by as NULL since it's the first one
INSERT INTO admins (email, first_name, last_name, role, created_by) 
VALUES (
    'admin@yourplatform.com', -- Replace with your admin email
    'Super',
    'Admin',
    'super_admin',
    NULL -- First admin has no creator
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- USAGE NOTES
-- ============================================

/*
IMPORTANT SETUP NOTES:

1. Replace 'admin@yourplatform.com' with your actual admin email address

2. Make sure your Supabase project has the following JWT claims available:
   - auth.uid() for user ID
   - auth.jwt() ->> 'email' for user email

3. The admin should authenticate through your regular auth system, and their
   email should match what's in the admins table

4. These policies assume:
   - Regular users authenticate via Supabase Auth
   - Admins are identified by their email being in the admins table
   - Published content with 'free' tier is public
   - Published content with 'pro' tier requires user_has_pro_access() to return true
   - Users own their profiles, reviews, collections, and requests

5. The user_has_pro_access() function currently returns true for all authenticated users.
   Update this function when you implement your payment/subscription system.

6. To add more admins, insert into the admins table:
   INSERT INTO admins (email, first_name, last_name, role, created_by) 
   VALUES ('another@admin.com', 'Another', 'Admin', 'content_admin', 
           (SELECT id FROM admins WHERE email = 'admin@yourplatform.com'));

7. Test these policies thoroughly in a development environment before production!
*/