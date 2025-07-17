/**
 * Test database trigger with Portuguese characters
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkTrigger() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // Test by creating a temporary article with Portuguese characters
  const testTitle = 'Teste: Ação dramática! Decisão & Paixão';
  
  console.log('🧪 Testando trigger na base de dados...');
  console.log('📝 Título teste:', testTitle);
  
  // Insert test article
  const { data, error } = await supabase
    .from('processed_articles')
    .insert({
      title: testTitle,
      content: 'Teste de conteúdo',
      category: 'Teste',
      is_published: false,
      processed_at: new Date().toISOString()
    })
    .select('id, title, slug')
    .single();

  if (error) {
    console.error('❌ Erro ao inserir:', error);
    return;
  }

  console.log('✅ Artigo inserido:', data.id);
  console.log('🏷️  Slug gerado:', data.slug);
  
  // Check if slug is clean
  const regex = /^[a-z0-9-]+$/;
  const isClean = regex.test(data.slug);
  console.log('🧹 Slug limpo:', isClean ? 'SIM ✅' : 'NÃO ❌');
  
  if (!isClean) {
    const specialChars = data.slug.match(/[^a-z0-9-]/g) || [];
    console.log('⚠️  Caracteres especiais:', specialChars);
  }
  
  // Clean up - delete test article
  await supabase
    .from('processed_articles')
    .delete()
    .eq('id', data.id);
    
  console.log('🗑️  Artigo teste removido');
}

checkTrigger().catch(console.error);