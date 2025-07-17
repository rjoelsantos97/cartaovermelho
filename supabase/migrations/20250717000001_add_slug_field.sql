-- Add slug field to processed_articles table for SEO-friendly URLs
ALTER TABLE processed_articles 
ADD COLUMN slug VARCHAR(100) UNIQUE;

-- Add index for slug field for better performance
CREATE INDEX idx_processed_articles_slug ON processed_articles(slug);

-- Add index for published articles with slug
CREATE INDEX idx_processed_articles_published_slug ON processed_articles(is_published, slug) WHERE is_published = true;

-- Add comment to explain the field
COMMENT ON COLUMN processed_articles.slug IS 'SEO-friendly URL slug generated from article title';

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title_text TEXT)
RETURNS VARCHAR(100) AS $$
BEGIN
    -- Basic slug generation (more advanced logic will be handled in the app)
    RETURN LOWER(
        TRIM(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(title_text, '[^\w\s-]', ' ', 'g'),
                    '\s+', '-', 'g'
                ),
                '-+', '-', 'g'
            )
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auto-generate slug when title changes (backup mechanism)
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

-- Create trigger for auto slug generation
CREATE TRIGGER trigger_auto_generate_slug
    BEFORE INSERT OR UPDATE ON processed_articles
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_slug();