-- Adicionar colunas em falta à tabela processed_articles
-- Execute no SQL Editor do Supabase Cloud

ALTER TABLE processed_articles 
ADD COLUMN IF NOT EXISTS drama_score INTEGER DEFAULT 5 CHECK (drama_score >= 1 AND drama_score <= 10);

ALTER TABLE processed_articles 
ADD COLUMN IF NOT EXISTS dramatic_content TEXT;

ALTER TABLE processed_articles 
ADD COLUMN IF NOT EXISTS dramatic_excerpt TEXT;

ALTER TABLE processed_articles 
ADD COLUMN IF NOT EXISTS excerpt TEXT;

ALTER TABLE processed_articles 
ADD COLUMN IF NOT EXISTS tags JSONB;

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_processed_articles_drama_score ON processed_articles(drama_score);

-- Verificar a estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'processed_articles' 
ORDER BY ordinal_position;

SELECT 'Drama score column added successfully!' as message;