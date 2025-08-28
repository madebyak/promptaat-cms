-- Make subcategory_id nullable in kit_categories table
-- This allows adding prompt kits to categories without requiring a subcategory

-- Drop the foreign key constraint first
ALTER TABLE kit_categories DROP CONSTRAINT IF EXISTS kit_categories_subcategory_id_fkey;

-- Make the column nullable
ALTER TABLE kit_categories ALTER COLUMN subcategory_id DROP NOT NULL;

-- Recreate the foreign key constraint with ON DELETE CASCADE
ALTER TABLE kit_categories 
ADD CONSTRAINT kit_categories_subcategory_id_fkey 
FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE CASCADE;

-- Update the unique constraint to handle NULL values properly
-- Drop the existing unique constraint
ALTER TABLE kit_categories DROP CONSTRAINT IF EXISTS kit_categories_kit_id_category_id_subcategory_id_key;

-- Create a new unique constraint that handles NULLs properly
-- This ensures that we can have multiple NULLs for subcategory_id but still maintain uniqueness
CREATE UNIQUE INDEX kit_categories_unique_with_nulls 
ON kit_categories (kit_id, category_id) 
WHERE subcategory_id IS NULL;

-- Create another unique constraint for non-NULL subcategory_id values
CREATE UNIQUE INDEX kit_categories_unique_with_subcategory 
ON kit_categories (kit_id, category_id, subcategory_id) 
WHERE subcategory_id IS NOT NULL;
