'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        console.log('🔍 AuthGuard: Checking user authentication...')
        
        // Check if we have a session first
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          console.log('❌ AuthGuard: No session found, redirecting to login')
          router.push('/admin/login')
          return
        }

        // If we have a session, get the user
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          console.error('❌ AuthGuard error:', error)
          router.push('/admin/login')
          return
        }

        if (user) {
          console.log('✅ AuthGuard: User authenticated:', user.email)
          setUser(user)
        } else {
          console.log('❌ AuthGuard: No user found, redirecting to login')
          router.push('/admin/login')
        }
      } catch (error) {
        console.error('❌ AuthGuard unexpected error:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null)
        router.push('/admin/login')
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-oxford-blue mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Verificando autenticação...</p>
          </div>
        </div>
      )
    )
  }

  if (!user) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">Redirecionando para login...</p>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}