/**
 * Script para gerar slugs para artigos existentes
 * Executa diretamente na base de dados sem precisar de autenticação
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Função para gerar slug SEO-friendly
function generateSeoFriendlySlug(title) {
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

  return cleanTitle
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100)
    .replace(/-$/, '');
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

async function generateSlugsForAllArticles() {
  // Inicializar cliente Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  console.log('🚀 Iniciando geração de slugs...');

  // Obter artigos sem slugs
  const { data: articles, error } = await supabase
    .from('processed_articles')
    .select('id, title, slug')
    .eq('is_published', true)
    .is('slug', null);

  if (error) {
    console.error('❌ Erro ao obter artigos:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('✅ Todos os artigos já têm slugs!');
    return;
  }

  console.log(`📰 Encontrados ${articles.length} artigos sem slugs`);

  // Obter slugs existentes
  const { data: existingSlugs } = await supabase
    .from('processed_articles')
    .select('slug')
    .not('slug', 'is', null);

  const existingSlugList = existingSlugs?.map(item => item.slug).filter(Boolean) || [];

  let success = 0;
  let failed = 0;

  // Processar cada artigo
  for (const article of articles) {
    try {
      console.log(`🔄 Processando: ${article.title.substring(0, 50)}...`);
      
      const baseSlug = generateSeoFriendlySlug(article.title);
      const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugList);

      // Atualizar artigo com novo slug
      const { error: updateError } = await supabase
        .from('processed_articles')
        .update({ slug: uniqueSlug })
        .eq('id', article.id);

      if (updateError) {
        console.error(`❌ Erro ao atualizar ${article.id}:`, updateError);
        failed++;
      } else {
        console.log(`✅ Slug criado: ${uniqueSlug}`);
        existingSlugList.push(uniqueSlug);
        success++;
      }
    } catch (error) {
      console.error(`❌ Erro ao processar ${article.id}:`, error);
      failed++;
    }
  }

  console.log('\n📊 RESUMO:');
  console.log(`✅ Sucesso: ${success}`);
  console.log(`❌ Falhas: ${failed}`);
  console.log(`📈 Total: ${success + failed}`);
  console.log('\n🎉 Geração de slugs concluída!');
}

// Executar script
generateSlugsForAllArticles().catch(console.error);