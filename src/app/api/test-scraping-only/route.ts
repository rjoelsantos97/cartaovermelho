import { NextResponse } from 'next/server';
import { ScrapingService } from '@/lib/scraping/scraping-service';

export async function POST() {
  try {
    console.log('🚀 Testando apenas o scraping...');
    
    const scrapingService = new ScrapingService();
    
    // Test basic scraping
    const testResult = await scrapingService.testScraping();
    
    if (!testResult.success) {
      return NextResponse.json({
        success: false,
        error: testResult.error
      }, { status: 500 });
    }
    
    // Run scraping job
    console.log('📰 Executando scraping...');
    const scrapingJob = await scrapingService.runScrapingJob();
    
    // Get recent articles
    const recentArticles = await scrapingService.getRecentArticles(5);
    
    return NextResponse.json({
      success: true,
      scrapingJob: {
        id: scrapingJob.id,
        status: scrapingJob.status,
        articlesScraped: scrapingJob.articlesScraped,
        startedAt: scrapingJob.startedAt,
        completedAt: scrapingJob.completedAt,
        error: scrapingJob.error
      },
      recentArticles: recentArticles.map(article => ({
        id: article.id,
        title: article.title,
        category: article.category,
        url: article.source_url || article.url,
        scrapedAt: article.scraped_at,
        hasImage: !!article.image_url,
        hasAuthor: !!article.author,
        contentLength: article.content.length
      }))
    });
    
  } catch (error) {
    console.error('❌ Erro no scraping:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido no scraping'
    }, { status: 500 });
  }
}