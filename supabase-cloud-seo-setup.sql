-- Supabase Cloud SEO Setup Script
-- Execute este script no SQL Editor do Supabase Cloud
-- https://nuorgwshhsmrtjirnohv.supabase.co

-- ========================================
-- SEO ENHANCEMENTS FOR CARTÃO VERMELHO NEWS
-- ========================================

-- 1. Add excerpt field to processed_articles table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'processed_articles' AND column_name = 'excerpt') THEN
        ALTER TABLE processed_articles ADD COLUMN excerpt TEXT;
        COMMENT ON COLUMN processed_articles.excerpt IS 'Dramatic excerpt/subtitle for the article, generated by LLM';
    END IF;
END $$;

-- 2. Add slug field to processed_articles table for SEO-friendly URLs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'processed_articles' AND column_name = 'slug') THEN
        ALTER TABLE processed_articles ADD COLUMN slug VARCHAR(100) UNIQUE;
        COMMENT ON COLUMN processed_articles.slug IS 'SEO-friendly URL slug generated from article title';
    END IF;
END $$;

-- 3. Add drama_score field to processed_articles table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'processed_articles' AND column_name = 'drama_score') THEN
        ALTER TABLE processed_articles ADD COLUMN drama_score INTEGER DEFAULT 5 CHECK (drama_score >= 1 AND drama_score <= 10);
        COMMENT ON COLUMN processed_articles.drama_score IS 'Drama intensity score from 1-10';
    END IF;
END $$;

-- 4. Add dramatic_content field to processed_articles table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'processed_articles' AND column_name = 'dramatic_content') THEN
        ALTER TABLE processed_articles ADD COLUMN dramatic_content TEXT;
        COMMENT ON COLUMN processed_articles.dramatic_content IS 'LLM-generated dramatic version of the article content';
    END IF;
END $$;

-- 5. Add tags field to processed_articles table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'processed_articles' AND column_name = 'tags') THEN
        ALTER TABLE processed_articles ADD COLUMN tags TEXT[] DEFAULT '{}';
        COMMENT ON COLUMN processed_articles.tags IS 'Array of tags for the article';
    END IF;
END $$;

-- 6. Create indexes for better SEO performance
CREATE INDEX IF NOT EXISTS idx_processed_articles_slug ON processed_articles(slug);
CREATE INDEX IF NOT EXISTS idx_processed_articles_published_slug ON processed_articles(is_published, slug) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_processed_articles_category_published ON processed_articles(category, is_published, processed_at DESC) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_processed_articles_tags ON processed_articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_processed_articles_drama_score ON processed_articles(drama_score DESC) WHERE is_published = true;

-- 7. Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title_text TEXT)
RETURNS VARCHAR(100) AS $$
BEGIN
    -- Basic slug generation (more advanced logic will be handled in the app)
    RETURN LOWER(
        TRIM(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(title_text, '[^\w\s-]', ' ', 'g'),
                        'BOMBA TOTAL[:\s]*', '', 'gi'
                    ),
                    '\s+', '-', 'g'
                ),
                '-+', '-', 'g'
            )
        )
    );
END;
$$ LANGUAGE plpgsql;

-- 8. Function to auto-generate slug when title changes (backup mechanism)
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate slug if it's empty and we have a title
    IF NEW.slug IS NULL AND NEW.title IS NOT NULL THEN
        NEW.slug := generate_slug(NEW.title);
        
        -- Ensure uniqueness by appending counter if needed
        WHILE EXISTS (SELECT 1 FROM processed_articles WHERE slug = NEW.slug AND id != NEW.id) LOOP
            NEW.slug := NEW.slug || '-' || floor(random() * 1000)::text;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for auto slug generation
DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON processed_articles;
CREATE TRIGGER trigger_auto_generate_slug
    BEFORE INSERT OR UPDATE ON processed_articles
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_slug();

-- 10. Update existing records with default excerpt (first 300 chars of content)
UPDATE processed_articles
SET excerpt = SUBSTRING(content FROM 1 FOR 300) || '...'
WHERE excerpt IS NULL AND content IS NOT NULL;

-- 11. Generate slugs for existing articles that don't have them
DO $$
DECLARE
    article_record RECORD;
    new_slug TEXT;
    counter INTEGER := 1;
BEGIN
    FOR article_record IN 
        SELECT id, title FROM processed_articles 
        WHERE slug IS NULL AND title IS NOT NULL
    LOOP
        new_slug := generate_slug(article_record.title);
        
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM processed_articles WHERE slug = new_slug) LOOP
            new_slug := generate_slug(article_record.title) || '-' || counter;
            counter := counter + 1;
        END LOOP;
        
        -- Update the article with the new slug
        UPDATE processed_articles 
        SET slug = new_slug 
        WHERE id = article_record.id;
        
        counter := 1; -- Reset counter for next article
    END LOOP;
END $$;

-- 12. Function to get articles by category with SEO data
CREATE OR REPLACE FUNCTION get_articles_by_category(
    category_name TEXT,
    article_limit INTEGER DEFAULT 10,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    excerpt TEXT,
    slug VARCHAR(100),
    drama_score INTEGER,
    urgency_level TEXT,
    category TEXT,
    tags TEXT[],
    processed_at TIMESTAMP WITH TIME ZONE,
    image_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pa.id,
        pa.title,
        pa.excerpt,
        pa.slug,
        pa.drama_score,
        pa.urgency_level,
        pa.category,
        pa.tags,
        pa.processed_at,
        oa.image_url
    FROM processed_articles pa
    LEFT JOIN original_articles oa ON pa.original_article_id = oa.id
    WHERE pa.is_published = true 
    AND (category_name IS NULL OR pa.category = category_name)
    ORDER BY pa.processed_at DESC
    LIMIT article_limit
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Function to get article by slug or ID
CREATE OR REPLACE FUNCTION get_article_by_slug_or_id(slug_or_id TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    dramatic_content TEXT,
    excerpt TEXT,
    drama_score INTEGER,
    urgency_level TEXT,
    category TEXT,
    tags TEXT[],
    processed_at TIMESTAMP WITH TIME ZONE,
    is_published BOOLEAN,
    slug VARCHAR(100),
    original_title TEXT,
    original_url TEXT,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    author TEXT,
    source TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pa.id,
        pa.title,
        pa.content,
        pa.dramatic_content,
        pa.excerpt,
        pa.drama_score,
        pa.urgency_level,
        pa.category,
        pa.tags,
        pa.processed_at,
        pa.is_published,
        pa.slug,
        oa.title as original_title,
        oa.url as original_url,
        oa.image_url,
        oa.published_at,
        oa.author,
        oa.source
    FROM processed_articles pa
    LEFT JOIN original_articles oa ON pa.original_article_id = oa.id
    WHERE pa.is_published = true 
    AND (
        pa.slug = slug_or_id OR 
        pa.id::TEXT = slug_or_id
    )
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Function to get sitemap data
CREATE OR REPLACE FUNCTION get_sitemap_data()
RETURNS TABLE (
    slug VARCHAR(100),
    processed_at TIMESTAMP WITH TIME ZONE,
    category TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pa.slug,
        pa.processed_at,
        pa.category
    FROM processed_articles pa
    WHERE pa.is_published = true 
    AND pa.slug IS NOT NULL
    ORDER BY pa.processed_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Function to get categories with article counts
CREATE OR REPLACE FUNCTION get_categories_with_counts()
RETURNS TABLE (
    category TEXT,
    article_count BIGINT,
    latest_article TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pa.category,
        COUNT(*) as article_count,
        MAX(pa.processed_at) as latest_article
    FROM processed_articles pa
    WHERE pa.is_published = true
    AND pa.category IS NOT NULL
    AND pa.category != ''
    GROUP BY pa.category
    ORDER BY article_count DESC, latest_article DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Update RLS policies to include new fields
CREATE POLICY "Public can read published articles with SEO data" ON processed_articles
    FOR SELECT USING (is_published = true);

-- 17. Grant permissions to service_role for new functions
GRANT EXECUTE ON FUNCTION get_articles_by_category(TEXT, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_article_by_slug_or_id(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION get_sitemap_data() TO service_role;
GRANT EXECUTE ON FUNCTION get_categories_with_counts() TO service_role;
GRANT EXECUTE ON FUNCTION generate_slug(TEXT) TO service_role;

-- 18. Create a view for SEO-optimized articles
CREATE OR REPLACE VIEW seo_articles AS
SELECT 
    pa.id,
    pa.title,
    pa.excerpt,
    pa.slug,
    pa.drama_score,
    pa.urgency_level,
    pa.category,
    pa.tags,
    pa.processed_at,
    pa.is_published,
    oa.image_url,
    oa.author,
    oa.published_at as original_published_at,
    oa.source
FROM processed_articles pa
LEFT JOIN original_articles oa ON pa.original_article_id = oa.id
WHERE pa.is_published = true;

-- Grant access to the view
GRANT SELECT ON seo_articles TO anon;
GRANT SELECT ON seo_articles TO authenticated;
GRANT SELECT ON seo_articles TO service_role;

-- 19. Success message with statistics
DO $$
DECLARE
    total_articles INTEGER;
    articles_with_slugs INTEGER;
    articles_with_excerpts INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_articles FROM processed_articles WHERE is_published = true;
    SELECT COUNT(*) INTO articles_with_slugs FROM processed_articles WHERE is_published = true AND slug IS NOT NULL;
    SELECT COUNT(*) INTO articles_with_excerpts FROM processed_articles WHERE is_published = true AND excerpt IS NOT NULL;
    
    RAISE NOTICE '=== SEO SETUP COMPLETED SUCCESSFULLY! ===';
    RAISE NOTICE 'Total published articles: %', total_articles;
    RAISE NOTICE 'Articles with slugs: %', articles_with_slugs;
    RAISE NOTICE 'Articles with excerpts: %', articles_with_excerpts;
    RAISE NOTICE '====================================';
END $$;

-- Final success message
SELECT 'SEO Database setup completed successfully! 🚀' as message,
       'All articles now have SEO-friendly URLs and metadata' as details;