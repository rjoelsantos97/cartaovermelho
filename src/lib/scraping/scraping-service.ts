import { createClient } from '@supabase/supabase-js';
import { AbolaScraper, type ScrapedArticle } from './abola-scraper';

export interface ScrapingJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  articlesScraped: number;
  error?: string;
  config: any;
}

export interface SavedArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  published_at: string;
  url: string;
  image_url?: string;
  author?: string;
  created_at: string;
  scraped_at: string;
}

export class ScrapingService {
  private supabase;
  private scraper: AbolaScraper;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.scraper = new AbolaScraper();
  }

  async runScrapingJob(): Promise<ScrapingJob> {
    const jobId = crypto.randomUUID();
    const startedAt = new Date().toISOString();
    
    // Create job record
    const job: ScrapingJob = {
      id: jobId,
      status: 'running',
      startedAt,
      articlesScraped: 0,
      config: {
        maxArticles: 10,
        source: 'abola.pt'
      }
    };

    try {
      // Save job to database
      await this.saveJob(job);

      // Test connection first
      const isConnected = await this.scraper.testConnection();
      if (!isConnected) {
        throw new Error('Unable to connect to abola.pt');
      }

      // Scrape articles
      console.log('Starting article scraping...');
      const articles = await this.scraper.scrapeArticles();
      console.log(`Scraped ${articles.length} articles`);

      // Process and save articles
      let savedCount = 0;
      for (const article of articles) {
        try {
          const saved = await this.saveArticle(article);
          if (saved) savedCount++;
        } catch (error) {
          console.warn(`Failed to save article "${article.title}":`, error);
        }
      }

      // Update job status
      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      job.articlesScraped = savedCount;
      
      await this.updateJob(job);
      console.log(`Scraping job completed: ${savedCount} articles saved`);
      
      return job;
    } catch (error) {
      console.error('Scraping job failed:', error);
      
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date().toISOString();
      
      await this.updateJob(job);
      throw error;
    }
  }

  private async saveArticle(article: ScrapedArticle): Promise<boolean> {
    try {
      // Check for duplicates by URL
      const { data: existing } = await this.supabase
        .from('original_articles')
        .select('id')
        .eq('url', article.sourceUrl)
        .single();

      if (existing) {
        console.log(`Article already exists: ${article.title}`);
        return false;
      }

      // Scrape full content if needed
      let fullContent = article.content;
      if (!fullContent && article.sourceUrl) {
        try {
          const fullArticle = await this.scraper.scrapeFullArticle(article.sourceUrl);
          fullContent = fullArticle.content || '';
        } catch (error) {
          console.warn(`Failed to scrape full content for ${article.sourceUrl}:`, error);
        }
      }

      // Save article
      const { error } = await this.supabase
        .from('original_articles')
        .insert({
          title: article.title,
          content: fullContent || article.excerpt,
          category: this.normalizeCategory(article.category),
          published_at: article.publishedAt,
          url: article.sourceUrl,
          image_url: article.imageUrl,
          author: article.author,
          source: 'abola.pt'
        });

      if (error) {
        console.error('Database error saving article:', error);
        return false;
      }

      console.log(`Saved article: ${article.title}`);
      return true;
    } catch (error) {
      console.error('Error saving article:', error);
      return false;
    }
  }

  private async saveJob(job: ScrapingJob): Promise<void> {
    const { error } = await this.supabase
      .from('async_jobs')
      .insert({
        id: job.id,
        job_type: 'scraping',
        status: job.status,
        started_at: job.startedAt,
        completed_at: job.completedAt,
        result: {
          articlesScraped: job.articlesScraped,
          error: job.error
        },
        payload: job.config
      });

    if (error) {
      console.error('Error saving job:', error);
      throw error;
    }
  }

  private async updateJob(job: ScrapingJob): Promise<void> {
    const { error } = await this.supabase
      .from('async_jobs')
      .update({
        status: job.status,
        completed_at: job.completedAt,
        result: {
          articlesScraped: job.articlesScraped,
          error: job.error
        }
      })
      .eq('id', job.id);

    if (error) {
      console.error('Error updating job:', error);
    }
  }

  private normalizeCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      'futebol': 'Futebol',
      'modalidades': 'Outros Desportos', 
      'internacional': 'Internacional',
      'geral': 'Geral'
    };

    const normalized = category.toLowerCase();
    return categoryMap[normalized] || 'Geral';
  }

  async getRecentArticles(limit: number = 10): Promise<SavedArticle[]> {
    const { data, error } = await this.supabase
      .from('original_articles')
      .select('*')
      .order('scraped_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching articles:', error);
      return [];
    }

    return data || [];
  }

  async getScrapingJobs(limit: number = 10): Promise<ScrapingJob[]> {
    const { data, error } = await this.supabase
      .from('async_jobs')
      .select('*')
      .eq('job_type', 'scraping')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }

    return (data || []).map(job => ({
      id: job.id,
      status: job.status,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      articlesScraped: job.result?.articlesScraped || 0,
      error: job.result?.error,
      config: job.payload
    }));
  }

  async testScraping(): Promise<{ success: boolean; articlesFound: number; error?: string }> {
    try {
      const isConnected = await this.scraper.testConnection();
      if (!isConnected) {
        return { success: false, articlesFound: 0, error: 'Cannot connect to abola.pt' };
      }

      const articles = await this.scraper.scrapeArticles();
      return { 
        success: true, 
        articlesFound: articles.length,
        error: undefined 
      };
    } catch (error) {
      return { 
        success: false, 
        articlesFound: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}