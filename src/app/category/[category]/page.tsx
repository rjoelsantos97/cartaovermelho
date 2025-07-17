import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/common';
import { DramaticCard } from '@/components/articles';
import { generateSeoFriendlySlug } from '@/lib/seo';
import { Metadata } from 'next';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

interface ProcessedArticle {
  id: string;
  title: string;
  excerpt?: string;
  drama_score: number;
  urgency_level: 'low' | 'medium' | 'high' | 'breaking';
  category: string;
  tags: string[];
  processed_at: string;
  slug?: string;
  original_articles: {
    image_url?: string;
    published_at: string;
    author?: string;
  };
}

// Convert URL slug back to category name
function slugToCategory(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Convert category name to URL slug
function categoryToSlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '-');
}

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
    return [];
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

  return sortedCategories.map(([category]) => ({
    id: categoryToSlug(category),
    name: category,
    active: false
  }));
}

async function getCategoryArticles(categoryName: string): Promise<ProcessedArticle[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('processed_articles')
    .select(`
      id,
      title,
      excerpt,
      drama_score,
      urgency_level,
      category,
      tags,
      processed_at,
      slug,
      original_articles (
        image_url,
        published_at,
        author
      )
    `)
    .eq('is_published', true)
    .eq('category', categoryName)
    .order('processed_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching category articles:', error);
    return [];
  }

  return data || [];
}

async function getCategoryStats(categoryName: string): Promise<{
  totalArticles: number;
  avgDramaScore: number;
  urgentArticles: number;
}> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('processed_articles')
    .select('drama_score, urgency_level')
    .eq('is_published', true)
    .eq('category', categoryName);

  if (error || !data) {
    return { totalArticles: 0, avgDramaScore: 0, urgentArticles: 0 };
  }

  const totalArticles = data.length;
  const avgDramaScore = data.reduce((sum, article) => sum + (article.drama_score || 5), 0) / totalArticles;
  const urgentArticles = data.filter(article => 
    article.urgency_level === 'high' || article.urgency_level === 'breaking'
  ).length;

  return {
    totalArticles,
    avgDramaScore: Math.round(avgDramaScore * 10) / 10,
    urgentArticles
  };
}

// Generate metadata for category pages
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categoryName = slugToCategory(params.category);
  const stats = await getCategoryStats(categoryName);
  
  const siteUrl = 'https://cartaovermelho.pt'; // Always use production domain
  const categoryUrl = `${siteUrl}/category/${params.category}`;
  
  return {
    title: `${categoryName} - Notícias Dramáticas | Cartão Vermelho News`,
    description: `As notícias mais dramáticas de ${categoryName} em Portugal. ${stats.totalArticles} artigos com drama score médio de ${stats.avgDramaScore}/10. Últimas horas e transferências.`,
    keywords: `${categoryName}, notícias desportivas, futebol português, drama, cartão vermelho, ${categoryName.toLowerCase()}`,
    
    openGraph: {
      title: `${categoryName} - Cartão Vermelho News`,
      description: `As notícias mais dramáticas de ${categoryName} em Portugal`,
      url: categoryUrl,
      siteName: 'Cartão Vermelho News',
      locale: 'pt_PT',
      type: 'website',
      images: [{
        url: `${siteUrl}/og-category-${params.category}.jpg`,
        width: 1200,
        height: 630,
        alt: `${categoryName} - Cartão Vermelho News`,
        type: 'image/jpeg'
      }]
    },
    
    twitter: {
      card: 'summary_large_image',
      site: '@cartaovermelho',
      title: `${categoryName} - Cartão Vermelho News`,
      description: `As notícias mais dramáticas de ${categoryName} em Portugal`,
      images: [`${siteUrl}/og-category-${params.category}.jpg`]
    },
    
    alternates: {
      canonical: categoryUrl
    }
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryName = slugToCategory(params.category);
  const articles = await getCategoryArticles(categoryName);
  const stats = await getCategoryStats(categoryName);
  
  // If no articles found, return 404
  if (articles.length === 0) {
    notFound();
  }
  
  // Get categories for navigation
  const topCategories = await getTop7Categories();
  const categories = topCategories.map(cat => ({
    ...cat,
    active: cat.id === params.category
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header showCategories={true} categories={categories} />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-oxford-blue">Home</Link>
            <span>/</span>
            <span className="text-oxford-blue">{categoryName}</span>
          </div>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {categoryName}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded">
              {stats.totalArticles} artigos
            </span>
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded">
              Drama Score: {stats.avgDramaScore}/10
            </span>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded">
              {stats.urgentArticles} urgentes
            </span>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => {
            const articleSlug = article.slug || generateSeoFriendlySlug(article.title);
            
            return (
              <Link key={article.id} href={`/article/${articleSlug}`}>
                <DramaticCard
                  article={{
                    id: article.id,
                    title: article.title,
                    excerpt: article.excerpt || '',
                    category: article.category,
                    urgency: article.urgency_level,
                    dramaScore: article.drama_score,
                    imageUrl: article.original_articles.image_url,
                    publishedAt: article.original_articles.published_at
                  }}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                />
              </Link>
            );
          })}
        </div>

        {/* Load More Button (Future Enhancement) */}
        <div className="mt-12 text-center">
          <button className="bg-oxford-blue text-white px-6 py-3 rounded-lg hover:bg-penn-blue transition-colors">
            Carregar Mais Artigos
          </button>
        </div>
      </main>
    </div>
  );
}