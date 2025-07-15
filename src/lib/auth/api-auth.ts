import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function validateApiAuth(request: NextRequest) {
  try {
    // Check for service key in Authorization header (for scheduler)
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      if (token === process.env.SUPABASE_SERVICE_KEY) {
        return {
          success: true,
          user: { id: 'scheduler', email: 'scheduler@system' },
          error: null,
        }
      }
    }

    const supabase = await createClient()
    
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return {
        success: false,
        error: 'Unauthorized access. Admin authentication required.',
        user: null,
      }
    }

    return {
      success: true,
      user,
      error: null,
    }
  } catch (error) {
    console.error('API auth validation error:', error)
    return {
      success: false,
      error: 'Authentication service unavailable',
      user: null,
    }
  }
}

export function createUnauthorizedResponse(message?: string) {
  return NextResponse.json(
    {
      success: false,
      error: message || 'Unauthorized access. Admin authentication required.',
    },
    { status: 401 }
  )
}

export function createServiceUnavailableResponse() {
  return NextResponse.json(
    {
      success: false,
      error: 'Authentication service unavailable',
    },
    { status: 503 }
  )
}