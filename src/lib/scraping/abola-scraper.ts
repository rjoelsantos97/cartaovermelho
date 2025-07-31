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
    futebol: 'https://www.abola.pt/rss-articles.xml',
    modalidades: 'https://www.abola.pt/rss-articles.xml',
    internacional: 'https://www.abola.pt/rss-articles.xml'
  },
  selectors: {
    content: [
      '.mx-auto.max-w-\\[620px\\]', // Abola.pt specific content selector
      '[class*="mx-auto"][class*="max-w-"]', // General pattern for max-width containers
      'main p', // Paragraphs within main content
      'article p', // Paragraphs within articles
      'p', // Fallback to any paragraphs
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
      
      // First fetch the RSS content with proper headers and timeout
      const response = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CartaoVermelho/1.0; Sports News Aggregator)',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        },
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const feedContent = await response.text();
      const feed = await this.parser.parseString(feedContent);
      
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
          'User-Agent': 'Mozilla/5.0 (compatible; CartaoVermelho/1.0; Sports News Aggregator)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        signal: AbortSignal.timeout(20000) // 20 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Try multiple content selectors
      let content = '';
      for (const selector of this.config.selectors.content) {
        const contentElements = $(selector);
        if (contentElements.length > 0) {
          let combinedText = '';
          
          // For paragraph selectors, combine multiple paragraphs
          if (selector.includes('p')) {
            contentElements.each((i, el) => {
              const $el = $(el);
              
              // Skip elements that are likely not article content
              const text = $el.text().trim();
              if (text.length > 50 && !text.includes('©') && !text.includes('Tags:') && !text.includes('Facebook')) {
                combinedText += text + ' ';
              }
            });
          } else {
            // For container selectors, extract all text
            const contentElement = contentElements.first();
            
            // Remove unwanted elements before extracting text
            contentElement.find('script, style, .ad, .advertisement, .social-share, .related-articles, .tags, nav, footer, header').remove();
            
            combinedText = contentElement.text();
          }
          
          // Clean the extracted text
          const cleanText = combinedText
            .trim()
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\n\s*\n/g, '\n') // Remove empty lines
            .replace(/^\s+|\s+$/gm, ''); // Trim each line
          
          if (cleanText.length > content.length) {
            content = cleanText;
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

      // Extract image URL with multiple strategies - prioritized for abola.pt
      let imageUrl = '';
      
      // Strategy 1: Abola.pt specific - Look for <source> elements with sportal365images.com in srcset
      const sportalSources = $('source[srcset*="sportal365images.com"]');
      console.log(`Found ${sportalSources.length} source elements with sportal365images.com`);
      
      if (sportalSources.length > 0) {
        let mainArticleImage = '';
        let largestImage = '';
        let firstImage = '';
        
        sportalSources.each((i, element) => {
          const $source = $(element);
          const srcset = $source.attr('srcset') || '';
          const type = $source.attr('type') || '';
          console.log(`Source ${i + 1}: type="${type}", srcset="${srcset.substring(0, 100)}..."`);
          
          if (srcset) {
            const extractedUrl = srcset.split(' ')[0].replace(/&amp;/g, '&');
            if (extractedUrl.includes('sportal365images.com')) {
              
              // Store first image as fallback
              if (!firstImage) {
                firstImage = extractedUrl;
              }
              
              // Look for larger images (main article images are usually 770px wide)
              if (extractedUrl.includes('fit(770:)') || extractedUrl.includes('fit(:770)')) {
                if (!largestImage) {
                  largestImage = extractedUrl;
                  console.log(`Found large image (770px): ${extractedUrl.substring(0, 100)}...`);
                }
              }
              
              // Look for images within main content area
              const parentElement = $source.closest('article, .article, main, [class*="content"]');
              if (parentElement.length > 0 && !mainArticleImage) {
                mainArticleImage = extractedUrl;
                console.log(`Found main article image: ${extractedUrl.substring(0, 100)}...`);
              }
            }
          }
        });
        
        // Priority: largest image > main article image > first image
        imageUrl = largestImage || mainArticleImage || firstImage;
        if (imageUrl) {
          console.log('Selected sportal365images.com URL strategy:', largestImage ? 'largest' : mainArticleImage ? 'main article' : 'first');
          console.log('Final selected URL:', imageUrl);
        }
      }
      
      // Strategy 2: Look for <img> with sportal365images.com in src (fallback)
      if (!imageUrl) {
        const sportalImg = $('img[src*="sportal365images.com"]').first();
        if (sportalImg.length > 0) {
          imageUrl = sportalImg.attr('src') || '';
          console.log('Found sportal365images.com in img src:', imageUrl);
        }
      }
      
      // Strategy 3: Look for images with Tailwind classes and check their srcset too
      if (!imageUrl) {
        const tailwindImg = $('img.w-full, img[class*="object-cover"], img[class*="object-top"]').first();
        if (tailwindImg.length > 0) {
          // First try srcset
          const srcset = tailwindImg.attr('srcset');
          if (srcset) {
            imageUrl = srcset.split(' ')[0].replace(/&amp;/g, '&');
            console.log('Found Tailwind-styled image with srcset:', imageUrl);
          } else {
            // Fallback to src
            imageUrl = tailwindImg.attr('src') || '';
            console.log('Found Tailwind-styled image with src:', imageUrl);
          }
        }
      }
      
      // Strategy 4: Look for ANY source element with srcset (broader search)
      if (!imageUrl) {
        const allSources = $('source[srcset]');
        console.log(`Found ${allSources.length} total source elements with srcset`);
        
        if (allSources.length > 0) {
          let mainArticleImage = '';
          let largestImage = '';
          let firstImage = '';
          
          allSources.each((i, element) => {
            const $source = $(element);
            const srcset = $source.attr('srcset') || '';
            const type = $source.attr('type') || '';
            console.log(`All sources ${i + 1}: type="${type}", srcset="${srcset.substring(0, 100)}..."`);
            
            if (srcset) {
              const extractedUrl = srcset.split(' ')[0].replace(/&amp;/g, '&');
              // Accept any reasonable image URL
              if (extractedUrl.match(/\.(jpeg|jpg|png|webp)/i) || extractedUrl.includes('sportal365images.com')) {
                
                // Store first valid image as fallback
                if (!firstImage) {
                  firstImage = extractedUrl;
                }
                
                // Look for larger images (main article images)
                if (extractedUrl.includes('fit(770:)') || extractedUrl.includes('fit(:770)') || 
                    extractedUrl.includes('fit(1200:)') || extractedUrl.includes('fit(:1200)')) {
                  if (!largestImage) {
                    largestImage = extractedUrl;
                    console.log(`Found large image: ${extractedUrl.substring(0, 100)}...`);
                  }
                }
                
                // Look for images within main content area
                const parentElement = $source.closest('article, .article, main, [class*="content"]');
                if (parentElement.length > 0 && !mainArticleImage) {
                  mainArticleImage = extractedUrl;
                  console.log(`Found main article image: ${extractedUrl.substring(0, 100)}...`);
                }
              }
            }
          });
          
          // Priority: largest image > main article image > first image
          imageUrl = largestImage || mainArticleImage || firstImage;
          if (imageUrl) {
            console.log('Selected general source URL strategy:', largestImage ? 'largest' : mainArticleImage ? 'main article' : 'first');
          }
        }
      }
      
      // Strategy 5: Look for picture > img (modern responsive images fallback)
      if (!imageUrl) {
        const pictureImg = $('picture img').first();
        if (pictureImg.length > 0) {
          const srcset = pictureImg.attr('srcset');
          if (srcset) {
            imageUrl = srcset.split(' ')[0].replace(/&amp;/g, '&');
            console.log('Found picture > img srcset:', imageUrl);
          } else {
            imageUrl = pictureImg.attr('src') || '';
            console.log('Found picture > img src:', imageUrl);
          }
        }
      }
      
      // Strategy 6: Look for main article content images (check srcset first)
      if (!imageUrl) {
        const articleImg = $('article img, .article img, .content img, [class*="content"] img, main img').first();
        if (articleImg.length > 0) {
          const srcset = articleImg.attr('srcset');
          if (srcset) {
            imageUrl = srcset.split(' ')[0].replace(/&amp;/g, '&');
            console.log('Found article content image srcset:', imageUrl);
          } else {
            imageUrl = articleImg.attr('src') || '';
            console.log('Found article content image src:', imageUrl);
          }
        }
      }
      
      // Strategy 7: Look for any large image (likely main article image)
      if (!imageUrl) {
        const largeImg = $('img').filter(function() {
          const $img = $(this);
          const src = $img.attr('src') || '';
          const srcset = $img.attr('srcset') || '';
          const alt = $img.attr('alt') || '';
          const className = $img.attr('class') || '';
          
          // Skip small images, icons, logos, social media images
          const isSmallImage = className.includes('icon') || 
                              className.includes('logo') || 
                              className.includes('social') ||
                              alt.toLowerCase().includes('logo') ||
                              alt.toLowerCase().includes('icon') ||
                              src.includes('logo') ||
                              src.includes('icon') ||
                              src.includes('social');
                              
          return !isSmallImage && (src.length > 10 || srcset.length > 10);
        }).first();
        
        if (largeImg.length > 0) {
          const srcset = largeImg.attr('srcset');
          if (srcset) {
            imageUrl = srcset.split(' ')[0].replace(/&amp;/g, '&');
            console.log('Found large image with srcset:', imageUrl);
          } else {
            imageUrl = largeImg.attr('src') || '';
            console.log('Found large image with src:', imageUrl);
          }
        }
      }
      
      // Strategy 8: Look for og:image meta tag as final fallback
      if (!imageUrl) {
        const ogImage = $('meta[property="og:image"]').attr('content');
        if (ogImage) {
          imageUrl = ogImage;
          console.log('Found og:image:', imageUrl);
        }
      }
      
      // Clean and validate image URL
      if (imageUrl) {
        console.log('Processing image URL:', imageUrl);
        
        // Ensure absolute URL
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = this.config.baseUrl + imageUrl;
        }
        
        // Don't remove format=webp from sportal365images.com URLs as they might be needed
        // Only clean other URLs that might have problematic parameters
        if (!imageUrl.includes('sportal365images.com') && imageUrl.includes('&format=webp')) {
          imageUrl = imageUrl.split('&format=webp')[0];
        }
        
        // Validate it's actually an image URL - be more permissive for known image domains
        const isValidImageUrl = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(imageUrl) || 
                               imageUrl.includes('sportal365images.com') ||
                               imageUrl.includes('abola.pt') ||
                               imageUrl.includes('process/smp-images') || // Specific sportal365 pattern
                               imageUrl.match(/\/([\w\-]+)\.jpeg\?/) || // JPEG with query params pattern
                               imageUrl.match(/operations=fit\(\d+:\)/); // Sportal365 specific pattern
        
        if (!isValidImageUrl) {
          console.log('Invalid image URL, discarding:', imageUrl);
          imageUrl = '';
        } else {
          console.log('Valid image URL found:', imageUrl);
        }
      }

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
        author: author || undefined,
        imageUrl: imageUrl || undefined
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
      // Test RSS feed connection with a GET request instead of HEAD
      const testFeed = this.config.rssFeeds.futebol;
      const response = await fetch(testFeed, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CartaoVermelho/1.0; Sports News Aggregator)',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        console.warn(`RSS feed returned ${response.status}: ${response.statusText}`);
        return false;
      }
      
      // Try to parse a small portion to verify it's valid RSS
      const text = await response.text();
      if (!text.includes('<rss') && !text.includes('<feed')) {
        console.warn('Response does not appear to be valid RSS/XML');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async testImageExtraction(url: string): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    try {
      console.log(`Testing image extraction for: ${url}`);
      const result = await this.scrapeFullArticle(url);
      
      if (result.imageUrl) {
        return { 
          success: true, 
          imageUrl: result.imageUrl 
        };
      } else {
        return { 
          success: false, 
          error: 'No image found in article' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}