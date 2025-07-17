/**
 * Script para corrigir slugs que terminam com hífen
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function fixSlugsWithTrailingHyphens() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  console.log('🔧 Corrigindo slugs com hífenes no final...');

  // Buscar slugs que terminam com hífen
  const { data: articles, error } = await supabase
    .from('processed_articles')
    .select('id, title, slug')
    .eq('is_published', true)
    .not('slug', 'is', null)
    .like('slug', '%-');

  if (error) {
    console.error('❌ Erro ao buscar artigos:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('✅ Nenhum slug com hífen no final encontrado!');
    return;
  }

  console.log(`📝 Encontrados ${articles.length} slugs para corrigir:`);

  let fixed = 0;
  let failed = 0;

  for (const article of articles) {
    try {
      // Remover hífen do final
      const cleanSlug = article.slug.replace(/-+$/, '');
      
      console.log(`🔄 ${article.slug} → ${cleanSlug}`);

      // Verificar se o slug limpo já existe
      const { data: existing } = await supabase
        .from('processed_articles')
        .select('id')
        .eq('slug', cleanSlug)
        .neq('id', article.id)
        .single();

      if (existing) {
        console.log(`⚠️  Slug ${cleanSlug} já existe, pulando...`);
        continue;
      }

      // Atualizar slug
      const { error: updateError } = await supabase
        .from('processed_articles')
        .update({ slug: cleanSlug })
        .eq('id', article.id);

      if (updateError) {
        console.error(`❌ Erro ao atualizar ${article.id}:`, updateError);
        failed++;
      } else {
        console.log(`✅ Corrigido: ${cleanSlug}`);
        fixed++;
      }
    } catch (error) {
      console.error(`❌ Erro ao processar ${article.id}:`, error);
      failed++;
    }
  }

  console.log('\n📊 RESUMO:');
  console.log(`✅ Corrigidos: ${fixed}`);
  console.log(`❌ Falhas: ${failed}`);
  console.log(`📈 Total: ${fixed + failed}`);
}

fixSlugsWithTrailingHyphens().catch(console.error);