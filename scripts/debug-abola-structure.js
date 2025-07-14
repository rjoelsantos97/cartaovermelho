const cheerio = require('cheerio');

async function debugAbolaStructure() {
  console.log('🔍 Debug da estrutura do abola.pt...\n');
  
  try {
    const response = await fetch('https://www.abola.pt', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CartaoVermelho/1.0; Sports News Aggregator)'
      }
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    console.log('📰 Procurando por diferentes tipos de containers de artigos...\n');
    
    // Test various selectors that might contain articles
    const testSelectors = [
      'article',
      '.card',
      '.news',
      '.post',
      '.item',
      '.entry',
      '[class*="card"]',
      '[class*="news"]',
      '[class*="article"]',
      'a[href*="/noticia"]',
      'a[href*="/artigo"]'
    ];
    
    testSelectors.forEach(selector => {
      const elements = $(selector);
      console.log(`${selector}: ${elements.length} elementos`);
      
      if (elements.length > 0 && elements.length < 50) {
        // Show some sample classes and structure
        elements.slice(0, 3).each((index, element) => {
          const classes = $(element).attr('class') || 'no-class';
          const text = $(element).text().trim().substring(0, 100);
          console.log(`   [${index}] classes: ${classes}`);
          console.log(`       text: ${text}...`);
        });
        console.log('');
      }
    });
    
    console.log('\n📰 Procurando por links de notícias...\n');
    
    // Look for news links
    const newsLinks = [];
    $('a').each((index, element) => {
      const href = $(element).attr('href') || '';
      const text = $(element).text().trim();
      
      if (href && text && text.length > 10) {
        if (href.includes('/noticia/') || href.includes('/artigo/') || 
            href.includes('/news/') || href.match(/\/\d{4}\/\d{2}\/\d{2}\//)) {
          newsLinks.push({
            href: href.startsWith('http') ? href : `https://www.abola.pt${href}`,
            text: text.substring(0, 80)
          });
        }
      }
    });
    
    console.log(`✅ Encontrados ${newsLinks.length} links que parecem ser notícias:`);
    newsLinks.slice(0, 5).forEach((link, index) => {
      console.log(`   ${index + 1}. ${link.text}`);
      console.log(`      ${link.href}`);
    });
    
    console.log('\n📰 Procurando por elementos com texto de desporto...\n');
    
    // Look for elements containing sports keywords
    const sportsKeywords = ['golo', 'jogador', 'treinador', 'clube', 'futebol', 'benfica', 'porto', 'sporting'];
    const sportsElements = [];
    
    $('*').each((index, element) => {
      const text = $(element).text().trim().toLowerCase();
      const hasKeyword = sportsKeywords.some(keyword => text.includes(keyword));
      
      if (hasKeyword && text.length > 20 && text.length < 200) {
        const tagName = element.tagName;
        const classes = $(element).attr('class') || '';
        sportsElements.push({
          tag: tagName,
          classes,
          text: text.substring(0, 100)
        });
      }
    });
    
    console.log(`✅ Encontrados ${sportsElements.length} elementos com conteúdo desportivo:`);
    sportsElements.slice(0, 5).forEach((elem, index) => {
      console.log(`   ${index + 1}. <${elem.tag}> (${elem.classes})`);
      console.log(`      ${elem.text}...`);
    });
    
    console.log('\n📰 Estrutura geral da página...\n');
    
    // General page structure analysis
    const structureInfo = {
      totalElements: $('*').length,
      images: $('img').length,
      links: $('a').length,
      headings: $('h1, h2, h3, h4, h5, h6').length,
      divs: $('div').length,
      articles: $('article').length,
      sections: $('section').length
    };
    
    Object.entries(structureInfo).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    
    // Look for common CSS classes
    console.log('\n📰 Classes CSS mais comuns...\n');
    const classCount = {};
    $('*').each((index, element) => {
      const classes = $(element).attr('class');
      if (classes) {
        classes.split(' ').forEach(cls => {
          if (cls.trim()) {
            classCount[cls] = (classCount[cls] || 0) + 1;
          }
        });
      }
    });
    
    const sortedClasses = Object.entries(classCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    sortedClasses.forEach(([className, count]) => {
      console.log(`${className}: ${count} elementos`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

debugAbolaStructure();