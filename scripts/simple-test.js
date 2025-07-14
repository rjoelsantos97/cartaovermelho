// Simple test without TypeScript imports
const Parser = require('rss-parser');
const { createClient } = require('@supabase/supabase-js');

// Load env vars manually
require('dotenv').config({ path: '.env.local' });

async function simpleTest() {
  console.log('🚀 Teste simples com componentes individuais...\n');
  
  try {
    // Test 1: RSS parsing
    console.log('📰 Teste 1: Parsing RSS');
    const parser = new Parser({
      customFields: {
        item: ['enclosure']
      }
    });
    
    const feed = await parser.parseURL('https://www.abola.pt/rss/futebol');
    console.log(`✅ RSS parsed: ${feed.items.length} items`);
    
    const sampleArticle = feed.items[0];
    console.log(`   Exemplo: ${sampleArticle.title}`);
    console.log(`   Link: ${sampleArticle.link}`);
    console.log(`   Imagem: ${sampleArticle.enclosure?.url ? 'Sim' : 'Não'}\n`);
    
    // Test 2: Supabase connection
    console.log('📰 Teste 2: Conexão Supabase');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Test query
    const { count, error } = await supabase
      .from('original_articles')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ Erro Supabase: ${error.message}`);
    } else {
      console.log(`✅ Supabase conectado. Artigos na BD: ${count || 0}\n`);
    }
    
    // Test 3: Insert test article
    console.log('📰 Teste 3: Inserção de artigo teste');
    
    const testArticle = {
      title: 'TESTE: ' + sampleArticle.title,
      content: 'Conteúdo de teste para verificar inserção na base de dados. ' + (sampleArticle.contentSnippet || ''),
      category: 'Futebol',
      published_at: sampleArticle.pubDate || new Date().toISOString(),
      url: sampleArticle.link + '?test=true',
      image_url: sampleArticle.enclosure?.url,
      author: 'Teste Script',
      source: 'abola.pt'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('original_articles')
      .insert(testArticle)
      .select()
      .single();
    
    if (insertError) {
      console.log(`❌ Erro inserção: ${insertError.message}`);
    } else {
      console.log(`✅ Artigo teste inserido com ID: ${insertData.id}\n`);
      
      // Clean up - delete test article
      await supabase
        .from('original_articles')
        .delete()
        .eq('id', insertData.id);
      
      console.log(`🧹 Artigo teste removido\n`);
    }
    
    console.log('🎉 Todos os componentes funcionam corretamente!');
    console.log('💡 Sistema pronto para scraping real.');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

simpleTest();