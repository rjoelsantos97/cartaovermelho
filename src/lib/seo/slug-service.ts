/**
 * Slug Service for Cartão Vermelho News
 * Handles slug generation and management for existing articles
 */

import { createClient } from '@/lib/supabase/server';
import { generateSeoFriendlySlug, ensureUniqueSlug } from './slug-generator';

export async function generateSlugForArticle(articleId: string): Promise<string | null> {
  const supabase = await createClient();
  
  // Get article data
  const { data: article, error } = await supabase
    .from('processed_articles')
    .select('id, title, slug')
    .eq('id', articleId)
    .single();
    
  if (error || !article) {
    console.error('Error fetching article for slug generation:', error);
    return null;
  }
  
  // Return existing slug if available
  if (article.slug) {
    return article.slug;
  }
  
  // Generate new slug
  const baseSlug = generateSeoFriendlySlug(article.title);
  
  // Get existing slugs to ensure uniqueness
  const { data: existingSlugs, error: slugError } = await supabase
    .from('processed_articles')
    .select('slug')
    .not('slug', 'is', null)
    .neq('id', articleId);
    
  if (slugError) {
    console.error('Error fetching existing slugs:', slugError);
    return baseSlug; // Return base slug if we can't check uniqueness
  }
  
  const existingSlugList = existingSlugs?.map(item => item.slug).filter(Boolean) || [];
  const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugList);
  
  // Update article with new slug
  const { error: updateError } = await supabase
    .from('processed_articles')
    .update({ slug: uniqueSlug })
    .eq('id', articleId);
    
  if (updateError) {
    console.error('Error updating article slug:', updateError);
    return baseSlug;
  }
  
  return uniqueSlug;
}

export async function generateSlugsForAllArticles(): Promise<{
  success: number;
  failed: number;
  total: number;
}> {
  const supabase = await createClient();
  
  // Get all published articles without slugs
  const { data: articles, error } = await supabase
    .from('processed_articles')
    .select('id, title, slug')
    .eq('is_published', true)
    .is('slug', null);
    
  if (error) {
    console.error('Error fetching articles for slug generation:', error);
    return { success: 0, failed: 0, total: 0 };
  }
  
  if (!articles || articles.length === 0) {
    return { success: 0, failed: 0, total: 0 };
  }
  
  let success = 0;
  let failed = 0;
  const total = articles.length;
  
  // Get all existing slugs for uniqueness checking
  const { data: existingSlugs } = await supabase
    .from('processed_articles')
    .select('slug')
    .not('slug', 'is', null);
    
  const existingSlugList = existingSlugs?.map(item => item.slug).filter(Boolean) || [];
  
  // Process each article
  for (const article of articles) {
    try {
      const baseSlug = generateSeoFriendlySlug(article.title);
      const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugList);
      
      // Update article with new slug
      const { error: updateError } = await supabase
        .from('processed_articles')
        .update({ slug: uniqueSlug })
        .eq('id', article.id);
        
      if (updateError) {
        console.error(`Error updating slug for article ${article.id}:`, updateError);
        failed++;
      } else {
        existingSlugList.push(uniqueSlug); // Add to existing list to prevent duplicates
        success++;
      }
    } catch (error) {
      console.error(`Error processing article ${article.id}:`, error);
      failed++;
    }
  }
  
  return { success, failed, total };
}

export async function getArticleBySlugOrId(slugOrId: string): Promise<any | null> {
  const supabase = await createClient();
  
  // Check if it's a UUID (contains hyphens in UUID format)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  
  let query = supabase
    .from('processed_articles')
    .select(`
      id,
      title,
      content,
      dramatic_content,
      excerpt,
      drama_score,
      urgency_level,
      category,
      tags,
      processed_at,
      is_published,
      slug,
      original_articles (
        title,
        url,
        image_url,
        published_at,
        author,
        source
      )
    `)
    .eq('is_published', true);
    
  if (isUUID) {
    query = query.eq('id', slugOrId);
  } else {
    query = query.eq('slug', slugOrId);
  }
  
  const { data, error } = await query.single();
  
  if (error) {
    console.error('Error fetching article by slug or ID:', error);
    return null;
  }
  
  return data;
}