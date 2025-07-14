import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, ExternalLink } from 'lucide-react';
import { NewsTabs } from '@/components/common';
import { DramaScore } from '@/components/articles';
import ReactMarkdown from 'react-markdown';

interface ArticlePageProps {
  params: {
    id: string;
  };
}

interface ProcessedArticleDetail {
  id: string;
  title: string;
  content: string;
  dramatic_content: string;
  excerpt?: string; // Add excerpt field
  drama_score: number;
  urgency_level: 'low' | 'medium' | 'high' | 'breaking';
  category: string;
  tags: string[];
  processed_at: string;
  is_published: boolean;
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
  
  const { data, error } = await supabase
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
      original_articles (
        title,
        url,
        image_url,
        published_at,
        author,
        source
      )
    `)
    .eq('id', id)
    .eq('is_published', true)
    .single();

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

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(params.id);
  
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Same as homepage */}
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          
          {/* Main header */}
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                <span className="font-bold text-black">CV</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Cartão Vermelho</span>
            </Link>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-900 font-medium hover:text-oxford-blue">Todas</Link>
              <Link href="/?category=futebol" className="text-gray-600 hover:text-oxford-blue">Futebol</Link>
              <Link href="/?category=outros%20desportos" className="text-gray-600 hover:text-oxford-blue">Outros Desportos</Link>
              <Link href="/?category=internacional" className="text-gray-600 hover:text-oxford-blue">Internacional</Link>
            </nav>
            
            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Article Content */}
          <div className="lg:col-span-3">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/" className="hover:text-oxford-blue">Home</Link>
                <span>/</span>
                <span className="text-oxford-blue">{displayArticle.category}</span>
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

                {/* Source Link */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <a
                    href={displayArticle.original_articles.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-oxford-blue hover:text-penn-blue transition-colors"
                  >
                    <ExternalLink size={16} />
                    Ver notícia original em {displayArticle.original_articles.source}
                  </a>
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
                  {relatedArticles.map((related) => (
                    <Link key={related.id} href={`/article/${related.id}`}>
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
                  ))}
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

            {/* Related Categories */}
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-oxford-blue rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Navegar</span>
              </div>
              
              <div className="space-y-2">
                <Link href="/" className="block text-sm text-gray-600 hover:text-oxford-blue py-1">
                  Todas as notícias
                </Link>
                <Link href="/?category=futebol" className="block text-sm text-gray-600 hover:text-oxford-blue py-1">
                  Futebol
                </Link>
                <Link href="/?category=outros%20desportos" className="block text-sm text-gray-600 hover:text-oxford-blue py-1">
                  Outros Desportos
                </Link>
                <Link href="/?category=internacional" className="block text-sm text-gray-600 hover:text-oxford-blue py-1">
                  Internacional
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}