/**
 * Script para corrigir slugs com caracteres especiais
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Import the generateSeoFriendlySlug function
function generateSlug(title) {
  return title
    .toLowerCase()
    // Replace Portuguese special characters - COMPREHENSIVE
    .replace(/[àáâãäåæ]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõöø]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[ý]/g, 'y')
    .replace(/[đ]/g, 'd')
    // Remove ALL non-alphanumeric characters except spaces and hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Trim and replace spaces with hyphens
    .trim()
    .replace(/\s/g, '-')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length to 100 characters for optimal SEO
    .substring(0, 100)
    // Remove trailing hyphen if substring cut in the middle
    .replace(/-+$/, '');
}

function generateSeoFriendlySlug(title) {
  // Remove common dramatic words that don't add SEO value
  const cleanTitle = title
    .replace(/BOMBA TOTAL[:\s]*/gi, '')
    .replace(/ÚLTIMA HORA[:\s]*/gi, '')
    .replace(/CHOCA[:\s]*/gi, 'choca-')
    .replace(/DRAMÁTICA?[:\s]*/gi, 'dramatica-')
    .replace(/ÉPICA?[:\s]*/gi, 'epica-')
    .replace(/ABSOLUTAMENTE[:\s]*/gi, '')
    .replace(/TOTALMENTE[:\s]*/gi, '')
    .replace(/INCRÍVEL[:\s]*/gi, 'incrivel-')
    .replace(/MUNDO DO FUTEBOL/gi, 'mundo-futebol')
    .replace(/SELEÇÃO PORTUGUESA/gi, 'selecao-portuguesa')
    .replace(/BENFICA/gi, 'benfica')
    .replace(/PORTO/gi, 'porto')
    .replace(/SPORTING/gi, 'sporting')
    .replace(/CRISTIANO RONALDO/gi, 'cristiano-ronaldo')
    .replace(/PEPE/gi, 'pepe')
    .replace(/BRUNO FERNANDES/gi, 'bruno-fernandes')
    .replace(/JOÃO FÉLIX/gi, 'joao-felix')
    .replace(/RAFAEL LEÃO/gi, 'rafael-leao');

  return generateSlug(cleanTitle);
}

async function fixProblematicSlugs() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // Get all articles with slugs
  const { data: articles, error } = await supabase
    .from('processed_articles')
    .select('id, title, slug')
    .not('slug', 'is', null)
    .order('processed_at', { ascending: false });

  if (error) {
    console.error('❌ Erro ao buscar artigos:', error);
    return;
  }

  console.log('🔍 Verificando e corrigindo slugs problemáticos...');
  
  const problematicSlugs = [];
  const updates = [];
  
  articles.forEach(article => {
    const slug = article.slug;
    const regex = /^[a-z0-9-]+$/;
    
    if (!regex.test(slug)) {
      const newSlug = generateSeoFriendlySlug(article.title);
      problematicSlugs.push({
        id: article.id,
        title: article.title,
        oldSlug: slug,
        newSlug: newSlug
      });
      
      updates.push({
        id: article.id,
        slug: newSlug
      });
    }
  });

  console.log(`📊 Total de artigos: ${articles.length}`);
  console.log(`⚠️  Slugs problemáticos encontrados: ${problematicSlugs.length}`);
  
  if (problematicSlugs.length > 0) {
    console.log('\n🔧 CORREÇÕES A APLICAR:');
    problematicSlugs.forEach((item, i) => {
      console.log(`${i+1}. ${item.title}`);
      console.log(`   Antigo: ${item.oldSlug}`);
      console.log(`   Novo:   ${item.newSlug}`);
      console.log('');
    });
    
    // Apply updates
    console.log('🚀 Aplicando correções...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const update of updates) {
      const { error } = await supabase
        .from('processed_articles')
        .update({ slug: update.slug })
        .eq('id', update.id);
      
      if (error) {
        console.error(`❌ Erro ao atualizar ${update.id}:`, error);
        errorCount++;
      } else {
        successCount++;
      }
    }
    
    console.log(`\n📈 RESULTADOS:`);
    console.log(`✅ Sucessos: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    
    if (successCount > 0) {
      console.log('\n🎉 Slugs corrigidos com sucesso!');
    }
  } else {
    console.log('✅ Todos os slugs já estão limpos!');
  }
}

fixProblematicSlugs().catch(console.error);