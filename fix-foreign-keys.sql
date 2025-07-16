-- Fix foreign key relationships and refresh schema cache
-- Run this in Supabase Studio SQL Editor AFTER creating tables

-- Check if tables exist
SELECT 'original_articles' as table_name, COUNT(*) as exists FROM information_schema.tables WHERE table_name = 'original_articles' AND table_schema = 'public'
UNION ALL
SELECT 'processed_articles' as table_name, COUNT(*) as exists FROM information_schema.tables WHERE table_name = 'processed_articles' AND table_schema = 'public'
UNION ALL
SELECT 'scraping_config' as table_name, COUNT(*) as exists FROM information_schema.tables WHERE table_name = 'scraping_config' AND table_schema = 'public'
UNION ALL
SELECT 'async_jobs' as table_name, COUNT(*) as exists FROM information_schema.tables WHERE table_name = 'async_jobs' AND table_schema = 'public';

-- Check existing foreign keys
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='processed_articles';

-- Drop and recreate foreign key if it exists
ALTER TABLE processed_articles DROP CONSTRAINT IF EXISTS processed_articles_original_article_id_fkey;

-- Recreate the foreign key constraint
ALTER TABLE processed_articles 
ADD CONSTRAINT processed_articles_original_article_id_fkey 
FOREIGN KEY (original_article_id) 
REFERENCES original_articles(id) 
ON DELETE CASCADE;

-- Refresh PostgREST schema cache by notifying it
NOTIFY pgrst, 'reload schema';

-- Grant permissions to make sure PostgREST can see the relationships
GRANT SELECT ON original_articles TO anon;
GRANT SELECT ON processed_articles TO anon;
GRANT ALL ON original_articles TO authenticated;
GRANT ALL ON processed_articles TO authenticated;
GRANT ALL ON original_articles TO service_role;
GRANT ALL ON processed_articles TO service_role;

-- Additional check to verify the foreign key was created
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='processed_articles';