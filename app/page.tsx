'use client'
import { useEffect, useState, useCallback } from 'react'
import { ProductCard } from '@/components/consumer/ProductCard'
import type { Product } from '@/lib/types'

const IDLE_TIMEOUT_MS = 3 * 60 * 1000

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data)
        else setError('상품을 불러오지 못했습니다.')
      })
      .catch(() => setError('네트워크 오류가 발생했습니다.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null
    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as unknown as { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen')
        }
      } catch {}
    }
    requestWakeLock()
    const onVisible = () => { if (document.visibilityState === 'visible') requestWakeLock() }
    document.addEventListener('visibilitychange', onVisible)
    return () => { wakeLock?.release(); document.removeEventListener('visibilitychange', onVisible) }
  }, [])

  const resetTimer = useCallback(() => {
    const events = ['touchstart', 'click', 'keydown'] as const
    let timer = setTimeout(() => window.location.reload(), IDLE_TIMEOUT_MS)
    const reset = () => { clearTimeout(timer); timer = setTimeout(() => window.location.reload(), IDLE_TIMEOUT_MS) }
    events.forEach(e => window.addEventListener(e, reset, { passive: true }))
    return () => { clearTimeout(timer); events.forEach(e => window.removeEventListener(e, reset)) }
  }, [])

  useEffect(resetTimer, [resetTimer])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">야외 무인 주문</h1>
            <p className="text-sm text-gray-500">원하는 상품을 선택하세요</p>
          </div>
          <span className="text-2xl">🛒</span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="text-5xl">⚠️</span>
            <p className="text-gray-600 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700"
            >
              다시 시도
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="text-5xl">📦</span>
            <p className="text-gray-600 text-lg">등록된 상품이 없습니다.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-4">총 {products.length}개 상품</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="py-4 text-center text-xs text-gray-400">
        터치하여 상품을 선택하세요
      </footer>
    </div>
  )
}
