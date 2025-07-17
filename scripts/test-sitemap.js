/**
 * Script para testar o sitemap e verificar se as categorias estão incluídas
 */

async function testSitemap() {
  try {
    console.log('🗺️  Testando sitemap...');
    
    const response = await fetch('http://localhost:3000/sitemap.xml');
    
    if (!response.ok) {
      console.error('❌ Erro ao carregar sitemap:', response.status);
      return;
    }
    
    const sitemapXml = await response.text();
    console.log('✅ Sitemap carregado com sucesso!');
    
    // Contar URLs por tipo
    const articleUrls = (sitemapXml.match(/\/article\//g) || []).length;
    const categoryUrls = (sitemapXml.match(/\/category\//g) || []).length;
    const totalUrls = (sitemapXml.match(/<url>/g) || []).length;
    
    console.log('\n📊 ESTATÍSTICAS DO SITEMAP:');
    console.log(`🏠 Total de URLs: ${totalUrls}`);
    console.log(`📰 URLs de artigos: ${articleUrls}`);
    console.log(`📂 URLs de categorias: ${categoryUrls}`);
    console.log(`🔗 Outras URLs: ${totalUrls - articleUrls - categoryUrls}`);
    
    // Verificar se categorias específicas estão incluídas
    const categoriesToCheck = [
      'desporto',
      'benfica',
      'porto',
      'sporting',
      'internacional',
      'futebol'
    ];
    
    console.log('\n🔍 VERIFICAÇÃO DE CATEGORIAS:');
    categoriesToCheck.forEach(category => {
      const found = sitemapXml.includes(`/category/${category}`);
      console.log(`${found ? '✅' : '❌'} /category/${category}`);
    });
    
    // Mostrar algumas URLs de exemplo
    console.log('\n📝 EXEMPLOS DE URLs:');
    
    // URLs de categorias
    const categoryMatches = sitemapXml.match(/\/category\/[^<]+/g);
    if (categoryMatches) {
      console.log('\n📂 Categorias:');
      categoryMatches.slice(0, 5).forEach(url => {
        console.log(`   ${url}`);
      });
    }
    
    // URLs de artigos
    const articleMatches = sitemapXml.match(/\/article\/[^<]+/g);
    if (articleMatches) {
      console.log('\n📰 Artigos:');
      articleMatches.slice(0, 5).forEach(url => {
        console.log(`   ${url}`);
      });
    }
    
    console.log('\n🎉 Teste do sitemap concluído!');
    
  } catch (error) {
    console.error('❌ Erro ao testar sitemap:', error);
  }
}

testSitemap();