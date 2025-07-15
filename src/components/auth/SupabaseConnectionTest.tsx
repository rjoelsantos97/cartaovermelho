'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'

export function SupabaseConnectionTest() {
  const [status, setStatus] = useState<{
    connected: boolean
    url: string
    error?: string
    userCount?: number
  }>({
    connected: false,
    url: '',
  })

  useEffect(() => {
    const testConnection = async () => {
      const supabase = createClient()
      
      try {
        console.log('🔍 Testing Supabase connection...')
        
        // Test basic connection
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'
        setStatus(prev => ({ ...prev, url: supabaseUrl }))
        
        // Test database connection
        const { data, error } = await supabase
          .from('original_articles')
          .select('id')
          .limit(1)
        
        if (error) {
          console.error('❌ Database connection error:', error)
          setStatus(prev => ({ 
            ...prev, 
            connected: false, 
            error: `Database error: ${error.message}` 
          }))
          return
        }
        
        console.log('✅ Database connection successful')
        
        // Test auth service
        const { data: authData, error: authError } = await supabase.auth.getSession()
        
        if (authError) {
          console.error('❌ Auth service error:', authError)
          setStatus(prev => ({ 
            ...prev, 
            connected: false, 
            error: `Auth error: ${authError.message}` 
          }))
          return
        }
        
        console.log('✅ Auth service working')
        
        setStatus(prev => ({ 
          ...prev, 
          connected: true, 
          error: undefined 
        }))
        
      } catch (error) {
        console.error('❌ Connection test failed:', error)
        setStatus(prev => ({ 
          ...prev, 
          connected: false, 
          error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }))
      }
    }

    testConnection()
  }, [])

  return (
    <Card className="p-6 mb-6 border-2 border-dashed">
      <h3 className="font-semibold mb-4">🔧 Supabase Connection Test</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <span className={`px-2 py-1 rounded text-xs ${
            status.connected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {status.connected ? '✅ Connected' : '❌ Disconnected'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-medium">URL:</span>
          <span className="font-mono text-xs">{status.url}</span>
        </div>
        
        {status.error && (
          <div className="flex items-start gap-2">
            <span className="font-medium">Error:</span>
            <span className="text-red-600 text-xs">{status.error}</span>
          </div>
        )}
      </div>
    </Card>
  )
}