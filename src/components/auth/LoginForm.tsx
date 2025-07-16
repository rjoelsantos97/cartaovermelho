'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Attempting login with:', { email, password: '***' })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Login error:', error)
        setError(error.message)
        return
      }

      if (data.user) {
        console.log('✅ Login successful for user:', data.user.email)
        // Successful login - redirect to dashboard
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        setError('Login failed - no user returned')
      }
    } catch (error) {
      console.error('❌ Unexpected login error:', error)
      setError('An unexpected error occurred. Please check the console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-14 bg-red-600 rounded-lg shadow-xl transform rotate-12">
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-gray-900 tracking-tight bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                Cartão Vermelho
              </span>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sports Drama
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-600 mt-2">Entre para aceder ao dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@cartaovermelho.pt"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-oxford-blue hover:bg-penn-blue"
          >
            {loading ? 'A entrar...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Só utilizadores autorizados podem aceder ao dashboard admin
          </p>
        </div>
      </Card>
    </div>
  )
}