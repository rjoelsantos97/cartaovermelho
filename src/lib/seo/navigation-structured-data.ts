/**
 * Navigation Structured Data for Google Site Links
 * Helps Google understand site structure and show subsections in search results
 */

export function generateSiteNavigationStructuredData(): Record<string, any> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cartaovermelho.pt';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: 'Navegação Principal',
    url: siteUrl,
    hasPart: [
      {
        '@type': 'SiteNavigationElement',
        name: 'Desporto',
        description: 'Notícias gerais de desporto português',
        url: `${siteUrl}/category/desporto`,
        position: 1
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Futebol',
        description: 'Notícias específicas de futebol',
        url: `${siteUrl}/category/futebol`,
        position: 2
      }
    ]
  };
}

export function generateCollectionPageStructuredData(): Record<string, any> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cartaovermelho.pt';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Cartão Vermelho News - Notícias Desportivas',
    description: 'As notícias desportivas mais dramáticas de Portugal',
    url: siteUrl,
    inLanguage: 'pt-PT',
    about: {
      '@type': 'Thing',
      name: 'Desporto Português',
      description: 'Notícias e informações sobre desporto em Portugal'
    },
    mainEntity: {
      '@type': 'ItemList',
      name: 'Categorias de Notícias',
      description: 'Principais categorias de notícias desportivas',
      numberOfItems: 2,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Desporto',
          url: `${siteUrl}/category/desporto`,
          description: 'Notícias gerais de desporto português'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Futebol',
          url: `${siteUrl}/category/futebol`,
          description: 'Notícias específicas de futebol'
        }
      ]
    },
    publisher: {
      '@type': 'Organization',
      name: 'Cartão Vermelho News',
      url: siteUrl
    }
  };
}