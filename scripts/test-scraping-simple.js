const cheerio = require('cheerio');

async function testAbolaConnection() {
  console.log('🚀 Teste simples de conexão ao abola.pt...\n');
  
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
    
    console.log(`✅ Conexão bem-sucedida! Status: ${response.status}`);
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    console.log('📰 Analisando conteúdo da página...');
    
    // Try to find article elements with various selectors
    const selectors = [
      '.entry',
      '.article',
      '.news-item',
      '.post',
      'article',
      '.content-item'
    ];
    
    let articlesFound = 0;
    let bestSelector = '';
    
    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > articlesFound) {
        articlesFound = elements.length;
        bestSelector = selector;
      }
    }
    
    console.log(`✅ Melhor selector encontrado: "${bestSelector}" (${articlesFound} elementos)`);
    
    // Try to extract some titles
    const titleSelectors = ['h1', 'h2', 'h3', '.title', '.headline'];
    let titlesFound = [];
    
    for (const titleSelector of titleSelectors) {
      $(titleSelector).each((index, element) => {
        const title = $(element).text().trim();
        if (title.length > 10 && title.length < 200) {
          titlesFound.push(title);
        }
      });
      
      if (titlesFound.length >= 5) break;
    }
    
    console.log(`✅ Títulos encontrados (${titlesFound.length}):`);
    titlesFound.slice(0, 5).forEach((title, index) => {
      console.log(`   ${index + 1}. ${title.substring(0, 80)}...`);
    });
    
    // Check page structure
    console.log('\n📰 Estrutura da página:');
    console.log(`   - Total de elementos: ${$('*').length}`);
    console.log(`   - Links encontrados: ${$('a').length}`);
    console.log(`   - Imagens encontradas: ${$('img').length}`);
    console.log(`   - Parágrafos encontrados: ${$('p').length}`);
    
    // Check if it's a sports website
    const sportsKeywords = ['futebol', 'desporto', 'jogador', 'clube', 'golo', 'jogo'];
    const pageText = $('body').text().toLowerCase();
    const foundKeywords = sportsKeywords.filter(keyword => pageText.includes(keyword));
    
    console.log(`   - Palavras-chave de desporto encontradas: ${foundKeywords.join(', ')}`);
    
    if (foundKeywords.length > 0) {
      console.log('✅ Confirmado: É um site de desporto!');
    }
    
    console.log('\n🎉 Teste de conexão completado com sucesso!');
    console.log('💡 Próximo passo: Ajustar seletores CSS no scraper baseado nos resultados.');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 Erro de DNS - verifique a conexão à internet');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Conexão recusada - o site pode estar em baixo');
    } else {
      console.log('💡 Erro inesperado - verifique os logs acima');
    }
  }
}

// Run the test
testAbolaConnection();