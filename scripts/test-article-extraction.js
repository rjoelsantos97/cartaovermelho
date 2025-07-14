const cheerio = require('cheerio');

async function testArticleExtraction() {
  console.log('🚀 Teste de extração de artigos do abola.pt...\n');
  
  try {
    console.log('📰 Fazendo fetch da página principal...');
    
    const response = await fetch('https://www.abola.pt', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CartaoVermelho/1.0; Sports News Aggregator)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    console.log('📰 Procurando artigos...');
    
    const articles = [];
    
    // Try different article selectors
    $('article').each((index, element) => {
      const $article = $(element);
      
      // Look for title in various ways
      let title = '';
      const titleSelectors = ['h1', 'h2', 'h3', '.title', '.headline', 'a[title]'];
      
      for (const selector of titleSelectors) {
        const titleElement = $article.find(selector).first();
        if (titleElement.length > 0) {
          title = titleElement.text().trim() || titleElement.attr('title') || '';
          if (title.length > 10) break;
        }
      }
      
      // Look for link
      let link = '';
      const linkElement = $article.find('a').first();
      if (linkElement.length > 0) {
        link = linkElement.attr('href') || '';
        if (link && !link.startsWith('http')) {
          link = link.startsWith('/') ? `https://www.abola.pt${link}` : `https://www.abola.pt/${link}`;
        }
      }
      
      // Look for image
      let image = '';
      const imgElement = $article.find('img').first();
      if (imgElement.length > 0) {
        image = imgElement.attr('src') || imgElement.attr('data-src') || '';
        if (image && !image.startsWith('http')) {
          image = image.startsWith('/') ? `https://www.abola.pt${image}` : `https://www.abola.pt/${image}`;
        }
      }
      
      // Look for excerpt/summary
      let excerpt = '';
      const excerptSelectors = ['.excerpt', '.summary', '.lead', 'p'];
      for (const selector of excerptSelectors) {
        const excerptElement = $article.find(selector).first();
        if (excerptElement.length > 0) {
          excerpt = excerptElement.text().trim();
          if (excerpt.length > 20) break;
        }
      }
      
      if (title && title.length > 10 && link) {
        articles.push({
          title: title.substring(0, 100),
          link,
          image: image || null,
          excerpt: excerpt ? excerpt.substring(0, 150) : null,
          selector: 'article'
        });
      }
    });
    
    console.log(`✅ Encontrados ${articles.length} artigos usando selector 'article':`);
    
    articles.slice(0, 5).forEach((article, index) => {
      console.log(`\n   ${index + 1}. ${article.title}`);
      console.log(`      Link: ${article.link}`);
      if (article.excerpt) {
        console.log(`      Resumo: ${article.excerpt}...`);
      }
      if (article.image) {
        console.log(`      Imagem: ${article.image}`);
      }
    });
    
    if (articles.length > 0) {
      console.log('\n📰 Testando scraping de artigo completo...');
      const firstArticle = articles[0];
      
      try {
        const articleResponse = await fetch(firstArticle.link, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CartaoVermelho/1.0; Sports News Aggregator)'
          }
        });
        
        if (articleResponse.ok) {
          const articleHtml = await articleResponse.text();
          const $article = cheerio.load(articleHtml);
          
          // Try to find article content
          const contentSelectors = [
            '.article-content',
            '.content',
            '.entry-content', 
            '.post-content',
            'article .content',
            '.article-body'
          ];
          
          let content = '';
          for (const selector of contentSelectors) {
            const contentElement = $article(selector);
            if (contentElement.length > 0) {
              content = contentElement.text().trim();
              if (content.length > 100) break;
            }
          }
          
          console.log(`✅ Conteúdo extraído (${content.length} caracteres)`);
          if (content) {
            console.log(`   Preview: ${content.substring(0, 200)}...`);
          }
          
          // Try to find publication date
          const dateSelectors = ['time', '.date', '.published', '.post-date'];
          let pubDate = '';
          for (const selector of dateSelectors) {
            const dateElement = $article(selector).first();
            if (dateElement.length > 0) {
              pubDate = dateElement.attr('datetime') || dateElement.text().trim();
              if (pubDate) break;
            }
          }
          
          if (pubDate) {
            console.log(`   Data: ${pubDate}`);
          }
          
        } else {
          console.log(`❌ Não foi possível aceder ao artigo: ${articleResponse.status}`);
        }
      } catch (articleError) {
        console.log(`❌ Erro ao extrair artigo: ${articleError.message}`);
      }
    }
    
    if (articles.length === 0) {
      console.log('❌ Nenhum artigo encontrado com os seletores atuais');
      console.log('💡 Talvez seja necessário ajustar os seletores CSS');
      
      // Debug: show some sample HTML structure
      console.log('\n🔍 Estrutura HTML de amostra:');
      $('article').slice(0, 2).each((index, element) => {
        console.log(`\nArtigo ${index + 1}:`);
        console.log($(element).html().substring(0, 300) + '...');
      });
    }
    
    console.log('\n🎉 Teste de extração completado!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Run the test
testArticleExtraction();