import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = await createClient(request)
    
    // Check for service key authentication
    const authHeader = request.headers.get('authorization')
    const hasServiceKey = authHeader && authHeader.startsWith('Bearer ') && 
                         authHeader.split(' ')[1] === process.env.SUPABASE_SERVICE_KEY
    
    // Check if user is authenticated
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    const isApiRoute = request.nextUrl.pathname.startsWith('/api/')
    const isLoginPage = request.nextUrl.pathname === '/admin/login'

    // Protected API endpoints that require authentication
    const protectedApiRoutes = [
      '/api/run-pipeline',
      '/api/scheduler',
      '/api/test-scraping',
      '/api/test-scraping-only'
    ]
    
    // API endpoints that accept service key authentication
    const serviceKeyRoutes = [
      '/api/run-pipeline',
      '/api/test-scraping',
      '/api/test-scraping-only',
      '/api/scheduler/init'
    ]

    const isProtectedApiRoute = protectedApiRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )
    
    const isServiceKeyRoute = serviceKeyRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    // If user is not authenticated and trying to access protected routes
    if (!user && (!hasServiceKey || !isServiceKeyRoute) && (isAdminRoute || isProtectedApiRoute)) {
      if (isAdminRoute && !isLoginPage) {
        // Redirect to login page for admin routes
        console.log('🔄 Redirecting to login page')
        const loginUrl = new URL('/admin/login', request.url)
        return NextResponse.redirect(loginUrl)
      }
      
      if (isProtectedApiRoute) {
        // Return 401 for API routes
        return NextResponse.json(
          { 
            success: false, 
            error: 'Unauthorized access. Admin authentication required.' 
          },
          { status: 401 }
        )
      }
    }

    // If user is authenticated and trying to access login page, redirect to dashboard
    if (user && isLoginPage) {
      const dashboardUrl = new URL('/admin/dashboard', request.url)
      return NextResponse.redirect(dashboardUrl)
    }

    // Additional security: Check if user has admin role (optional)
    if ((user || hasServiceKey) && (isAdminRoute || isProtectedApiRoute)) {
      // You can add role-based checks here if needed
      // For now, any authenticated user can access admin areas
      if (hasServiceKey) {
        console.log(`✅ Service key access granted for: ${request.nextUrl.pathname}`)
      } else {
        console.log(`✅ Admin access granted to user: ${user.email}`)
      }
    }

    return response
  } catch (error) {
    console.error('❌ Middleware error:', error)
    
    // On error, deny access to protected routes
    if (request.nextUrl.pathname.startsWith('/admin') || 
        request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication service unavailable' 
        },
        { status: 503 }
      )
    }
    
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}