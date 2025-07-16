-- Create database tables for Cartão Vermelho
-- Run this in Supabase Studio SQL Editor (without service_role dependencies)

-- Create original_articles table
CREATE TABLE IF NOT EXISTS original_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'abola.pt',
    author TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    category TEXT,
    tags TEXT[],
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create processed_articles table
CREATE TABLE IF NOT EXISTS processed_articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_article_id UUID REFERENCES original_articles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    dramatic_content TEXT NOT NULL,
    excerpt TEXT,
    urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'breaking')) DEFAULT 'medium',
    drama_score INTEGER CHECK (drama_score >= 1 AND drama_score <= 10) DEFAULT 5,
    category TEXT NOT NULL,
    tags TEXT[],
    image_url TEXT,
    processed_by TEXT DEFAULT 'openrouter',
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_published BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scraping_config table
CREATE TABLE IF NOT EXISTS scraping_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source TEXT NOT NULL UNIQUE,
    base_url TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    scrape_interval INTEGER DEFAULT 3600,
    last_scrape TIMESTAMP WITH TIME ZONE,
    next_scrape TIMESTAMP WITH TIME ZONE,
    max_articles INTEGER DEFAULT 50,
    selectors JSONB,
    headers JSONB,
    rate_limit INTEGER DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create async_jobs table
CREATE TABLE IF NOT EXISTS async_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_type TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed', 'retrying')) DEFAULT 'pending',
    payload JSONB,
    result JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_original_articles_url ON original_articles(url);
CREATE INDEX IF NOT EXISTS idx_original_articles_scraped_at ON original_articles(scraped_at);
CREATE INDEX IF NOT EXISTS idx_original_articles_category ON original_articles(category);

CREATE INDEX IF NOT EXISTS idx_processed_articles_original_id ON processed_articles(original_article_id);
CREATE INDEX IF NOT EXISTS idx_processed_articles_category ON processed_articles(category);
CREATE INDEX IF NOT EXISTS idx_processed_articles_urgency ON processed_articles(urgency_level);
CREATE INDEX IF NOT EXISTS idx_processed_articles_published ON processed_articles(is_published);
CREATE INDEX IF NOT EXISTS idx_processed_articles_processed_at ON processed_articles(processed_at);

CREATE INDEX IF NOT EXISTS idx_scraping_config_source ON scraping_config(source);
CREATE INDEX IF NOT EXISTS idx_scraping_config_enabled ON scraping_config(is_enabled);

CREATE INDEX IF NOT EXISTS idx_async_jobs_status ON async_jobs(status);
CREATE INDEX IF NOT EXISTS idx_async_jobs_type ON async_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_async_jobs_scheduled ON async_jobs(scheduled_for);

-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_original_articles_updated_at ON original_articles;
CREATE TRIGGER update_original_articles_updated_at 
    BEFORE UPDATE ON original_articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_processed_articles_updated_at ON processed_articles;
CREATE TRIGGER update_processed_articles_updated_at 
    BEFORE UPDATE ON processed_articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_scraping_config_updated_at ON scraping_config;
CREATE TRIGGER update_scraping_config_updated_at 
    BEFORE UPDATE ON scraping_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_async_jobs_updated_at ON async_jobs;
CREATE TRIGGER update_async_jobs_updated_at 
    BEFORE UPDATE ON async_jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default scraping configuration
INSERT INTO scraping_config (source, base_url, selectors) 
VALUES (
    'abola.pt',
    'https://www.abola.pt',
    '{
        "articles": ".article-item",
        "title": ".article-title",
        "link": ".article-link",
        "summary": ".article-summary",
        "image": ".article-image img",
        "category": ".article-category",
        "date": ".article-date"
    }'::jsonb
) ON CONFLICT (source) DO NOTHING;

-- Add comment
COMMENT ON COLUMN processed_articles.excerpt IS 'Dramatic excerpt/subtitle for the article, generated by LLM';

-- Disable RLS for now (since we don't have proper roles setup)
ALTER TABLE original_articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE processed_articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE async_jobs DISABLE ROW LEVEL SECURITY;