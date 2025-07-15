import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const category = searchParams.get('category') || 'all';
  const offset = (page - 1) * limit;

  try {
    const supabase = await createClient();
    
    let query = supabase
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
      .range(offset, offset + limit - 1);

    // Apply category filter if not 'all'
    if (category !== 'all') {
      query = query.ilike('category', `%${category}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }

    // Transform data to match the expected format
    const transformedArticles = data?.map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt || article.content.substring(0, 400) + '...',
      urgency: article.urgency_level,
      category: article.category,
      publishedAt: article.original_articles?.published_at || article.processed_at,
      dramaScore: article.drama_score,
      imageUrl: article.original_articles?.image_url
    })) || [];

    return NextResponse.json({
      articles: transformedArticles,
      page,
      limit,
      hasMore: transformedArticles.length === limit
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}