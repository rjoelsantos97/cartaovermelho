/**
 * API Route to generate slugs for all existing articles
 * POST /api/admin/generate-slugs
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateSlugsForAllArticles } from '@/lib/seo/slug-service';
import { validateApiAuth, createUnauthorizedResponse } from '@/lib/auth/api-auth';

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await validateApiAuth(request);
    if (!authResult.success) {
      return createUnauthorizedResponse();
    }

    // Generate slugs for all articles
    const result = await generateSlugsForAllArticles();
    
    return NextResponse.json({
      success: true,
      message: `Slugs generated successfully`,
      data: result
    });
    
  } catch (error) {
    console.error('Error generating slugs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await validateApiAuth(request);
    if (!authResult.success) {
      return createUnauthorizedResponse();
    }

    // This endpoint just returns info about the slug generation process
    return NextResponse.json({
      success: true,
      message: 'Use POST method to generate slugs for all articles',
      info: {
        description: 'This endpoint generates SEO-friendly slugs for all articles that don\'t have them yet',
        method: 'POST',
        authentication: 'Required (Admin)'
      }
    });
    
  } catch (error) {
    console.error('Error in generate-slugs endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}