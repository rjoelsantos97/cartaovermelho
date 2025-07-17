/**
 * Script para corrigir slugs com caracteres especiais portugueses
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Função melhorada para gerar slug SEO-friendly
function generateSlug(title) {
  return title
    .toLowerCase()
    // Replace Portuguese special characters
    .replace(/[àáâãä]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[ý]/g, 'y')
    // Remove other special characters and replace with spaces
    .replace(/[^\w\s-]/g, ' ')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Trim and replace spaces with hyphens
    .trim()
    .replace(/\s/g, '-')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '')
    // Limit length to 100 characters for optimal SEO
    .substring(0, 100)
    // Remove trailing hyphen if substring cut in the middle
    .replace(/-$/, '');
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

function ensureUniqueSlug(baseSlug, existingSlugs) {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

async function fixSpecialCharsSlugs() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  console.log('🔧 Corrigindo slugs com caracteres especiais...');

  // Buscar todos os artigos publicados
  const { data: articles, error } = await supabase
    .from('processed_articles')
    .select('id, title, slug')
    .eq('is_published', true)
    .not('slug', 'is', null);

  if (error) {
    console.error('❌ Erro ao buscar artigos:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('❌ Nenhum artigo encontrado!');
    return;
  }

  console.log(`📰 Processando ${articles.length} artigos...\n`);

  // Obter todos os slugs existentes
  const existingSlugs = articles.map(article => article.slug);
  
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const article of articles) {
    try {
      const newSlug = generateSeoFriendlySlug(article.title);
      
      // Verificar se o slug mudou
      if (article.slug === newSlug) {
        skipped++;
        continue;
      }

      // Verificar se tem caracteres especiais no slug atual
      const hasSpecialChars = /[àáâãäèéêëìíîïòóôõöùúûüçñý]/.test(article.slug);
      
      if (!hasSpecialChars) {
        skipped++;
        continue;
      }

      console.log(`🔄 ${article.title.substring(0, 50)}...`);
      console.log(`   Antes: ${article.slug}`);
      console.log(`   Depois: ${newSlug}`);

      // Garantir unicidade
      const uniqueSlug = ensureUniqueSlug(newSlug, existingSlugs.filter(s => s !== article.slug));

      // Atualizar slug
      const { error: updateError } = await supabase
        .from('processed_articles')
        .update({ slug: uniqueSlug })
        .eq('id', article.id);

      if (updateError) {
        console.error(`❌ Erro ao atualizar ${article.id}:`, updateError);
        failed++;
      } else {
        console.log(`✅ Atualizado para: ${uniqueSlug}`);
        
        // Atualizar lista de slugs existentes
        const index = existingSlugs.indexOf(article.slug);
        if (index > -1) {
          existingSlugs[index] = uniqueSlug;
        }
        
        updated++;
      }
      
      console.log('');
    } catch (error) {
      console.error(`❌ Erro ao processar ${article.id}:`, error);
      failed++;
    }
  }

  console.log('📊 RESUMO:');
  console.log(`✅ Atualizados: ${updated}`);
  console.log(`⏭️  Pulados: ${skipped}`);
  console.log(`❌ Falhas: ${failed}`);
  console.log(`📈 Total: ${updated + skipped + failed}`);
  console.log('\n🎉 Correção de caracteres especiais concluída!');
}

fixSpecialCharsSlugs().catch(console.error);