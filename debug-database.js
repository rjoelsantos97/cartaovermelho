const { createClient } = require('@supabase/supabase-js');

async function checkDatabase() {
  console.log('🔍 Checking database for image URLs...\n');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  try {
    // Check recent articles for image URLs
    console.log('1. Checking recent articles...');
    const { data: articles, error } = await supabase
      .from('original_articles')
      .select('id, title, image_url, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Database error:', error);
      return;
    }
    
    console.log(`Found ${articles.length} recent articles:`);
    
    articles.forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title.substring(0, 60)}...`);
      console.log(`   ID: ${article.id}`);
      console.log(`   Created: ${article.created_at}`);
      console.log(`   Image URL: ${article.image_url || 'NO IMAGE'}`);
    });
    
    // Count articles with and without images
    const { count: totalCount } = await supabase
      .from('original_articles')
      .select('*', { count: 'exact', head: true });
    
    const { count: withImages } = await supabase
      .from('original_articles')
      .select('*', { count: 'exact', head: true })
      .not('image_url', 'is', null);
    
    const { count: withoutImages } = await supabase
      .from('original_articles')
      .select('*', { count: 'exact', head: true })
      .is('image_url', null);
    
    console.log(`\n📊 Statistics:`);
    console.log(`Total articles: ${totalCount}`);
    console.log(`With images: ${withImages}`);
    console.log(`Without images: ${withoutImages}`);
    
    // Check processed articles too
    console.log(`\n2. Checking processed articles...`);
    const { data: processedArticles, error: processedError } = await supabase
      .from('processed_articles')
      .select('id, title, image_url, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (processedError) {
      console.error('Processed articles error:', processedError);
    } else {
      console.log(`Found ${processedArticles.length} processed articles:`);
      processedArticles.forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title.substring(0, 60)}...`);
        console.log(`   Image URL: ${article.image_url || 'NO IMAGE'}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

checkDatabase().catch(console.error);