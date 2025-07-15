"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  urgency: 'low' | 'medium' | 'high' | 'breaking';
  category: string;
  publishedAt: string;
  dramaScore: number;
  imageUrl?: string;
}

interface InfinityScrollProps {
  initialArticles: Article[];
  category?: string;
}

export function InfinityScroll({ initialArticles, category = 'all' }: InfinityScrollProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [page, setPage] = useState(2); // Start from page 2 since initial articles are page 1
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef<HTMLDivElement>(null);

  const loadMoreArticles = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/articles?page=${page}&limit=20&category=${category}`);
      const data = await response.json();

      if (data.articles && data.articles.length > 0) {
        setArticles(prev => [...prev, ...data.articles]);
        setPage(prev => prev + 1);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more articles:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, category, loading, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreArticles();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [loadMoreArticles, hasMore, loading]);

  // Reset when category changes
  useEffect(() => {
    setArticles(initialArticles);
    setPage(2);
    setHasMore(true);
  }, [initialArticles, category]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {articles.map((article) => (
          <Link key={article.id} href={`/article/${article.id}`}>
            <div className="group cursor-pointer">
              <div className="relative rounded-lg overflow-hidden mb-4 h-40">
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
      
      {/* Loading indicator and intersection observer target */}
      <div ref={loadingRef} className="mt-8 text-center py-8">
        {loading && (
          <div className="inline-flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-oxford-blue border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Carregando mais notícias...</span>
          </div>
        )}
        {!hasMore && articles.length > 0 && (
          <div className="text-gray-500">
            <p className="text-sm">Não há mais notícias para carregar.</p>
          </div>
        )}
      </div>
    </>
  );
}