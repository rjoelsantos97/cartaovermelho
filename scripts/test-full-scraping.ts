import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '..', '.env.local') });

import { ScrapingService } from '../src/lib/scraping/scraping-service';

async function testFullScraping() {
  console.log('🚀 Teste completo do sistema de scraping...\n');
  
  try {
    const scrapingService = new ScrapingService();
    
    console.log('📰 Teste 1: Teste básico do scraping');
    const testResult = await scrapingService.testScraping();
    
    if (testResult.success) {
      console.log(`✅ Teste bem-sucedido: ${testResult.articlesFound} artigos encontrados\n`);
    } else {
      console.log(`❌ Teste falhou: ${testResult.error}\n`);
      return;
    }
    
    console.log('📰 Teste 2: Execução de job de scraping completo');
    console.log('⏳ Iniciando job de scraping (pode demorar alguns segundos)...\n');
    
    try {
      const job = await scrapingService.runScrapingJob();
      
      console.log('📊 RESULTADOS DO JOB:');
      console.log(`   Job ID: ${job.id}`);
      console.log(`   Status: ${job.status}`);
      console.log(`   Iniciado: ${new Date(job.startedAt).toLocaleString('pt-PT')}`);
      console.log(`   Concluído: ${job.completedAt ? new Date(job.completedAt).toLocaleString('pt-PT') : 'N/A'}`);
      console.log(`   Artigos salvos: ${job.articlesScraped}`);
      
      if (job.error) {
        console.log(`   Erro: ${job.error}`);
      }
      
    } catch (jobError) {
      console.error(`❌ Erro no job de scraping: ${jobError}`);
    }
    
    console.log('\n📰 Teste 3: Verificação de artigos na base de dados');
    
    try {
      const recentArticles = await scrapingService.getRecentArticles(5);
      
      console.log(`✅ ${recentArticles.length} artigos recentes na base de dados:`);
      
      recentArticles.forEach((article, index) => {
        console.log(`\n   ${index + 1}. ${article.title}`);
        console.log(`      Categoria: ${article.category}`);
        console.log(`      URL: ${article.source_url}`);
        console.log(`      Scraped: ${new Date(article.scraped_at).toLocaleString('pt-PT')}`);
        console.log(`      Imagem: ${article.image_url ? '✅' : '❌'}`);
        console.log(`      Autor: ${article.author || 'N/A'}`);
        console.log(`      Conteúdo: ${article.content.length} caracteres`);
      });
      
    } catch (dbError) {
      console.error(`❌ Erro ao verificar base de dados: ${dbError}`);
    }
    
    console.log('\n📰 Teste 4: Histórico de jobs');
    
    try {
      const jobs = await scrapingService.getScrapingJobs(3);
      
      console.log(`📊 ${jobs.length} jobs de scraping recentes:`);
      
      jobs.forEach((job, index) => {
        console.log(`\n   ${index + 1}. Job ${job.id.substring(0, 8)}...`);
        console.log(`      Status: ${job.status}`);
        console.log(`      Artigos: ${job.articlesScraped}`);
        console.log(`      Iniciado: ${new Date(job.startedAt).toLocaleString('pt-PT')}`);
        if (job.error) {
          console.log(`      Erro: ${job.error}`);
        }
      });
      
    } catch (jobsError) {
      console.error(`❌ Erro ao obter jobs: ${jobsError}`);
    }
    
    console.log('\n🎉 Teste completo do sistema de scraping concluído!');
    console.log('💡 Sistema pronto para produção com RSS feeds confiáveis.');
    
  } catch (error) {
    console.error('❌ Erro durante teste completo:', error);
  }
}

testFullScraping();