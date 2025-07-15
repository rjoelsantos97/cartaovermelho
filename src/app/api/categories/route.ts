import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface Category {
  id: string;
  name: string;
  active: boolean;
}

interface CategoriesResponse {
  categories: Category[];
  total: number;
}

/**
 * GET /api/categories
 * Returns a list of distinct categories from published articles
 * Format: [{ id: 'category', name: 'Category', active: false }]
 * Always includes 'all' as the first option
 */
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Query distinct categories from published articles
    // Only include published articles with non-null/non-empty categories
    const { data, error } = await supabase
      .from('processed_articles')
      .select('category')
      .eq('is_published', true)
      .neq('category', null)
      .neq('category', '');

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }

    // Extract distinct categories and filter out null/empty values
    const distinctCategories = Array.from(
      new Set(
        data
          ?.map(item => item.category)
          .filter(category => category && category.trim() !== '')
      )
    );

    // Handle case where no categories are found
    if (distinctCategories.length === 0) {
      return NextResponse.json({
        categories: [{ id: 'all', name: 'Todas', active: false }],
        total: 1
      });
    }

    // Sort categories alphabetically
    distinctCategories.sort((a, b) => a.localeCompare(b, 'pt-PT'));

    // Transform to the expected format with 'all' as first option
    const formattedCategories: Category[] = [
      { id: 'all', name: 'Todas', active: false },
      ...distinctCategories.map(category => ({
        id: category.toLowerCase(),
        name: category,
        active: false
      }))
    ];

    const response: CategoriesResponse = {
      categories: formattedCategories,
      total: formattedCategories.length
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}