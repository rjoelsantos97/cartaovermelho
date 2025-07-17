/**
 * Script para testar se a função getArticleBySlugOrId está funcionando
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSlugFunction(slug) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  console.log(`🔍 Testando slug: ${slug}`);

  // Testar busca direta por slug
  const { data: directResult, error: directError } = await supabase
    .from('processed_articles')
    .select('id, title, slug')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (directError) {
    console.error('❌ Erro na busca direta:', directError);
  } else if (directResult) {
    console.log('✅ Encontrado na busca direta:', directResult.title);
  } else {
    console.log('❌ Não encontrado na busca direta');
  }

  // Testar busca com LIKE para slugs similares
  const { data: likeResults, error: likeError } = await supabase
    .from('processed_articles')
    .select('id, title, slug')
    .like('slug', `%${slug.substring(0, 20)}%`)
    .eq('is_published', true)
    .limit(5);

  if (likeError) {
    console.error('❌ Erro na busca LIKE:', likeError);
  } else if (likeResults && likeResults.length > 0) {
    console.log('\n📋 Slugs similares encontrados:');
    likeResults.forEach((article, index) => {
      console.log(`${index + 1}. ${article.slug}`);
      console.log(`   Título: ${article.title}`);
    });
  } else {
    console.log('❌ Nenhum slug similar encontrado');
  }
}

// Testar com o slug que está dando 404
testSlugFunction('trubin-o-tradutor-de-tostas-mistas').catch(console.error);