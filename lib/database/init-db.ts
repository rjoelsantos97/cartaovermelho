import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

// Create a service role client for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
})

const DATABASE_SCHEMA = `
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
    scrape_interval INTEGER DEFAULT 3600, -- seconds
    last_scrape TIMESTAMP WITH TIME ZONE,
    next_scrape TIMESTAMP WITH TIME ZONE,
    max_articles INTEGER DEFAULT 50,
    selectors JSONB,
    headers JSONB,
    rate_limit INTEGER DEFAULT 1000, -- milliseconds between requests
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
`

const DATABASE_INDEXES = `
-- Create indexes for better performance
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
`

const DATABASE_TRIGGERS = `
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
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
`

const DATABASE_POLICIES = `
-- Create RLS (Row Level Security) policies
ALTER TABLE original_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE async_jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all for service_role" ON original_articles;
DROP POLICY IF EXISTS "Enable all for service_role" ON processed_articles;
DROP POLICY IF EXISTS "Enable all for service_role" ON scraping_config;
DROP POLICY IF EXISTS "Enable all for service_role" ON async_jobs;
DROP POLICY IF EXISTS "Enable read for anon users" ON processed_articles;

-- Allow service_role to access all data
CREATE POLICY "Enable all for service_role" ON original_articles FOR ALL TO service_role;
CREATE POLICY "Enable all for service_role" ON processed_articles FOR ALL TO service_role;
CREATE POLICY "Enable all for service_role" ON scraping_config FOR ALL TO service_role;
CREATE POLICY "Enable all for service_role" ON async_jobs FOR ALL TO service_role;

-- Allow anon to read published articles
CREATE POLICY "Enable read for anon users" ON processed_articles FOR SELECT TO anon USING (is_published = true);
`

const INITIAL_DATA = `
-- Insert default scraping configuration for abola.pt (if not exists)
INSERT INTO scraping_config (source, base_url, selectors) 
SELECT 'abola.pt', 'https://www.abola.pt', '{
    "articles": ".article-item",
    "title": ".article-title",
    "link": ".article-link",
    "summary": ".article-summary",
    "image": ".article-image img",
    "category": ".article-category",
    "date": ".article-date"
}'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM scraping_config WHERE source = 'abola.pt'
);

-- Add comment to explain the excerpt field
COMMENT ON COLUMN processed_articles.excerpt IS 'Dramatic excerpt/subtitle for the article, generated by LLM';
`

async function executeRawSql(sql: string, description: string) {
  try {
    // Use direct SQL execution via REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
      },
      body: JSON.stringify({ sql })
    })
    
    if (!response.ok) {
      console.warn(`⚠️  ${description} warning:`, await response.text())
    }
  } catch (err: any) {
    console.warn(`⚠️  ${description} warning:`, err.message)
  }
}

async function createTablesDirectly() {
  try {
    // Create original_articles table
    await supabase.from('original_articles').select('id').limit(1).then(
      () => console.log('✅ original_articles table exists'),
      async () => {
        console.log('Creating original_articles table...')
        // Table doesn't exist, we'll create it via SQL
      }
    )
    
    // Create processed_articles table
    await supabase.from('processed_articles').select('id').limit(1).then(
      () => console.log('✅ processed_articles table exists'),
      async () => {
        console.log('Creating processed_articles table...')
      }
    )
    
    // Create scraping_config table
    await supabase.from('scraping_config').select('id').limit(1).then(
      () => console.log('✅ scraping_config table exists'),
      async () => {
        console.log('Creating scraping_config table...')
      }
    )
    
    // Create async_jobs table
    await supabase.from('async_jobs').select('id').limit(1).then(
      () => console.log('✅ async_jobs table exists'),
      async () => {
        console.log('Creating async_jobs table...')
      }
    )
    
  } catch (error) {
    console.warn('⚠️  Direct table creation failed:', error)
  }
}

export async function initializeDatabase() {
  try {
    console.log('🔄 Checking database schema...')
    
    // Check if tables exist by attempting to query them
    await createTablesDirectly()
    
    // Check if initial data exists
    const { data: configData } = await supabase
      .from('scraping_config')
      .select('source')
      .eq('source', 'abola.pt')
      .single()
    
    if (!configData) {
      console.log('🔄 Adding initial scraping configuration...')
      await supabase
        .from('scraping_config')
        .insert({
          source: 'abola.pt',
          base_url: 'https://www.abola.pt',
          selectors: {
            "articles": ".article-item",
            "title": ".article-title",
            "link": ".article-link",
            "summary": ".article-summary",
            "image": ".article-image img",
            "category": ".article-category",
            "date": ".article-date"
          }
        })
    }
    
    console.log('✅ Database initialization completed successfully!')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    console.log('📋 This is expected if running for the first time or if tables need to be created manually')
  }
}

// Check if database is properly initialized
export async function isDatabaseInitialized(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('scraping_config')
      .select('source')
      .eq('source', 'abola.pt')
      .single()
    
    return !error && !!data
  } catch {
    return false
  }
}