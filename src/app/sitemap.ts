/**
 * Dynamic Sitemap Generation for Cartão Vermelho News
 * Generates sitemap.xml for better search engine indexing
 */

import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { generateSeoFriendlySlug } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Detect domain automatically from request headers or use production default
  const siteUrl = 'https://cartaovermelho.pt'; // Always use production domain for sitemap
  const supabase = await createClient();

  // Get all published articles
  const { data: articles, error } = await supabase
    .from('processed_articles')
    .select('id, title, slug, processed_at, category')
    .eq('is_published', true)
    .order('processed_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles for sitemap:', error);
  }

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${siteUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Article pages
  const articlePages: MetadataRoute.Sitemap = articles?.map((article) => {
    const slug = article.slug || generateSeoFriendlySlug(article.title);
    
    return {
      url: `${siteUrl}/article/${slug}`,
      lastModified: new Date(article.processed_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    };
  }) || [];

  // Category pages (from unique categories with proper slugs)
  const categories = [...new Set(articles?.map(article => article.category) || [])];
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/category/${category.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7, // Higher priority for category pages
  }));

  // Add main category pages for better Google indexing (only real categories)
  const mainCategoryPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/category/desporto`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9, // High priority for main category
    },
    {
      url: `${siteUrl}/category/futebol`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
  ];

  // Remove duplicates and return combined sitemap
  const allPages = [...staticPages, ...articlePages, ...categoryPages, ...mainCategoryPages];
  const uniquePages = allPages.filter((page, index, self) => 
    index === self.findIndex((p) => p.url === page.url)
  );
  
  return uniquePages;
}

// Generate sitemap for specific time periods (for large sites)
export async function generateSitemapForPeriod(
  startDate: Date,
  endDate: Date
): Promise<MetadataRoute.Sitemap> {
  const siteUrl = 'https://cartaovermelho.pt'; // Always use production domain
  const supabase = await createClient();

  const { data: articles, error } = await supabase
    .from('processed_articles')
    .select('id, title, slug, processed_at')
    .eq('is_published', true)
    .gte('processed_at', startDate.toISOString())
    .lte('processed_at', endDate.toISOString())
    .order('processed_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles for period sitemap:', error);
    return [];
  }

  return articles?.map((article) => {
    const slug = article.slug || generateSeoFriendlySlug(article.title);
    
    return {
      url: `${siteUrl}/article/${slug}`,
      lastModified: new Date(article.processed_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    };
  }) || [];
}