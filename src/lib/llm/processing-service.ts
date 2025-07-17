import { createClient } from '@supabase/supabase-js';
import { OpenRouterClient, type ProcessingResult, type ArticleToProcess } from './openrouter-client';

export interface ProcessingJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  articlesProcessed: number;
  error?: string;
  originalArticleId: string;
}

export interface ProcessedArticle {
  id: string;
  original_article_id: string;
  dramatic_title: string;
  dramatic_excerpt: string;
  dramatic_content: string;
  drama_score: number;
  urgency_level: string;
  category: string;
  tags: string[];
  processed_at: string;
  processing_notes?: string;
  is_published: boolean;
}

export class ProcessingService {
  private supabase;
  private llmClient: OpenRouterClient;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.llmClient = new OpenRouterClient();
  }

  async processArticle(articleId: string): Promise<ProcessedArticle> {
    try {
      // Get original article
      const { data: originalArticle, error: fetchError } = await this.supabase
        .from('original_articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (fetchError || !originalArticle) {
        throw new Error(`Article not found: ${articleId}`);
      }

      // Check if already processed
      const { data: existing } = await this.supabase
        .from('processed_articles')
        .select('id')
        .eq('original_article_id', articleId)
        .single();

      if (existing) {
        throw new Error('Article already processed');
      }

      // Prepare article for processing
      const articleToProcess: ArticleToProcess = {
        id: originalArticle.id,
        title: originalArticle.title,
        excerpt: originalArticle.excerpt || '',
        content: originalArticle.content || '',
        category: originalArticle.category,
        publishedAt: originalArticle.published_at
      };

      // Process with LLM
      console.log(`Processing article: ${originalArticle.title}`);
      const result = await this.llmClient.processArticle(articleToProcess);

      // Save processed article
      const processedArticle = {
        original_article_id: articleId,
        title: result.dramaticTitle,
        content: result.dramaticContent,
        dramatic_content: result.dramaticContent,
        excerpt: result.dramaticExcerpt, // Add the excerpt field
        drama_score: result.dramaScore,
        urgency_level: result.urgencyLevel,
        category: result.category,
        tags: result.tags,
        processed_at: new Date().toISOString(),
        is_published: false // Default to not published
      };

      const { data: saved, error: saveError } = await this.supabase
        .from('processed_articles')
        .insert(processedArticle)
        .select()
        .single();

      if (saveError) {
        throw new Error(`Failed to save processed article: ${saveError.message}`);
      }

      console.log(`Successfully processed article: ${result.dramaticTitle}`);
      return saved;
    } catch (error) {
      console.error('Error processing article:', error);
      throw error;
    }
  }

  async processAllPendingArticles(): Promise<ProcessingJob> {
    const jobId = crypto.randomUUID();
    const startedAt = new Date().toISOString();
    
    const job: ProcessingJob = {
      id: jobId,
      status: 'running',
      startedAt,
      articlesProcessed: 0,
      originalArticleId: 'batch'
    };

    try {
      // Save job to database
      await this.saveJob(job);

      // Get unprocessed articles
      const { data: unprocessedArticles, error } = await this.supabase
        .from('original_articles')
        .select(`
          id,
          title,
          processed_articles!left(id)
        `)
        .is('processed_articles.id', null)
        .order('created_at', { ascending: false })
        .limit(10); // Process max 10 at a time to avoid rate limits

      if (error) {
        throw new Error(`Failed to fetch unprocessed articles: ${error.message}`);
      }

      if (!unprocessedArticles || unprocessedArticles.length === 0) {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
        job.articlesProcessed = 0;
        await this.updateJob(job);
        return job;
      }

      console.log(`Found ${unprocessedArticles.length} articles to process`);

      // Process each article with delay
      let processed = 0;
      for (const article of unprocessedArticles) {
        try {
          await this.processArticle(article.id);
          processed++;
          console.log(`Processed ${processed}/${unprocessedArticles.length} articles`);
          
          // Add delay between articles to respect rate limits
          if (processed < unprocessedArticles.length) {
            console.log('Waiting 3 seconds before next article...');
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          console.warn(`Failed to process article ${article.id}:`, error);
          // Continue with other articles
        }
      }

      // Update job status
      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      job.articlesProcessed = processed;
      
      await this.updateJob(job);
      console.log(`Batch processing completed: ${processed} articles processed`);
      
      return job;
    } catch (error) {
      console.error('Batch processing failed:', error);
      
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date().toISOString();
      
      await this.updateJob(job);
      throw error;
    }
  }

  private async saveJob(job: ProcessingJob): Promise<void> {
    const { error } = await this.supabase
      .from('async_jobs')
      .insert({
        id: job.id,
        job_type: 'processing',
        status: job.status,
        started_at: job.startedAt,
        completed_at: job.completedAt,
        result: {
          articlesProcessed: job.articlesProcessed,
          originalArticleId: job.originalArticleId,
          error: job.error
        },
        payload: { type: 'llm_processing' }
      });

    if (error) {
      console.error('Error saving processing job:', error);
      throw error;
    }
  }

  private async updateJob(job: ProcessingJob): Promise<void> {
    const { error } = await this.supabase
      .from('async_jobs')
      .update({
        status: job.status,
        completed_at: job.completedAt,
        result: {
          articlesProcessed: job.articlesProcessed,
          originalArticleId: job.originalArticleId,
          error: job.error
        }
      })
      .eq('id', job.id);

    if (error) {
      console.error('Error updating processing job:', error);
    }
  }

  async getProcessedArticles(limit: number = 10): Promise<ProcessedArticle[]> {
    const { data, error } = await this.supabase
      .from('processed_articles')
      .select(`
        *,
        original_articles (
          title,
          url,
          published_at,
          image_url,
          author
        )
      `)
      .order('processed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching processed articles:', error);
      return [];
    }

    return data || [];
  }

  async getTotalProcessedArticlesCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('processed_articles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error counting processed articles:', error);
      return 0;
    }

    return count || 0;
  }

  async getTotalPublishedArticlesCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('processed_articles')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    if (error) {
      console.error('Error counting published articles:', error);
      return 0;
    }

    return count || 0;
  }

  async getProcessingJobs(limit: number = 10): Promise<ProcessingJob[]> {
    const { data, error } = await this.supabase
      .from('async_jobs')
      .select('*')
      .eq('job_type', 'processing')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching processing jobs:', error);
      return [];
    }

    return (data || []).map(job => ({
      id: job.id,
      status: job.status,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      articlesProcessed: job.result?.articlesProcessed || 0,
      originalArticleId: job.result?.originalArticleId || '',
      error: job.result?.error
    }));
  }

  async testProcessing(): Promise<{ success: boolean; error?: string }> {
    try {
      // Test LLM connection
      const isConnected = await this.llmClient.testConnection();
      if (!isConnected) {
        return { success: false, error: 'Cannot connect to OpenRouter' };
      }

      // Get model info
      const modelInfo = await this.llmClient.getModelInfo();
      console.log('LLM Model Info:', modelInfo);

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async publishArticle(processedArticleId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('processed_articles')
        .update({ is_published: true })
        .eq('id', processedArticleId);

      if (error) {
        console.error('Error publishing article:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error publishing article:', error);
      return false;
    }
  }

  async unpublishArticle(processedArticleId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('processed_articles')
        .update({ is_published: false })
        .eq('id', processedArticleId);

      if (error) {
        console.error('Error unpublishing article:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error unpublishing article:', error);
      return false;
    }
  }

  async runFullPipeline(): Promise<{
    success: boolean;
    scrapingJob?: any;
    processingJob?: ProcessingJob;
    publishedCount?: number;
    error?: string;
  }> {
    try {
      console.log('🚀 Iniciando pipeline completo: Scraping + LLM...');
      
      // Import ScrapingService dynamically to avoid circular dependencies
      const { ScrapingService } = await import('@/lib/scraping/scraping-service');
      const scrapingService = new ScrapingService();
      
      // Step 1: Run scraping job
      console.log('📰 Passo 1: Executando scraping...');
      const scrapingJob = await scrapingService.runScrapingJob();
      
      if (scrapingJob.status !== 'completed' || scrapingJob.articlesScraped === 0) {
        return {
          success: false,
          error: `Scraping falhou: ${scrapingJob.error || 'Nenhum artigo encontrado'}`,
          scrapingJob
        };
      }
      
      console.log(`✅ Scraping concluído: ${scrapingJob.articlesScraped} artigos`);
      
      // Step 2: Process articles with LLM
      console.log('🤖 Passo 2: Processando artigos com LLM...');
      const processingJob = await this.processAllPendingArticles();
      
      if (processingJob.status !== 'completed') {
        return {
          success: false,
          error: `Processamento LLM falhou: ${processingJob.error || 'Erro desconhecido'}`,
          scrapingJob,
          processingJob
        };
      }
      
      console.log(`✅ Processamento concluído: ${processingJob.articlesProcessed} artigos`);
      
      // Step 3: Auto-publish articles
      console.log('📢 Passo 3: Publicando artigos...');
      const processedArticles = await this.getProcessedArticles(10);
      
      let publishedCount = 0;
      for (const article of processedArticles) {
        if (!article.is_published) {
          const published = await this.publishArticle(article.id);
          if (published) publishedCount++;
        }
      }
      
      console.log(`✅ Pipeline completo: ${publishedCount} artigos publicados`);
      
      return {
        success: true,
        scrapingJob,
        processingJob,
        publishedCount
      };
      
    } catch (error) {
      console.error('❌ Erro no pipeline:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido no pipeline'
      };
    }
  }
}

// Export singleton instance
export const processingService = new ProcessingService();