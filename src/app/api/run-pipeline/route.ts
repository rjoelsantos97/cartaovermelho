import { NextRequest, NextResponse } from 'next/server';
import { ScrapingService } from '@/lib/scraping/scraping-service';
import { ProcessingService } from '@/lib/llm/processing-service';
import { validateApiAuth, createUnauthorizedResponse } from '@/lib/auth/api-auth';

export async function POST(request: NextRequest) {
  // Validate authentication
  const authResult = await validateApiAuth(request);
  
  if (!authResult.success) {
    return createUnauthorizedResponse(authResult.error);
  }

  console.log(`✅ Pipeline initiated by admin: ${authResult.user?.email}`);
  
  try {
    console.log('🚀 Iniciando pipeline completo: Scraping + LLM...');
    
    const scrapingService = new ScrapingService();
    const processingService = new ProcessingService();
    
    // Step 1: Run scraping job
    console.log('📰 Passo 1: Executando scraping...');
    const scrapingJob = await scrapingService.runScrapingJob();
    
    if (scrapingJob.status !== 'completed' || scrapingJob.articlesScraped === 0) {
      return NextResponse.json({
        success: false,
        error: `Scraping falhou: ${scrapingJob.error || 'Nenhum artigo encontrado'}`,
        scrapingJob
      }, { status: 500 });
    }
    
    console.log(`✅ Scraping concluído: ${scrapingJob.articlesScraped} artigos`);
    
    // Step 2: Process articles with LLM
    console.log('🤖 Passo 2: Processando artigos com LLM...');
    const processingJob = await processingService.processAllPendingArticles();
    
    if (processingJob.status !== 'completed') {
      return NextResponse.json({
        success: false,
        error: `Processamento LLM falhou: ${processingJob.error || 'Erro desconhecido'}`,
        scrapingJob,
        processingJob
      }, { status: 500 });
    }
    
    console.log(`✅ Processamento concluído: ${processingJob.articlesProcessed} artigos`);
    
    // Step 3: Auto-publish articles (for demo)
    console.log('📢 Passo 3: Publicando artigos...');
    const processedArticles = await processingService.getProcessedArticles(10);
    
    let publishedCount = 0;
    for (const article of processedArticles) {
      if (!article.is_published) {
        const published = await processingService.publishArticle(article.id);
        if (published) publishedCount++;
      }
    }
    
    console.log(`✅ Pipeline completo: ${publishedCount} artigos publicados`);
    
    // Step 4: Get final results
    const recentArticles = await processingService.getProcessedArticles(5);
    
    return NextResponse.json({
      success: true,
      pipeline: {
        scrapingJob: {
          id: scrapingJob.id,
          status: scrapingJob.status,
          articlesScraped: scrapingJob.articlesScraped
        },
        processingJob: {
          id: processingJob.id,
          status: processingJob.status,
          articlesProcessed: processingJob.articlesProcessed
        },
        publishedCount
      },
      sampleArticles: recentArticles.slice(0, 3).map(article => ({
        id: article.id,
        dramaticTitle: article.title,
        dramaScore: article.drama_score,
        urgencyLevel: article.urgency_level,
        category: article.category,
        isPublished: article.is_published
      }))
    });
    
  } catch (error) {
    console.error('❌ Erro no pipeline:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido no pipeline'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const scrapingService = new ScrapingService();
    const processingService = new ProcessingService();
    
    // Get status info
    const recentScrapingJobs = await scrapingService.getScrapingJobs(3);
    const recentProcessingJobs = await processingService.getProcessingJobs(3);
    const processedArticles = await processingService.getProcessedArticles(5);
    
    // Get total counts
    const totalOriginalArticles = await scrapingService.getTotalArticlesCount();
    const totalProcessedArticles = await processingService.getTotalProcessedArticlesCount();
    const totalPublishedArticles = await processingService.getTotalPublishedArticlesCount();
    
    return NextResponse.json({
      success: true,
      status: {
        originalArticles: totalOriginalArticles,
        processedArticles: totalProcessedArticles,
        publishedArticles: totalPublishedArticles,
        recentScrapingJobs: recentScrapingJobs.map(job => ({
          id: job.id.substring(0, 8) + '...',
          status: job.status,
          articlesScraped: job.articlesScraped,
          startedAt: job.startedAt
        })),
        recentProcessingJobs: recentProcessingJobs.map(job => ({
          id: job.id.substring(0, 8) + '...',
          status: job.status,
          articlesProcessed: job.articlesProcessed,
          startedAt: job.startedAt
        }))
      },
      sampleArticles: processedArticles.slice(0, 3).map(article => ({
        id: article.id,
        dramaticTitle: article.title,
        category: article.category,
        dramaScore: article.drama_score,
        urgencyLevel: article.urgency_level
      }))
    });
    
  } catch (error) {
    console.error('❌ Erro ao obter status:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao obter status'
    }, { status: 500 });
  }
}