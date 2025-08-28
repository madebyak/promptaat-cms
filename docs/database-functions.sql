-- Database functions for your Supabase project
-- Run these in your Supabase SQL Editor after creating the main schema

-- Function to increment prompt likes count
CREATE OR REPLACE FUNCTION increment_prompt_likes(prompt_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_likes_count INTEGER;
BEGIN
  UPDATE prompts 
  SET likes_count = likes_count + 1
  WHERE id = prompt_id
  RETURNING likes_count INTO new_likes_count;
  
  RETURN new_likes_count;
END;
$$ LANGUAGE plpgsql;

-- Function to increment prompt copies count
CREATE OR REPLACE FUNCTION increment_prompt_copies(prompt_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_copies_count INTEGER;
BEGIN
  UPDATE prompts 
  SET copies_count = copies_count + 1
  WHERE id = prompt_id
  RETURNING copies_count INTO new_copies_count;
  
  RETURN new_copies_count;
END;
$$ LANGUAGE plpgsql;

-- Function to increment prompt kit views count
CREATE OR REPLACE FUNCTION increment_kit_views(kit_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_views_count INTEGER;
BEGIN
  UPDATE prompt_kits 
  SET views_count = views_count + 1
  WHERE id = kit_id
  RETURNING views_count INTO new_views_count;
  
  RETURN new_views_count;
END;
$$ LANGUAGE plpgsql;

-- Function to increment prompt kit uses count
CREATE OR REPLACE FUNCTION increment_kit_uses(kit_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_uses_count INTEGER;
BEGIN
  UPDATE prompt_kits 
  SET uses_count = uses_count + 1
  WHERE id = kit_id
  RETURNING uses_count INTO new_uses_count;
  
  RETURN new_uses_count;
END;
$$ LANGUAGE plpgsql;

-- Function to increment prompt kit likes count
CREATE OR REPLACE FUNCTION increment_kit_likes(kit_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_likes_count INTEGER;
BEGIN
  UPDATE prompt_kits 
  SET likes_count = likes_count + 1
  WHERE id = kit_id
  RETURNING likes_count INTO new_likes_count;
  
  RETURN new_likes_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user activity stats
CREATE OR REPLACE FUNCTION get_user_activity_stats()
RETURNS TABLE (
  total_users BIGINT,
  active_users_7d BIGINT,
  active_users_30d BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM user_profiles) as total_users,
    (SELECT COUNT(*) FROM user_profiles WHERE last_activity >= NOW() - INTERVAL '7 days') as active_users_7d,
    (SELECT COUNT(*) FROM user_profiles WHERE last_activity >= NOW() - INTERVAL '30 days') as active_users_30d;
END;
$$ LANGUAGE plpgsql;

-- Function to get content stats
CREATE OR REPLACE FUNCTION get_content_stats()
RETURNS TABLE (
  total_prompts BIGINT,
  published_prompts BIGINT,
  draft_prompts BIGINT,
  total_kits BIGINT,
  published_kits BIGINT,
  draft_kits BIGINT,
  total_categories BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM prompts) as total_prompts,
    (SELECT COUNT(*) FROM prompts WHERE visibility = 'published') as published_prompts,
    (SELECT COUNT(*) FROM prompts WHERE visibility = 'draft') as draft_prompts,
    (SELECT COUNT(*) FROM prompt_kits) as total_kits,
    (SELECT COUNT(*) FROM prompt_kits WHERE visibility = 'published') as published_kits,
    (SELECT COUNT(*) FROM prompt_kits WHERE visibility = 'draft') as draft_kits,
    (SELECT COUNT(*) FROM categories) as total_categories;
END;
$$ LANGUAGE plpgsql;

-- Function to search prompts with full-text search
CREATE OR REPLACE FUNCTION search_prompts_fulltext(search_query TEXT, category_filter UUID DEFAULT NULL, tier_filter TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  description TEXT,
  prompt_content TEXT,
  rating DECIMAL,
  likes_count INTEGER,
  copies_count INTEGER,
  visibility VARCHAR,
  tier VARCHAR,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.prompt_content,
    p.rating,
    p.likes_count,
    p.copies_count,
    p.visibility,
    p.tier,
    p.created_at,
    p.updated_at,
    ts_rank(
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || array_to_string(p.keywords, ' ')),
      plainto_tsquery('english', search_query)
    ) as relevance
  FROM prompts p
  LEFT JOIN prompt_categories pc ON p.id = pc.prompt_id
  WHERE 
    p.visibility = 'published'
    AND (
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '') || ' ' || array_to_string(p.keywords, ' '))
      @@ plainto_tsquery('english', search_query)
    )
    AND (category_filter IS NULL OR pc.category_id = category_filter)
    AND (tier_filter IS NULL OR p.tier = tier_filter)
  ORDER BY relevance DESC, p.rating DESC, p.likes_count DESC;
END;
$$ LANGUAGE plpgsql;
