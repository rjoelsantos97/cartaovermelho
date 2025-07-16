-- Supabase Cloud Database Setup
-- Execute este script no SQL Editor do Supabase Cloud
-- https://nuorgwshhsmrtjirnohv.supabase.co

-- 1. Create original_articles table
CREATE TABLE IF NOT EXISTS original_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT NOT NULL DEFAULT 'Geral',
    published_at TIMESTAMP WITH TIME ZONE,
    url TEXT UNIQUE,
    image_url TEXT,
    author TEXT,
    source TEXT DEFAULT 'abola.pt',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create processed_articles table
CREATE TABLE IF NOT EXISTS processed_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_article_id UUID REFERENCES original_articles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    urgency_level TEXT DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'breaking')),
    dramatic_elements JSONB,
    published_at TIMESTAMP WITH TIME ZONE,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create scraping_config table
CREATE TABLE IF NOT EXISTS scraping_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source TEXT NOT NULL DEFAULT 'abola.pt',
    base_url TEXT NOT NULL,
    selectors JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    interval_minutes INTEGER DEFAULT 60,
    max_articles INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create async_jobs table
CREATE TABLE IF NOT EXISTS async_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    payload JSONB,
    result JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Insert default scraping config
INSERT INTO scraping_config (source, base_url, selectors, max_articles) 
VALUES (
    'abola.pt',
    'https://www.abola.pt',
    '{"article": ".article-item", "title": ".article-title", "link": ".article-link", "category": ".article-category"}',
    10
) ON CONFLICT DO NOTHING;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_original_articles_category ON original_articles(category);
CREATE INDEX IF NOT EXISTS idx_original_articles_created_at ON original_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_processed_articles_published ON processed_articles(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_async_jobs_status ON async_jobs(status, created_at DESC);

-- 7. Set up Row Level Security (RLS)
ALTER TABLE original_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE async_jobs ENABLE ROW LEVEL SECURITY;

-- 8. Create policies for public read access (anon role)
CREATE POLICY "Public can read published articles" ON processed_articles
    FOR SELECT USING (is_published = true);

CREATE POLICY "Public can read original articles" ON original_articles
    FOR SELECT USING (true);

-- 9. Create policies for authenticated users (full access)
CREATE POLICY "Authenticated users can do everything on original_articles" ON original_articles
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can do everything on processed_articles" ON processed_articles
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read scraping_config" ON scraping_config
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage async_jobs" ON async_jobs
    FOR ALL USING (auth.role() = 'authenticated');

-- 10. Grant permissions to service_role (for API operations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 11. Create a function to get recent articles
CREATE OR REPLACE FUNCTION get_recent_articles(article_limit integer DEFAULT 10)
RETURNS SETOF processed_articles AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM processed_articles 
    WHERE is_published = true 
    ORDER BY created_at DESC 
    LIMIT article_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
SELECT 'Database setup completed successfully!' as message;