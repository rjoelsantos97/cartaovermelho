/**
 * RSS Feed Generation for Cartão Vermelho News
 * Provides RSS feed for faster Google indexing and user subscriptions
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSeoFriendlySlug } from '@/lib/seo';

export async function GET() {
  const supabase = await createClient();
  const siteUrl = 'https://cartaovermelho.pt';
  const buildDate = new Date().toUTCString();

  // Get latest 50 published articles for RSS
  const { data: articles, error } = await supabase
    .from('processed_articles')
    .select('id, title, slug, processed_at, category, content')
    .eq('is_published', true)
    .order('processed_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching articles for RSS:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }

  // Generate RSS XML
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Cartão Vermelho News</title>
    <description>As notícias desportivas mais dramáticas de Portugal - Futebol e Desporto com intensidade máxima</description>
    <link>${siteUrl}</link>
    <language>pt-PT</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <pubDate>${buildDate}</pubDate>
    <ttl>60</ttl>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteUrl}/favicon-32x32.png</url>
      <title>Cartão Vermelho News</title>
      <link>${siteUrl}</link>
      <width>32</width>
      <height>32</height>
    </image>
    ${articles?.map(article => {
      const slug = article.slug || generateSeoFriendlySlug(article.title);
      const articleUrl = `${siteUrl}/article/${slug}`;
      const pubDate = new Date(article.processed_at).toUTCString();
      
      // Clean HTML content for RSS (basic cleanup)
      const cleanContent = article.content
        ?.replace(/<[^>]*>/g, '') // Remove HTML tags
        ?.replace(/&/g, '&amp;')  // Escape ampersands
        ?.replace(/</g, '&lt;')   // Escape less than
        ?.replace(/>/g, '&gt;')   // Escape greater than
        ?.substring(0, 500) + '...' || '';

      const description = cleanContent || article.title;

      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <description><![CDATA[${description}]]></description>
      <content:encoded><![CDATA[${cleanContent}]]></content:encoded>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${article.category}]]></category>
      <dc:creator><![CDATA[Cartão Vermelho News]]></dc:creator>
    </item>`;
    }).join('') || ''}
  </channel>
</rss>`.trim();

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}