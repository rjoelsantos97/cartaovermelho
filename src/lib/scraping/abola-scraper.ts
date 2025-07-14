import * as cheerio from 'cheerio';
import Parser from 'rss-parser';

export interface ScrapedArticle {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  publishedAt: string;
  sourceUrl: string;
  imageUrl?: string;
  author?: string;
}

export interface ScrapingConfig {
  maxArticles: number;
  categories: string[];
  baseUrl: string;
  rssFeeds: {
    futebol: string;
    modalidades: string;
    internacional: string;
  };
  selectors: {
    content: string[];
    author: string[];
  };
}

const DEFAULT_CONFIG: ScrapingConfig = {
  maxArticles: 10,
  categories: ['futebol'], // Only scrape futebol RSS feed
  baseUrl: 'https://www.abola.pt',
  rssFeeds: {
    futebol: 'https://www.abola.pt/rss/futebol',
    modalidades: 'https://www.abola.pt/rss/modalidades',
    internacional: 'https://www.abola.pt/rss/internacional'
  },
  selectors: {
    content: [
      '[class*="content"]',
      '.article-content',
      '.content',
      '.entry-content',
      '.post-content',
      'article .content',
      '.article-body'
    ],
    author: [
      '.author',
      '.byline',
      '[class*="author"]',
      '.writer'
    ]
  }
};

export class AbolaScraper {
  private config: ScrapingConfig;
  private parser: Parser;

  constructor(config?: Partial<ScrapingConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.parser = new Parser({
      customFields: {
        item: ['enclosure']
      }
    });
  }

  async scrapeArticles(): Promise<ScrapedArticle[]> {
    try {
      const articles: ScrapedArticle[] = [];
      
      // Scrape from RSS feeds
      for (const category of this.config.categories) {
        if (articles.length >= this.config.maxArticles) break;
        
        const categoryArticles = await this.scrapeRSSFeed(category);
        articles.push(...categoryArticles);
      }

      // Sort articles by published date (most recent first)
      articles.sort((a, b) => {
        const dateA = new Date(a.publishedAt).getTime();
        const dateB = new Date(b.publishedAt).getTime();
        return dateB - dateA; // Most recent first
      });

      return articles.slice(0, this.config.maxArticles);
    } catch (error) {
      console.error('Error scraping articles:', error);
      throw new Error(`Failed to scrape articles: ${error}`);
    }
  }

  private async scrapeRSSFeed(category: string): Promise<ScrapedArticle[]> {
    try {
      const feedUrl = this.config.rssFeeds[category as keyof typeof this.config.rssFeeds];
      if (!feedUrl) {
        console.warn(`No RSS feed configured for category: ${category}`);
        return [];
      }

      console.log(`Fetching RSS feed for ${category}: ${feedUrl}`);
      const feed = await this.parser.parseURL(feedUrl);
      
      const articles: ScrapedArticle[] = [];
      const maxPerCategory = Math.ceil(this.config.maxArticles / this.config.categories.length);

      for (const item of feed.items.slice(0, maxPerCategory)) {
        try {
          const article: ScrapedArticle = {
            title: item.title || '',
            excerpt: item.contentSnippet || item.content || '',
            content: '', // Will be filled when scraping individual article
            category: this.normalizeCategory(category),
            publishedAt: item.pubDate || new Date().toISOString(),
            sourceUrl: item.link || '',
            imageUrl: item.enclosure?.url || undefined,
            author: item.creator || undefined
          };

          if (article.title && article.sourceUrl) {
            articles.push(article);
          }
        } catch (error) {
          console.warn('Error processing RSS item:', error);
        }
      }

      console.log(`Scraped ${articles.length} articles from ${category} RSS feed`);
      return articles;
    } catch (error) {
      console.error(`Error scraping RSS feed for ${category}:`, error);
      return [];
    }
  }

  async scrapeFullArticle(url: string): Promise<Partial<ScrapedArticle>> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CartaoVermelho/1.0; Sports News Aggregator)'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Try multiple content selectors
      let content = '';
      for (const selector of this.config.selectors.content) {
        const contentElement = $(selector);
        if (contentElement.length > 0) {
          // Remove unwanted elements before extracting text
          contentElement.find('script, style, .ad, .advertisement, .social-share, .related-articles, .tags, nav, footer, header').remove();
          
          // Extract clean text
          const text = contentElement.text()
            .trim()
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\n\s*\n/g, '\n') // Remove empty lines
            .replace(/^\s+|\s+$/gm, ''); // Trim each line
          
          if (text.length > content.length) {
            content = text;
          }
        }
      }
      
      // Additional cleaning: remove CSS/JS content and URLs
      content = content
        .replace(/\{[^}]*\}/g, '') // Remove CSS blocks
        .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
        .replace(/pic\.twitter\.com\/[^\s]+/g, '') // Remove Twitter pic URLs
        .replace(/#\w+/g, '') // Remove hashtags
        .replace(/\b\d{2}:\d{2}\b/g, '') // Remove time stamps
        .replace(/\b\d{2}\.\d{2}\.\d{4}\b/g, '') // Remove dates
        .trim();

      // Try multiple author selectors
      let author = '';
      for (const selector of this.config.selectors.author) {
        const authorElement = $(selector).first();
        if (authorElement.length > 0) {
          author = authorElement.text().trim();
          if (author) break;
        }
      }

      return {
        content: content || '',
        author: author || undefined
      };
    } catch (error) {
      console.error(`Error scraping full article ${url}:`, error);
      return {};
    }
  }

  private normalizeCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      'futebol': 'Futebol',
      'modalidades': 'Outros Desportos', 
      'internacional': 'Internacional'
    };

    return categoryMap[category] || 'Geral';
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test RSS feed connection instead of main page
      const testFeed = this.config.rssFeeds.futebol;
      const response = await fetch(testFeed, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CartaoVermelho/1.0; Sports News Aggregator)'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}