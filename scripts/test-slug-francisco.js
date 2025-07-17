/**
 * Script para testar o slug corrigido do Francisco Conceição
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSlugFunction(slug) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  console.log(`🔍 Testando slug corrigido: ${slug}`);

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
    console.log('   Slug no DB:', directResult.slug);
  } else {
    console.log('❌ Não encontrado na busca direta');
  }
}

// Testar com o slug corrigido
testSlugFunction('francisco-conceicao-ultimatum-da-juventus-aceitara').catch(console.error);