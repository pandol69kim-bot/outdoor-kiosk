'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { OrderForm, type OrderFormValues } from '@/components/consumer/OrderForm'
import type { Product } from '@/lib/types'

function OrderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const product_id = searchParams.get('product_id')
  const quantity = parseInt(searchParams.get('quantity') || '1', 10)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!product_id) { router.push('/'); return }
    fetch(`/api/products/${product_id}`)
      .then(r => r.json())
      .then(data => setProduct(data))
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [product_id, router])

  async function handleSubmit(values: OrderFormValues) {
    if (!product) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, quantity, ...values }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '주문 실패')
      router.push(`/order/complete?order_number=${data.order_number}&total=${data.total_price}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '주문에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!product) return null
  const totalPrice = product.price * quantity

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">배송 정보 입력</h1>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* 주문 요약 */}
        <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">주문 상품</h2>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">{product.price.toLocaleString()}원 × {quantity}개</p>
            </div>
            <p className="text-lg font-bold text-indigo-600">{totalPrice.toLocaleString()}원</p>
          </div>
        </div>

        {/* 배송 정보 폼 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">배송 정보</h2>
          {error && (
            <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}
          <OrderForm onSubmit={handleSubmit} loading={submitting} />
        </div>
      </main>
    </div>
  )
}

export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    }>
      <OrderContent />
    </Suspense>
  )
}
