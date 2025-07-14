const Parser = require('rss-parser');
const cheerio = require('cheerio');

async function testRSSFeed() {
  console.log('🚀 Teste do RSS feed do abola.pt...\n');
  
  try {
    const parser = new Parser({
      customFields: {
        item: ['enclosure']
      }
    });
    
    console.log('📰 Fazendo fetch do RSS feed...');
    const feed = await parser.parseURL('https://www.abola.pt/rss/futebol');
    
    console.log(`✅ RSS feed carregado com sucesso!`);
    console.log(`   Título: ${feed.title}`);
    console.log(`   Descrição: ${feed.description}`);
    console.log(`   Total de artigos: ${feed.items.length}\n`);
    
    console.log('📰 Primeiros 5 artigos do RSS:\n');
    
    const articles = [];
    
    feed.items.slice(0, 5).forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   Link: ${item.link}`);
      console.log(`   Data: ${item.pubDate}`);
      console.log(`   Resumo: ${item.contentSnippet || item.content || 'N/A'}`);
      
      // Check for image in enclosure
      if (item.enclosure) {
        console.log(`   Imagem: ${item.enclosure.url}`);
      }
      
      // Check for other image fields
      if (item['media:content']) {
        console.log(`   Media: ${JSON.stringify(item['media:content'])}`);
      }
      
      console.log('');
      
      articles.push({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        excerpt: item.contentSnippet || item.content || '',
        imageUrl: item.enclosure?.url || null,
        category: 'Futebol'
      });
    });
    
    // Test scraping individual article
    if (articles.length > 0) {
      console.log('📰 Testando scraping de artigo individual...\n');
      const firstArticle = articles[0];
      
      try {
        const response = await fetch(firstArticle.link, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CartaoVermelho/1.0; Sports News Aggregator)'
          }
        });
        
        if (response.ok) {
          const html = await response.text();
          const $ = cheerio.load(html);
          
          // Try various selectors for article content
          const contentSelectors = [
            '.article-content',
            '.content',
            '.entry-content',
            '.post-content',
            'article .content',
            '.article-body',
            '[class*="content"]',
            '.text-content'
          ];
          
          let content = '';
          let usedSelector = '';
          
          for (const selector of contentSelectors) {
            const contentElement = $(selector);
            if (contentElement.length > 0) {
              const text = contentElement.text().trim();
              if (text.length > content.length) {
                content = text;
                usedSelector = selector;
              }
            }
          }
          
          console.log(`✅ Conteúdo extraído usando selector: ${usedSelector}`);
          console.log(`   Tamanho: ${content.length} caracteres`);
          
          if (content.length > 100) {
            console.log(`   Preview: ${content.substring(0, 300)}...`);
          } else {
            console.log(`   ❌ Conteúdo muito pequeno, talvez selector errado`);
            
            // Debug: show page structure
            console.log('\n🔍 Estrutura da página (debug):');
            const commonElements = ['article', 'main', '.content', 'p'];
            commonElements.forEach(sel => {
              const elements = $(sel);
              console.log(`   ${sel}: ${elements.length} elementos`);
            });
          }
          
          // Try to find author
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
          console.log(`❌ Erro ao aceder ao artigo: ${response.status}`);
        }
        
      } catch (articleError) {
        console.log(`❌ Erro ao processar artigo: ${articleError.message}`);
      }
    }
    
    console.log('\n📰 Teste de outros feeds RSS...\n');
    
    // Test other RSS feeds
    const otherFeeds = [
      { url: 'https://www.abola.pt/rss/modalidades', name: 'Modalidades' },
      { url: 'https://www.abola.pt/rss/internacional', name: 'Internacional' }
    ];
    
    for (const feedInfo of otherFeeds) {
      try {
        const otherFeed = await parser.parseURL(feedInfo.url);
        console.log(`✅ ${feedInfo.name}: ${otherFeed.items.length} artigos`);
        
        if (otherFeed.items.length > 0) {
          console.log(`   Exemplo: ${otherFeed.items[0].title}`);
        }
      } catch (error) {
        console.log(`❌ ${feedInfo.name}: Erro - ${error.message}`);
      }
    }
    
    console.log('\n🎉 Teste RSS completado!');
    console.log('💡 O RSS oferece uma forma muito mais confiável de obter notícias.');
    
  } catch (error) {
    console.error('❌ Erro durante teste RSS:', error.message);
  }
}

testRSSFeed();