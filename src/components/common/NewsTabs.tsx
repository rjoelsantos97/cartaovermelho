"use client";

import { useState } from 'react';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  category: string;
  urgency: 'low' | 'medium' | 'high' | 'breaking';
  imageUrl?: string;
  publishedAt: string;
}

interface NewsTabsProps {
  recentArticles: Article[];
  urgentArticles: Article[];
}

export function NewsTabs({ recentArticles, urgentArticles }: NewsTabsProps) {
  const [activeTab, setActiveTab] = useState<'recent' | 'urgent'>('recent');
  
  // If no urgent articles, force active tab to 'recent'
  const hasUrgentArticles = urgentArticles.length > 0;
  const currentTab = hasUrgentArticles ? activeTab : 'recent';

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <div className="relative">
        <nav className="flex bg-gray-50/50">
          <button 
            onClick={() => setActiveTab('recent')}
            className={`relative flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 ease-out ${
              currentTab === 'recent'
                ? 'text-oxford-blue bg-white shadow-sm transform scale-[1.02] z-10'
                : 'text-gray-600 hover:text-oxford-blue hover:bg-white/50'
            }`}
          >
            <span className="relative z-10">Últimas</span>
            {currentTab === 'recent' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-oxford-blue transform origin-left animate-pulse"></div>
            )}
          </button>
          {hasUrgentArticles && (
            <button 
              onClick={() => setActiveTab('urgent')}
              className={`relative flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 ease-out ${
                currentTab === 'urgent'
                  ? 'text-red-600 bg-white shadow-sm transform scale-[1.02] z-10'
                  : 'text-gray-600 hover:text-red-600 hover:bg-white/50'
              }`}
            >
              <span className="relative z-10">Ui! Isso é vermelho</span>
              {currentTab === 'urgent' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 transform origin-left animate-pulse"></div>
              )}
            </button>
          )}
        </nav>
      </div>
      
      <div className="p-6 space-y-5">
        {currentTab === 'recent' && (
          <>
            {recentArticles.length > 0 ? recentArticles.map((article) => (
              <Link key={article.id} href={`/article/${article.id}`}>
                <div className="flex gap-4 group cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-all duration-200">
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-18 h-18 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
                    />
                  )}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-oxford-blue font-semibold bg-oxford-blue/10 px-2 py-1 rounded">{article.category}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-oxford-blue transition-colors leading-relaxed">
                      {article.title}
                    </h4>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">Nenhuma notícia recente</p>
              </div>
            )}
          </>
        )}
        
        {currentTab === 'urgent' && (
          <>
            {urgentArticles.length > 0 ? urgentArticles.map((article) => (
              <Link key={article.id} href={`/article/${article.id}`}>
                <div className="flex gap-4 group cursor-pointer p-3 rounded-lg hover:bg-red-50 transition-all duration-200">
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-18 h-18 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
                    />
                  )}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded">{article.category}</span>
                      <span className={`text-xs px-2 py-1 rounded text-white font-bold shadow-sm ${
                        article.urgency === 'breaking' ? 'bg-red-500 animate-pulse' : 'bg-orange-500'
                      }`}>
                        {article.urgency === 'breaking' ? 'ÚLTIMA HORA' : 'É VERMELHO'}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors leading-relaxed">
                      {article.title}
                    </h4>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">Nenhuma notícia urgente no momento</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}