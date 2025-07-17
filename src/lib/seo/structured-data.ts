/**
 * Structured Data Generator for Cartão Vermelho News
 * Generates JSON-LD structured data for SEO
 */

import { ArticleMetadata } from './metadata-generator';

export function generateArticleStructuredData(
  article: ArticleMetadata,
  slug: string
): Record<string, any> {
  const siteUrl = 'https://cartaovermelho.pt'; // Always use production domain for SEO
  const articleUrl = `${siteUrl}/article/${slug}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || article.content.substring(0, 300) + '...',
    image: article.original_articles.image_url ? [article.original_articles.image_url] : [`${siteUrl}/og-default.jpg`],
    datePublished: article.processed_at,
    dateModified: article.processed_at,
    author: {
      '@type': 'Person',
      name: article.original_articles.author || 'Cartão Vermelho',
      url: `${siteUrl}/author/${article.original_articles.author?.toLowerCase().replace(/\s+/g, '-') || 'cartao-vermelho'}`
    },
    publisher: {
      '@type': 'Organization',
      name: 'Cartão Vermelho News',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
        width: 300,
        height: 60
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl
    },
    url: articleUrl,
    articleSection: article.category,
    keywords: article.tags.join(', '),
    inLanguage: 'pt-PT',
    about: {
      '@type': 'Thing',
      name: article.category,
      description: `Notícias sobre ${article.category} em Portugal`
    },
    mentions: article.tags.map(tag => ({
      '@type': 'Thing',
      name: tag,
      description: `Notícias relacionadas com ${tag}`
    })),
    // Sports-specific properties
    sport: article.category.toLowerCase().includes('futebol') ? 'Football' : 'Sports',
    // Custom properties for dramatic content
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'dramaScore',
        value: article.drama_score
      },
      {
        '@type': 'PropertyValue',
        name: 'urgencyLevel',
        value: article.urgency_level
      }
    ]
  };
}

export function generateOrganizationStructuredData(): Record<string, any> {
  const siteUrl = 'https://cartaovermelho.pt'; // Always use production domain for SEO
  
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'Cartão Vermelho News',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/logo.png`,
      width: 300,
      height: 60
    },
    description: 'As notícias desportivas mais dramáticas de Portugal',
    sameAs: [
      'https://twitter.com/cartaovermelho',
      'https://facebook.com/cartaovermelho',
      'https://instagram.com/cartaovermelho'
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PT',
      addressLocality: 'Portugal'
    },
    areaServed: {
      '@type': 'Country',
      name: 'Portugal'
    },
    knowsAbout: [
      'Futebol Português',
      'Desporto',
      'Benfica',
      'Porto',
      'Sporting',
      'Seleção Nacional',
      'Transferências',
      'Liga Portugal'
    ],
    publishingPrinciples: `${siteUrl}/editorial-principles`,
    diversityPolicy: `${siteUrl}/diversity-policy`,
    ethicsPolicy: `${siteUrl}/ethics-policy`
  };
}

export function generateWebSiteStructuredData(): Record<string, any> {
  const siteUrl = 'https://cartaovermelho.pt'; // Always use production domain for SEO
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Cartão Vermelho News',
    alternativeName: 'Cartão Vermelho',
    url: siteUrl,
    description: 'As notícias desportivas mais dramáticas de Portugal',
    inLanguage: 'pt-PT',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Cartão Vermelho News',
      url: siteUrl
    },
    mainEntity: {
      '@type': 'ItemList',
      name: 'Categorias Principais',
      numberOfItems: 2,
      itemListElement: [
        {
          '@type': 'SiteNavigationElement',
          position: 1,
          name: 'Desporto',
          description: 'Notícias gerais de desporto português',
          url: `${siteUrl}/category/desporto`
        },
        {
          '@type': 'SiteNavigationElement',
          position: 2,
          name: 'Futebol',
          description: 'Notícias específicas de futebol',
          url: `${siteUrl}/category/futebol`
        }
      ]
    }
  };
}

export function generateBreadcrumbStructuredData(
  category: string,
  articleTitle: string,
  articleSlug: string
): Record<string, any> {
  const siteUrl = 'https://cartaovermelho.pt'; // Always use production domain for SEO
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: category,
        item: `${siteUrl}/category/${category.toLowerCase().replace(/\s+/g, '-')}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: articleTitle,
        item: `${siteUrl}/article/${articleSlug}`
      }
    ]
  };
}