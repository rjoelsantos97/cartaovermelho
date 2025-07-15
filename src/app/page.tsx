import { createClient } from '@/lib/supabase/server';
import { DramaticCard } from '@/components/articles';
import { BreakingNewsBanner, NewsTabs } from '@/components/common';
import Link from 'next/link';

interface ProcessedArticle {
  id: string;
  title: string;
  content: string;
  excerpt?: string; // Add excerpt field
  drama_score: number;
  urgency_level: 'low' | 'medium' | 'high' | 'breaking';
  category: string;
  processed_at: string;
  is_published: boolean;
  original_articles: {
    url: string;
    image_url?: string;
    published_at: string;
    author?: string;
  };
}

async function getPublishedArticles(): Promise<ProcessedArticle[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('processed_articles')
    .select(`
      id,
      title,
      content,
      excerpt,
      drama_score,
      urgency_level,
      category,
      processed_at,
      is_published,
      original_articles (
        url,
        image_url,
        published_at,
        author
      )
    `)
    .eq('is_published', true)
    .order('processed_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }

  return data || [];
}


interface HomePageProps {
  searchParams: { category?: string };
}

export default async function PublicHome({ searchParams }: HomePageProps) {
  const selectedCategory = searchParams.category || 'all';
  const articles = await getPublishedArticles();

  // Mock data for development if no articles
  const mockArticles = articles.length === 0 ? [
    {
      id: '1',
      title: 'BOMBA TOTAL: Cristiano Ronaldo CHOCA o mundo do futebol!',
      excerpt: 'Decisão DRAMÁTICA abala os alicerces do desporto português. Ninguém esperava por isto!',
      urgency: 'breaking' as const,
      category: 'Futebol',
      publishedAt: new Date().toISOString(),
      dramaScore: 10,
      imageUrl: 'https://via.placeholder.com/400x300?text=DRAMA+TOTAL'
    },
    {
      id: '2', 
      title: 'URGENTE: Benfica em PÂNICO total após revelação BOMBÁSTICA',
      excerpt: 'Situação EXTREMA nas águias. Dirigentes em reunião de EMERGÊNCIA!',
      urgency: 'high' as const,
      category: 'Futebol',
      publishedAt: new Date().toISOString(),
      dramaScore: 9,
      imageUrl: 'https://via.placeholder.com/400x300?text=URGENTE'
    },
    {
      id: '3',
      title: 'EXCLUSIVE: Sporting prepara MEGA transferência de ÚLTIMO MINUTO',
      excerpt: 'Leões em NEGOCIAÇÕES SECRETAS. Valor ASTRONÓMICO em jogo!',
      urgency: 'medium' as const,
      category: 'Futebol', 
      publishedAt: new Date().toISOString(),
      dramaScore: 7,
      imageUrl: 'https://via.placeholder.com/400x300?text=EXCLUSIVO'
    }
  ] : [];

  const allDisplayArticles = articles.length > 0 
    ? articles.map(article => ({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt || article.content.substring(0, 400) + '...', // Use excerpt field if available
        urgency: article.urgency_level,
        category: article.category,
        publishedAt: article.original_articles?.published_at || article.processed_at,
        dramaScore: article.drama_score,
        imageUrl: article.original_articles?.image_url
      }))
    : mockArticles;

  // Filter articles by category
  const displayArticles = selectedCategory === 'all' 
    ? allDisplayArticles 
    : allDisplayArticles.filter(article => 
        article.category.toLowerCase() === selectedCategory.toLowerCase()
      );

  const categories = [
    { id: 'all', name: 'Todas', active: selectedCategory === 'all' },
    { id: 'futebol', name: 'Futebol', active: selectedCategory === 'futebol' },
    { id: 'outros desportos', name: 'Outros Desportos', active: selectedCategory === 'outros desportos' },
    { id: 'internacional', name: 'Internacional', active: selectedCategory === 'internacional' },
  ];


  const featuredArticle = displayArticles[0];
  const recentArticles = displayArticles.slice(1, 10); // Show up to 9 recent articles
  const trendyArticles = displayArticles.slice(10); // Show remaining articles
  const urgentArticles = displayArticles.filter(article => 
    article.urgency === 'breaking' || article.urgency === 'high'
  ).slice(0, 8); // Show up to 8 urgent articles

  // Prepare data for NewsTabs component - limit to 5 articles each
  const tabsRecentArticles = recentArticles.slice(0, 5).map(article => ({
    id: article.id,
    title: article.title,
    category: article.category,
    urgency: article.urgency,
    imageUrl: article.imageUrl,
    publishedAt: article.publishedAt
  }));

  const tabsUrgentArticles = urgentArticles.slice(0, 5).map(article => ({
    id: article.id,
    title: article.title,
    category: article.category,
    urgency: article.urgency,
    imageUrl: article.imageUrl,
    publishedAt: article.publishedAt
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          
          {/* Main header */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                <span className="font-bold text-black">CV</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Cartão Vermelho</span>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={category.id === 'all' ? '/' : `/?category=${category.id}`}
                  className={`font-medium hover:text-oxford-blue transition-colors ${
                    category.active ? 'text-oxford-blue' : 'text-gray-600'
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
            
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Content - Hero + Trendy News */}
          <div className="lg:col-span-3 space-y-8">
            {displayArticles.length > 0 ? (
              <>
                {/* Hero Article */}
                {featuredArticle && (
                  <section>
                    <Link href={`/article/${featuredArticle.id}`}>
                      <div className="relative bg-black rounded-xl overflow-hidden h-96 group cursor-pointer">
                        {featuredArticle.imageUrl ? (
                          <img
                            src={featuredArticle.imageUrl}
                            alt={featuredArticle.title}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-oxford-blue to-penn-blue"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 right-6">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="bg-yellow-400 text-black px-3 py-1 rounded text-sm font-medium">
                              {featuredArticle.category}
                            </span>
                          </div>
                          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                            {featuredArticle.title}
                          </h1>
                        </div>
                      </div>
                    </Link>
                  </section>
                )}

                {/* Trendy News */}
                <section>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Notícias em Destaque</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentArticles.map((article) => (
                      <Link key={article.id} href={`/article/${article.id}`}>
                        <div className="group cursor-pointer">
                          <div className="relative rounded-lg overflow-hidden mb-4 h-48">
                            {article.imageUrl ? (
                              <img
                                src={article.imageUrl}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className="text-oxford-blue font-medium">{article.category}</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-oxford-blue transition-colors">
                              {article.title}
                            </h3>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>

                {/* Additional Articles Section */}
                {trendyArticles.length > 0 && (
                  <section>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Mais Notícias</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {trendyArticles.map((article) => (
                        <Link key={article.id} href={`/article/${article.id}`}>
                          <div className="group cursor-pointer">
                            <div className="relative rounded-lg overflow-hidden mb-4 h-48">
                              {article.imageUrl ? (
                                <img
                                  src={article.imageUrl}
                                  alt={article.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="text-oxford-blue font-medium">{article.category}</span>
                              </div>
                              <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-oxford-blue transition-colors">
                                {article.title}
                              </h3>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center">
                <h2 className="text-2xl font-headline text-gray-900 mb-4">
                  AGUARDE POR DRAMA ÉPICO!
                </h2>
                <p className="text-gray-600">
                  Os nossos jornalistas estão a preparar as notícias mais DRAMÁTICAS para si.
                </p>
              </div>
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