/**
 * Script para verificar as categorias reais na base de dados
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkRealCategories() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  console.log('🔍 Verificando categorias reais na base de dados...');

  // Obter todas as categorias únicas
  const { data: articles, error } = await supabase
    .from('processed_articles')
    .select('category')
    .eq('is_published', true)
    .not('category', 'is', null)
    .not('category', 'eq', '');

  if (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('❌ Nenhuma categoria encontrada!');
    return;
  }

  // Contar occorrências de cada categoria
  const categoryCount = {};
  articles.forEach(article => {
    const cat = article.category;
    if (cat && cat.trim()) {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    }
  });

  // Ordenar por número de artigos
  const sortedCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1]);

  console.log('\n📊 CATEGORIAS REAIS (ordenadas por número de artigos):');
  sortedCategories.forEach(([category, count], index) => {
    const slug = category.toLowerCase().replace(/\s+/g, '-');
    console.log(`${index + 1}. ${category} (${count} artigos)`);
    console.log(`   Slug: /category/${slug}`);
  });

  console.log(`\n📈 Total de categorias únicas: ${sortedCategories.length}`);
  console.log(`📰 Total de artigos: ${articles.length}`);

  // Sugerir as top 6 categorias para o SEO
  console.log('\n🎯 TOP 6 CATEGORIAS SUGERIDAS PARA SEO:');
  const top6 = sortedCategories.slice(0, 6);
  top6.forEach(([category, count], index) => {
    const slug = category.toLowerCase().replace(/\s+/g, '-');
    console.log(`${index + 1}. "${category}" - /category/${slug} (${count} artigos)`);
  });
}

checkRealCategories().catch(console.error);