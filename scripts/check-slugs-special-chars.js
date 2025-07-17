/**
 * Script para verificar slugs com caracteres especiais
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkSlugsWithSpecialChars() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data: articles, error } = await supabase
    .from('processed_articles')
    .select('id, title, slug')
    .not('slug', 'is', null)
    .order('processed_at', { ascending: false });

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  console.log('🔍 Verificando slugs com caracteres especiais...');
  
  const problematicSlugs = [];
  
  articles.forEach(article => {
    const slug = article.slug;
    // Check for special characters (anything not a-z, 0-9, or -)
    const regex = /^[a-z0-9-]+$/;
    if (!regex.test(slug)) {
      const specialChars = slug.match(/[^a-z0-9-]/g) || [];
      problematicSlugs.push({
        id: article.id,
        title: article.title,
        slug: slug,
        specialChars: specialChars
      });
    }
  });

  console.log(`📊 Total de artigos com slug: ${articles.length}`);
  console.log(`⚠️  Slugs problemáticos: ${problematicSlugs.length}`);
  
  if (problematicSlugs.length > 0) {
    console.log('\n🚨 SLUGS COM CARACTERES ESPECIAIS:');
    problematicSlugs.forEach((item, i) => {
      console.log(`${i+1}. ${item.title}`);
      console.log(`   Slug: ${item.slug}`);
      console.log(`   Caracteres especiais: [${item.specialChars.join(', ')}]`);
      console.log('');
    });
    
    return problematicSlugs;
  } else {
    console.log('✅ Todos os slugs estão limpos!');
    return [];
  }
}

checkSlugsWithSpecialChars().catch(console.error);