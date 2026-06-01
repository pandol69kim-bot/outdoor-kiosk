'use client'

import { Suspense, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function WholesalerLoginPage() {
  return (
    <Suspense fallback={<WholesalerLoginFallback />}>
      <WholesalerLoginContent />
    </Suspense>
  )
}

function WholesalerLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const externalError = useMemo(() => {
    if (searchParams.get('error') === 'not_wholesaler') {
      return '도매처로 등록된 이메일 계정만 접근할 수 있습니다.'
    }

    return null
  }, [searchParams])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
      return
    }

    router.push('/wholesaler/orders')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">도매처 로그인</h1>
          <p className="text-gray-500 mt-1 text-sm">배송 상태를 직접 업데이트하세요</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {(externalError || error) && (
              <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm">
                {externalError || error}
              </div>
            )}
            <Input
              label="이메일"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="order@example.com"
              required
            />
            <Input
              label="비밀번호"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              로그인
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

function WholesalerLoginFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-sm text-gray-500 text-center">
          로그인 화면을 불러오는 중입니다.
        </div>
      </div>
    </div>
  )
}
