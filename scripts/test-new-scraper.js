const { config } = require('dotenv');
const path = require('path');

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });

// Note: Using dynamic import due to ES modules in TypeScript
async function testNewScraper() {
  console.log('🚀 Testando novo AbolaScraper baseado em RSS...\n');
  
  try {
    // Import using Node.js import() for ES modules
    const { createRequire } = require('module');
    const require = createRequire(import.meta.url || __filename);
    
    // For now, let's test the raw functionality
    const Parser = require('rss-parser');
    const cheerio = require('cheerio');
    
    const parser = new Parser({
      customFields: {
        item: ['enclosure']
      }
    });
    
    console.log('📰 Teste 1: RSS Feeds Individuais');
    
    const feeds = {
      futebol: 'https://www.abola.pt/rss/futebol',
      modalidades: 'https://www.abola.pt/rss/modalidades',
      internacional: 'https://www.abola.pt/rss/internacional'
    };
    
    const allArticles = [];
    
    for (const [category, feedUrl] of Object.entries(feeds)) {
      try {
        console.log(`\n📰 Carregando ${category}...`);
        const feed = await parser.parseURL(feedUrl);
        
        console.log(`✅ ${category}: ${feed.items.length} artigos`);
        
        // Process first 3 articles from each category
        const categoryArticles = feed.items.slice(0, 3).map(item => ({
          title: item.title || '',
          excerpt: item.contentSnippet || item.content || '',
          category: category,
          publishedAt: item.pubDate || new Date().toISOString(),
          sourceUrl: item.link || '',
          imageUrl: item.enclosure?.url || undefined,
          author: item.creator || undefined
        }));
        
        allArticles.push(...categoryArticles);
        
        // Show sample articles
        categoryArticles.forEach((article, index) => {
          console.log(`   ${index + 1}. ${article.title.substring(0, 60)}...`);
          if (article.imageUrl) {
            console.log(`      📸 Imagem: ✅`);
          }
        });
        
      } catch (error) {
        console.error(`❌ Erro em ${category}: ${error.message}`);
      }
    }
    
    console.log(`\n📰 Total de artigos coletados: ${allArticles.length}`);
    
    // Test full article scraping
    if (allArticles.length > 0) {
      console.log('\n📰 Teste 2: Scraping de Artigo Completo');
      
      const testArticle = allArticles[0];
      console.log(`Testando: ${testArticle.title}`);
      console.log(`URL: ${testArticle.sourceUrl}`);
      
      try {
        const response = await fetch(testArticle.sourceUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CartaoVermelho/1.0; Sports News Aggregator)'
          }
        });
        
        if (response.ok) {
          const html = await response.text();
          const $ = cheerio.load(html);
          
          // Try content selectors
          const contentSelectors = [
            '[class*="content"]',
            '.article-content',
            '.content',
            '.entry-content',
            '.post-content',
            'article .content',
            '.article-body'
          ];
          
          let bestContent = '';
          let usedSelector = '';
          
          for (const selector of contentSelectors) {
            const contentElement = $(selector);
            if (contentElement.length > 0) {
              const text = contentElement.text().trim();
              if (text.length > bestContent.length) {
                bestContent = text;
                usedSelector = selector;
              }
            }
          }
          
          console.log(`✅ Conteúdo extraído com '${usedSelector}': ${bestContent.length} caracteres`);
          
          if (bestContent.length > 100) {
            console.log(`   Preview: ${bestContent.substring(0, 300)}...`);
          }
          
          // Try author selectors
          const authorSelectors = ['.author', '.byline', '[class*="author"]', '.writer'];
          let author = '';
          
          for (const selector of authorSelectors) {
            const authorElement = $(selector).first();
            if (authorElement.length > 0) {
              author = authorElement.text().trim();
              if (author) break;
            }
          }
          
          if (author) {
            console.log(`   Autor: ${author}`);
          }
          
        } else {
          console.log(`❌ Erro HTTP: ${response.status}`);
        }
        
      } catch (error) {
        console.log(`❌ Erro ao processar artigo: ${error.message}`);
      }
    }
    
    console.log('\n📰 Teste 3: Simulação do Workflow Completo');
    
    // Simulate the complete workflow
    const simulatedArticles = allArticles.slice(0, 5).map(article => {
      // Add simulated full content and processing
      return {
        ...article,
        content: `Conteúdo completo do artigo sobre: ${article.title}. Este seria o conteúdo extraído do scraping individual da página.`,
        scraped: true,
        readyForProcessing: true
      };
    });
    
    console.log(`✅ Workflow simulado para ${simulatedArticles.length} artigos:`);
    simulatedArticles.forEach((article, index) => {
      console.log(`   ${index + 1}. [${article.category}] ${article.title.substring(0, 50)}...`);
      console.log(`      📅 ${new Date(article.publishedAt).toLocaleDateString('pt-PT')}`);
      console.log(`      🖼️ Imagem: ${article.imageUrl ? '✅' : '❌'}`);
      console.log(`      📝 Conteúdo: ${article.content.length} caracteres`);
    });
    
    console.log('\n🎉 Teste do novo scraper RSS completado com sucesso!');
    console.log('💡 O RSS oferece dados muito mais estruturados e confiáveis.');
    console.log('💡 Próximo passo: Integrar com o sistema de processamento LLM.');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

testNewScraper();