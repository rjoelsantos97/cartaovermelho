const { config } = require('dotenv');
const path = require('path');

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });

async function testScraping() {
  console.log('🚀 Testando sistema de scraping do Cartão Vermelho...\n');
  
  try {
    // Import scraping modules (using dynamic import for ES modules)
    const { AbolaScraper, ScrapingService } = await import('../src/lib/scraping/index.ts');
    
    console.log('📰 Teste 1: Conexão ao abola.pt');
    const scraper = new AbolaScraper();
    const isConnected = await scraper.testConnection();
    
    if (isConnected) {
      console.log('✅ Conexão bem-sucedida ao abola.pt\n');
    } else {
      console.log('❌ Falha na conexão ao abola.pt\n');
      return;
    }
    
    console.log('📰 Teste 2: Scraping de artigos');
    const articles = await scraper.scrapeArticles();
    
    console.log(`✅ Scraped ${articles.length} artigos:`);
    articles.forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title.substring(0, 60)}...`);
      console.log(`      Categoria: ${article.category}`);
      console.log(`      URL: ${article.sourceUrl}`);
      console.log(`      Data: ${article.publishedAt}`);
      console.log('');
    });
    
    console.log('📰 Teste 3: Teste do serviço de scraping com base de dados');
    const scrapingService = new ScrapingService();
    const testResult = await scrapingService.testScraping();
    
    if (testResult.success) {
      console.log(`✅ Teste do serviço bem-sucedido: ${testResult.articlesFound} artigos encontrados\n`);
    } else {
      console.log(`❌ Teste do serviço falhou: ${testResult.error}\n`);
    }
    
    console.log('📰 Teste 4: Scraping de artigo completo');
    if (articles.length > 0) {
      const firstArticle = articles[0];
      console.log(`Fazendo scraping completo de: ${firstArticle.title}`);
      
      const fullArticle = await scraper.scrapeFullArticle(firstArticle.sourceUrl);
      console.log(`✅ Conteúdo completo obtido (${fullArticle.content?.length || 0} caracteres)`);
      
      if (fullArticle.content) {
        console.log(`   Preview: ${fullArticle.content.substring(0, 200)}...`);
      }
    }
    
    console.log('\n🎉 Todos os testes de scraping completados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    console.error('\nStack trace:', error.stack);
  }
}

// Run the test
testScraping();