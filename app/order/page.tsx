'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { OrderForm, type OrderFormValues } from '@/components/consumer/OrderForm'
import { useCart } from '@/hooks/useCart'
import type { Product } from '@/lib/types'

function OrderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cartMode = searchParams.get('source') === 'cart'
  const product_id = searchParams.get('product_id')
  const quantity = parseInt(searchParams.get('quantity') || '1', 10)
  const { items: cartItems, isReady: isCartReady, clearCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [cartPreviewItems, setCartPreviewItems] = useState<Array<{ key: string, name: string, price: number, quantity: number }>>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cartMode) {
      async function loadCartPreview() {
        if (!isCartReady) return
        if (cartItems.length === 0) {
          router.push('/cart')
          return
        }

        try {
          const previewItems = await Promise.all(
            cartItems.map(async (item) => {
              const response = await fetch(`/api/products/${item.product_id}`)
              if (!response.ok) throw new Error('장바구니 상품 정보를 다시 확인해주세요.')
              const data: Product = await response.json()
              return {
                key: data.id,
                name: data.name,
                price: data.price,
                quantity: item.quantity,
              }
            })
          )

          setCartPreviewItems(previewItems)
        } catch (cartError) {
          setError(cartError instanceof Error ? cartError.message : '장바구니 상품 정보를 확인할 수 없습니다.')
        } finally {
          setLoading(false)
        }
      }

      void loadCartPreview()
      return
    }

    async function loadProduct() {
      if (!product_id) {
        router.push('/')
        return
      }

      try {
        const response = await fetch(`/api/products/${product_id}`)
        const data = await response.json()
        setProduct(data)
      } catch {
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    void loadProduct()
  }, [cartItems, cartMode, isCartReady, product_id, router])

  const isPageLoading = loading || (cartMode && !isCartReady)

  async function handleSubmit(values: OrderFormValues) {
    setSubmitting(true)
    setError(null)

    try {
      if (cartMode) {
        const response = await fetch('/api/orders/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cartItems, ...values }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || '주문 실패')

        clearCart()
        const params = new URLSearchParams({
          order_numbers: data.order_numbers.join(','),
          total: data.total.toString(),
          count: data.count.toString(),
        })
        router.push(`/order/complete?${params.toString()}`)
        return
      }

      if (!product) return

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, quantity, ...values }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '주문 실패')
      router.push(`/order/complete?order_number=${data.order_number}&total=${data.total_price}&count=1`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '주문에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!cartMode && !product) return null

  const summaryItems = cartMode
    ? cartPreviewItems
    : product
      ? [{ key: product.id, name: product.name, price: product.price, quantity }]
      : []

  const totalPrice = cartMode
    ? summaryItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : product
      ? product.price * quantity
      : 0

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
          <div className="space-y-3">
            {summaryItems.map((item) => (
              <div key={item.key} className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{item.price.toLocaleString()}원 × {item.quantity}개</p>
                </div>
                <p className="text-base font-bold text-gray-900">{(item.price * item.quantity).toLocaleString()}원</p>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
              <span className="text-sm text-gray-500">총 결제 금액</span>
              <p className="text-lg font-bold text-indigo-600">{totalPrice.toLocaleString()}원</p>
            </div>
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
          <OrderForm
            onSubmit={handleSubmit}
            loading={submitting}
            submitLabel={cartMode ? `${summaryItems.length}건 주문 접수하기` : '주문하기'}
          />
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
