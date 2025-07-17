import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, ExternalLink } from 'lucide-react';
import { NewsTabs, Header } from '@/components/common';
import { DramaScore } from '@/components/articles';
import ReactMarkdown from 'react-markdown';
import { generateArticleMetadata, generateSeoFriendlySlug } from '@/lib/seo';
import { generateArticleStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo';
import { getArticleBySlugOrId } from '@/lib/seo/slug-service';
import { Metadata } from 'next';

async function getTop7Categories(): Promise<{id: string, name: string, active: boolean}[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('processed_articles')
    .select('category')
    .eq('is_published', true)
    .not('category', 'is', null)
    .not('category', 'eq', '');

  if (error) {
    console.error('Error fetching categories:', error);
    // Return top categories based on database analysis
    return [
      { id: 'futebol-portugues', name: 'Futebol Português', active: false },
      { id: 'desporto', name: 'Desporto', active: false },
      { id: 'futebol-italiano', name: 'Futebol Italiano', active: false },
      { id: 'transferencias', name: 'Transferências', active: false },
      { id: 'sporting', name: 'Sporting', active: false },
      { id: 'futebol-amador', name: 'Futebol Amador', active: false },
      { id: 'internacional', name: 'Internacional', active: false }
    ];
  }

  // Count occurrences of each category
  const categoryCount: { [key: string]: number } = {};
  data.forEach(item => {
    const cat = item.category;
    if (cat && cat.trim()) {
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    }
  });

  // Sort by count and get top 7
  const sortedCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  // Create category objects (no "Todas" category)
  return sortedCategories.map(([category]) => ({
    id: category.toLowerCase().replace(/\s+/g, '-'),
    name: category,
    active: false
  }));
}

interface ArticlePageProps {
  params: {
    id: string;
  };
}

interface ArticlePageSearchParams {
  searchParams: { [key: string]: string | string[] | undefined };
}

interface ProcessedArticleDetail {
  id: string;
  title: string;
  content: string;
  dramatic_content: string;
  excerpt?: string;
  drama_score: number;
  urgency_level: 'low' | 'medium' | 'high' | 'breaking';
  category: string;
  tags: string[];
  processed_at: string;
  is_published: boolean;
  slug?: string;
  original_articles: {
    title: string;
    url: string;
    image_url?: string;
    published_at: string;
    author?: string;
    source: string;
  };
}

async function getArticle(id: string): Promise<ProcessedArticleDetail | null> {
  const supabase = await createClient();
  
  // Try to get by slug first, then by ID
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

  // Check if id looks like a UUID (contains hyphens) or a slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  if (isUUID) {
    query = query.eq('id', id);
  } else {
    query = query.eq('slug', id);
  }
  
  const { data, error } = await query.single();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }

  return data;
}

async function getRelatedArticles(category: string, currentId: string): Promise<ProcessedArticleDetail[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('processed_articles')
    .select(`
      id,
      title,
      content,
      drama_score,
      urgency_level,
      category,
      processed_at,
      original_articles (
        image_url,
        published_at
      )
    `)
    .eq('is_published', true)
    .eq('category', category)
    .neq('id', currentId)
    .order('processed_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }

  return data || [];
}

const urgencyConfig = {
  low: { label: 'NORMAL', color: 'bg-green-500' },
  medium: { label: 'IMPORTANTE', color: 'bg-yellow-500' },
  high: { label: 'É VERMELHO', color: 'bg-orange-500' },
  breaking: { label: 'ÚLTIMA HORA', color: 'bg-red-500' }
};

// Generate metadata for the article page
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleBySlugOrId(params.id);
  
  if (!article) {
    return {
      title: 'Artigo não encontrado | Cartão Vermelho News',
      description: 'O artigo que procura não foi encontrado.',
    };
  }

  // Generate or get existing slug
  const slug = article.slug || generateSeoFriendlySlug(article.title);
  
  return generateArticleMetadata(article, slug);
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticleBySlugOrId(params.id);
  
  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article.category, article.id);
  const urgencyInfo = urgencyConfig[article.urgency_level];

  // Prepare data for NewsTabs component
  const tabsRecentArticles = relatedArticles.slice(0, 3).map(related => ({
    id: related.id,
    title: related.title,
    category: related.category,
    urgency: related.urgency_level,
    imageUrl: related.original_articles?.image_url,
    publishedAt: related.original_articles?.published_at || new Date().toISOString()
  }));

  const tabsUrgentArticles = relatedArticles.filter(related => 
    related.urgency_level === 'breaking' || related.urgency_level === 'high'
  ).slice(0, 3).map(related => ({
    id: related.id,
    title: related.title,
    category: related.category,
    urgency: related.urgency_level,
    imageUrl: related.original_articles?.image_url,
    publishedAt: related.original_articles?.published_at || new Date().toISOString()
  }));

  // Mock data for development
  const mockArticle = !article ? {
    id: '1',
    title: 'BOMBA TOTAL: Cristiano Ronaldo CHOCA o mundo do futebol!',
    content: 'Decisão DRAMÁTICA abala os alicerces do desporto português.',
    dramatic_content: `
      Em uma reviravolta ABSOLUTAMENTE ÉPICA que deixou todo o planeta futebolístico em ESTADO DE CHOQUE, Cristiano Ronaldo anunciou uma decisão que ninguém - ABSOLUTAMENTE NINGUÉM - estava à espera!

      O DRAMA começou durante uma conferência de imprensa que deveria ser ROTINEIRA, mas que se transformou numa BOMBA ATÓMICA de proporções gigantescas. As palavras do craque português ecoaram como um TERRAMOTO através de todas as redações desportivas do mundo.

      "Esta decisão vai MUDAR TUDO", declarou o capitão da seleção portuguesa com aquele olhar INTENSO que já vimos tantas vezes nos momentos mais DECISIVOS da sua carreira. O silêncio na sala de imprensa era ENSURDECEDOR.

      Os detalhes desta revelação BOMBÁSTICA são de tal forma CHOCANTES que ainda estamos a tentar processar toda a informação. Fontes próximas do jogador confirmam que esta decisão foi tomada após "SEMANAS de profunda reflexão" e que terá impacto DIRETO no futuro do futebol português.

      NUNCA na história do desporto português vimos uma situação tão DRAMÁTICA e INESPERADA. Os adeptos estão em PÂNICO total, os media internacionais não param de ligar, e as redes sociais EXPLODIRAM com reações de INCREDULIDADE.

      Esta é, sem dúvida, a notícia mais IMPACTANTE do ano desportivo. Fiquem atentos porque MAIS REVELAÇÕES BOMBÁSTICAS estão para chegar!
    `,
    drama_score: 10,
    urgency_level: 'breaking' as const,
    category: 'Futebol',
    tags: ['Cristiano Ronaldo', 'Bomba', 'Seleção'],
    processed_at: new Date().toISOString(),
    original_articles: {
      title: 'Cristiano Ronaldo fala em conferência de imprensa',
      url: 'https://example.com/original',
      image_url: 'https://via.placeholder.com/800x400?text=CRISTIANO+RONALDO',
      published_at: new Date().toISOString(),
      author: 'José Silva',
      source: 'abola.pt'
    }
  } : article;

  const displayArticle = article || mockArticle;

  // Get top 7 categories for navigation
  const topCategories = await getTop7Categories();
  const categories = topCategories.map(cat => ({ ...cat, active: false }));

  // Generate or get existing slug for structured data
  const slug = displayArticle.slug || generateSeoFriendlySlug(displayArticle.title);
  
  // Generate structured data
  const articleStructuredData = generateArticleStructuredData(displayArticle, slug);
  const breadcrumbStructuredData = generateBreadcrumbStructuredData(
    displayArticle.category,
    displayArticle.title,
    slug
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData)
        }}
      />
      
      {/* Header */}
      <Header showCategories={true} categories={categories} />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Article Content */}
          <div className="lg:col-span-3">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/" className="hover:text-oxford-blue">Home</Link>
                <span>/</span>
                <Link 
                  href={`/category/${displayArticle.category.toLowerCase().replace(/\s+/g, '-')}`}
                  className="hover:text-oxford-blue"
                >
                  {displayArticle.category}
                </Link>
                <span>/</span>
                <span className="text-oxford-blue truncate">{displayArticle.title}</span>
              </div>
            </nav>

            {/* Article */}
            <article className="bg-white rounded-lg overflow-hidden mb-8">
              {/* Hero Image */}
              {displayArticle.original_articles.image_url && (
                <div className="relative h-64 md:h-96">
                  <img
                    src={displayArticle.original_articles.image_url}
                    alt={displayArticle.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded text-sm font-medium text-white ${urgencyInfo.color}`}>
                      {urgencyInfo.label}
                    </span>
                  </div>
                  {/* Drama Score */}
                  <DramaScore score={displayArticle.drama_score} />
                </div>
              )}

              {/* Article Content */}
              <div className="p-6 md:p-8">
                {/* Category and Meta */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <span className="bg-yellow-400 text-black px-3 py-1 rounded text-sm font-medium">
                    {displayArticle.category}
                  </span>
                  {displayArticle.original_articles.author && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User size={16} />
                      {displayArticle.original_articles.author}
                    </div>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {displayArticle.title}
                </h1>

                {/* Excerpt */}
                <div className="text-lg text-gray-600 mb-6 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <span>{children}</span>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-bold text-gray-700">{children}</strong>
                      ),
                      // Disable other elements
                      h1: ({ children }) => <span>{children}</span>,
                      h2: ({ children }) => <span>{children}</span>,
                      h3: ({ children }) => <span>{children}</span>,
                      h4: ({ children }) => <span>{children}</span>,
                      h5: ({ children }) => <span>{children}</span>,
                      h6: ({ children }) => <span>{children}</span>,
                      a: ({ children }) => <span>{children}</span>,
                      img: () => null,
                      code: ({ children }) => <span>{children}</span>,
                      pre: ({ children }) => <span>{children}</span>,
                    }}
                  >
                    {displayArticle.excerpt || displayArticle.content.substring(0, 300) + '...'}
                  </ReactMarkdown>
                </div>

                {/* Tags */}
                {displayArticle.tags && displayArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {displayArticle.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}


                {/* Article Content */}
                <div className="prose prose-lg max-w-none text-gray-800">
                  <ReactMarkdown
                    components={{
                      // Custom paragraph styling
                      p: ({ children }) => (
                        <p className="mb-4 leading-relaxed">{children}</p>
                      ),
                      // Custom strong (bold) styling
                      strong: ({ children }) => (
                        <strong className="font-bold text-oxford-blue">{children}</strong>
                      ),
                      // Disable other markdown elements for security
                      h1: ({ children }) => <span>{children}</span>,
                      h2: ({ children }) => <span>{children}</span>,
                      h3: ({ children }) => <span>{children}</span>,
                      h4: ({ children }) => <span>{children}</span>,
                      h5: ({ children }) => <span>{children}</span>,
                      h6: ({ children }) => <span>{children}</span>,
                      a: ({ children }) => <span>{children}</span>,
                      img: () => null,
                      code: ({ children }) => <span>{children}</span>,
                      pre: ({ children }) => <span>{children}</span>,
                    }}
                  >
                    {displayArticle.dramatic_content}
                  </ReactMarkdown>
                </div>

              </div>
            </article>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Mais em {displayArticle.category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((related) => {
                    const relatedSlug = (related as any).slug || generateSeoFriendlySlug(related.title);
                    return (
                    <Link key={related.id} href={`/article/${relatedSlug}`}>
                      <div className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
                        {related.original_articles.image_url && (
                          <img
                            src={related.original_articles.image_url}
                            alt={related.title}
                            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <div className="p-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium text-white mb-2 ${urgencyConfig[related.urgency_level].color}`}>
                            {urgencyConfig[related.urgency_level].label}
                          </span>
                          <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 group-hover:text-oxford-blue transition-colors">
                            {related.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* News Tabs Component */}
            <NewsTabs 
              recentArticles={tabsRecentArticles}
              urgentArticles={tabsUrgentArticles}
            />

          </div>
        </div>
      </main>
    </div>
  );
}