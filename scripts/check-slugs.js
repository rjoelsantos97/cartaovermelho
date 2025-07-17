/**
 * Script para verificar se os artigos têm slugs gerados
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkSlugs() {
  // Inicializar cliente Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  console.log('🔍 Verificando slugs dos artigos...');

  // Obter alguns artigos para verificar
  const { data: articles, error } = await supabase
    .from('processed_articles')
    .select('id, title, slug, is_published')
    .eq('is_published', true)
    .order('processed_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Erro ao obter artigos:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('❌ Nenhum artigo encontrado!');
    return;
  }

  console.log(`\n📰 Verificando ${articles.length} artigos mais recentes:\n`);

  articles.forEach((article, index) => {
    const hasSlug = article.slug ? '✅' : '❌';
    const titlePreview = article.title.substring(0, 60) + '...';
    const urlPreview = article.slug ? `/article/${article.slug}` : `/article/${article.id}`;
    
    console.log(`${index + 1}. ${hasSlug} ${titlePreview}`);
    console.log(`   URL: ${urlPreview}`);
    console.log('');
  });

  // Estatísticas gerais
  const { data: stats } = await supabase
    .from('processed_articles')
    .select('slug')
    .eq('is_published', true);

  const totalArticles = stats?.length || 0;
  const articlesWithSlugs = stats?.filter(article => article.slug).length || 0;
  const articlesWithoutSlugs = totalArticles - articlesWithSlugs;

  console.log('\n📊 ESTATÍSTICAS:');
  console.log(`📰 Total de artigos: ${totalArticles}`);
  console.log(`✅ Com slugs: ${articlesWithSlugs}`);
  console.log(`❌ Sem slugs: ${articlesWithoutSlugs}`);
  console.log(`📈 Percentagem: ${totalArticles > 0 ? Math.round((articlesWithSlugs / totalArticles) * 100) : 0}%`);
}

checkSlugs().catch(console.error);