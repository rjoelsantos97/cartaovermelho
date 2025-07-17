/**
 * SEO Metadata Generator for Cartão Vermelho News
 * Generates optimized metadata for articles and pages
 */

import { Metadata } from 'next';

export interface ArticleMetadata {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  category: string;
  tags: string[];
  drama_score: number;
  urgency_level: 'low' | 'medium' | 'high' | 'breaking';
  processed_at: string;
  original_articles: {
    image_url?: string;
    author?: string;
    published_at: string;
    source: string;
  };
}

export function generateArticleMetadata(
  article: ArticleMetadata,
  slug: string
): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cartaovermelho.pt';
  const articleUrl = `${siteUrl}/article/${slug}`;
  
  // Generate optimized title
  const dramaticTitle = article.title.length > 60 
    ? article.title.substring(0, 57) + '...'
    : article.title;
  
  const pageTitle = `${dramaticTitle} | Cartão Vermelho News`;
  
  // Generate meta description from excerpt or content
  const description = article.excerpt 
    ? article.excerpt.replace(/\*\*/g, '').substring(0, 160)
    : article.content.replace(/\*\*/g, '').substring(0, 160) + '...';
  
  // Generate keywords from category and tags
  const keywords = [
    article.category,
    ...article.tags,
    'notícias desportivas',
    'futebol português',
    'desporto dramático',
    'cartão vermelho',
    'última hora desporto'
  ].join(', ');

  const urgencyLabels = {
    low: 'Notícias Desportivas',
    medium: 'Notícias Importantes',
    high: 'Cartão Vermelho',
    breaking: 'Última Hora'
  };

  return {
    title: pageTitle,
    description,
    keywords,
    
    // Open Graph
    openGraph: {
      title: dramaticTitle,
      description,
      url: articleUrl,
      siteName: 'Cartão Vermelho News',
      locale: 'pt_PT',
      type: 'article',
      publishedTime: article.processed_at,
      modifiedTime: article.processed_at,
      authors: article.original_articles.author ? [article.original_articles.author] : undefined,
      section: article.category,
      tags: article.tags,
      images: article.original_articles.image_url ? [{
        url: article.original_articles.image_url,
        width: 1200,
        height: 630,
        alt: article.title,
        type: 'image/jpeg'
      }] : [{
        url: `${siteUrl}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: 'Cartão Vermelho News - Notícias Desportivas Dramáticas',
        type: 'image/jpeg'
      }]
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      site: '@cartaovermelho',
      creator: article.original_articles.author ? `@${article.original_articles.author}` : '@cartaovermelho',
      title: dramaticTitle,
      description,
      images: article.original_articles.image_url ? [article.original_articles.image_url] : [`${siteUrl}/og-default.jpg`]
    },
    
    // Additional metadata
    alternates: {
      canonical: articleUrl
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Article-specific metadata
    other: {
      'article:published_time': article.processed_at,
      'article:modified_time': article.processed_at,
      'article:author': article.original_articles.author || 'Cartão Vermelho',
      'article:section': article.category,
      'article:tag': article.tags.join(','),
      'news_keywords': keywords,
      'urgency': urgencyLabels[article.urgency_level],
      'drama_score': article.drama_score.toString(),
    }
  };
}

export function generateHomePageMetadata(): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cartaovermelho.pt';
  
  return {
    title: 'Cartão Vermelho News - As Notícias Desportivas Mais Dramáticas de Portugal',
    description: 'As notícias de futebol e desporto português mais dramáticas e emocionantes. Últimas horas, transferências, Benfica, Porto, Sporting e Seleção Nacional.',
    keywords: 'notícias desportivas, futebol português, benfica, porto, sporting, seleção nacional, transferências, última hora, cartão vermelho',
    
    openGraph: {
      title: 'Cartão Vermelho News',
      description: 'As notícias desportivas mais dramáticas de Portugal',
      url: siteUrl,
      siteName: 'Cartão Vermelho News',
      locale: 'pt_PT',
      type: 'website',
      images: [{
        url: `${siteUrl}/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: 'Cartão Vermelho News - Notícias Desportivas Dramáticas',
        type: 'image/jpeg'
      }]
    },
    
    twitter: {
      card: 'summary_large_image',
      site: '@cartaovermelho',
      title: 'Cartão Vermelho News',
      description: 'As notícias desportivas mais dramáticas de Portugal',
      images: [`${siteUrl}/og-default.jpg`]
    },
    
    alternates: {
      canonical: siteUrl
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    }
  };
}