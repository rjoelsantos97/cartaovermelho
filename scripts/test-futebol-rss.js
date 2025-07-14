// Test script for the updated RSS scraper - only futebol feed
import { AbolaScraper } from '../src/lib/scraping/abola-scraper.js';

async function testFutebolRSS() {
  console.log('=== Testing A Bola Futebol RSS Feed ===\n');
  
  const scraper = new AbolaScraper({
    maxArticles: 5, // Get 5 most recent articles
    categories: ['futebol'] // Already set as default
  });

  try {
    // Test connection first
    console.log('Testing connection to RSS feed...');
    const isConnected = await scraper.testConnection();
    console.log('Connection status:', isConnected ? '✅ Connected' : '❌ Failed');
    
    if (!isConnected) {
      console.error('Cannot connect to RSS feed');
      return;
    }

    // Scrape articles
    console.log('\nScraping futebol articles (most recent first)...\n');
    const articles = await scraper.scrapeArticles();
    
    console.log(`Found ${articles.length} articles\n`);
    
    // Display articles in order
    articles.forEach((article, index) => {
      console.log(`--- Article ${index + 1} ---`);
      console.log('Title:', article.title);
      console.log('Category:', article.category);
      console.log('Published:', new Date(article.publishedAt).toLocaleString('pt-PT'));
      console.log('URL:', article.sourceUrl);
      console.log('Has Image:', article.imageUrl ? 'Yes' : 'No');
      console.log('Excerpt:', article.excerpt.substring(0, 100) + '...');
      console.log('');
    });
    
    // Verify ordering
    console.log('=== Verifying Date Order ===');
    let isOrdered = true;
    for (let i = 0; i < articles.length - 1; i++) {
      const currentDate = new Date(articles[i].publishedAt);
      const nextDate = new Date(articles[i + 1].publishedAt);
      
      if (currentDate < nextDate) {
        isOrdered = false;
        console.log(`❌ Order issue: Article ${i + 1} is older than Article ${i + 2}`);
      }
    }
    
    if (isOrdered) {
      console.log('✅ Articles are correctly ordered (most recent first)');
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testFutebolRSS();