import { NextResponse } from 'next/server';
import { ScrapingService } from '@/lib/scraping/scraping-service';

export async function GET() {
  try {
    console.log('🚀 Iniciando teste de scraping via API...');
    
    const scrapingService = new ScrapingService();
    
    // Test basic scraping
    const testResult = await scrapingService.testScraping();
    
    if (!testResult.success) {
      return NextResponse.json({
        success: false,
        error: testResult.error
      }, { status: 500 });
    }
    
    // Run a small scraping job
    console.log('📰 Executando job de scraping...');
    const job = await scrapingService.runScrapingJob();
    
    // Get recent articles
    const recentArticles = await scrapingService.getRecentArticles(5);
    
    return NextResponse.json({
      success: true,
      testResult,
      job: {
        id: job.id,
        status: job.status,
        articlesScraped: job.articlesScraped,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        error: job.error
      },
      recentArticles: recentArticles.map(article => ({
        id: article.id,
        title: article.title,
        category: article.category,
        scrapedAt: article.scraped_at,
        hasImage: !!article.image_url,
        hasAuthor: !!article.author,
        contentLength: article.content.length
      }))
    });
    
  } catch (error) {
    console.error('❌ Erro no teste de scraping:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}