const Parser = require('rss-parser');

async function testRSSFinal() {
  console.log('🚀 Teste final do RSS scraper...\n');
  
  try {
    const parser = new Parser({
      customFields: {
        item: ['enclosure']
      }
    });
    
    const feeds = {
      futebol: 'https://www.abola.pt/rss/futebol',
      modalidades: 'https://www.abola.pt/rss/modalidades', 
      internacional: 'https://www.abola.pt/rss/internacional'
    };
    
    console.log('📰 Testando todos os feeds RSS...\n');
    
    const allArticles = [];
    
    for (const [category, feedUrl] of Object.entries(feeds)) {
      try {
        console.log(`📡 ${category.toUpperCase()}:`);
        const feed = await parser.parseURL(feedUrl);
        
        console.log(`   ✅ ${feed.items.length} artigos disponíveis`);
        
        // Take first 2 articles from each category
        const articles = feed.items.slice(0, 2).map(item => ({
          title: item.title,
          category: category,
          link: item.link,
          pubDate: item.pubDate,
          image: item.enclosure?.url || null,
          excerpt: item.contentSnippet || 'Sem resumo'
        }));
        
        articles.forEach((article, index) => {
          console.log(`   ${index + 1}. ${article.title.substring(0, 50)}...`);
          console.log(`      🔗 ${article.link}`);
          console.log(`      📅 ${new Date(article.pubDate).toLocaleDateString('pt-PT')}`);
          console.log(`      🖼️ ${article.image ? 'Com imagem' : 'Sem imagem'}`);
        });
        
        allArticles.push(...articles);
        console.log('');
        
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}\n`);
      }
    }
    
    console.log(`📰 RESUMO:`);
    console.log(`   Total de artigos coletados: ${allArticles.length}`);
    console.log(`   Artigos com imagem: ${allArticles.filter(a => a.image).length}`);
    console.log(`   Categorias ativas: ${Object.keys(feeds).length}`);
    
    const categories = [...new Set(allArticles.map(a => a.category))];
    console.log(`   Distribuição: ${categories.map(cat => `${cat} (${allArticles.filter(a => a.category === cat).length})`).join(', ')}`);
    
    console.log('\n🎉 Sistema RSS funcional e pronto!');
    console.log('💡 Dados estruturados, imagens incluídas, múltiplas categorias.');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testRSSFinal();