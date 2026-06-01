'use client'
import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import { QuantitySelector } from '@/components/consumer/QuantitySelector'
import { Button } from '@/components/ui/Button'
import type { Product } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default function ProductDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => setProduct(data))
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [id, router])

  function handleOrder() {
    if (!product) return
    const params = new URLSearchParams({
      product_id: product.id,
      quantity: quantity.toString(),
    })
    router.push(`/order?${params}`)
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
            aria-label="뒤로"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">상품 상세</h1>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full">
        {/* 상품 이미지 */}
        <div className="relative w-full aspect-square bg-white">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 672px) 100vw, 672px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-200">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="bg-white px-6 py-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
          {product.description && (
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          )}
          <p className="text-3xl font-bold text-indigo-600 mt-4">
            {product.price.toLocaleString()}<span className="text-lg font-normal ml-1">원</span>
          </p>
        </div>

        {/* 수량 선택 */}
        <div className="bg-white px-6 py-6 mt-2 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-4">수량 선택</p>
          <div className="flex items-center justify-between">
            <QuantitySelector value={quantity} onChange={setQuantity} />
            <div className="text-right">
              <p className="text-sm text-gray-500">합계</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalPrice.toLocaleString()}<span className="text-sm font-normal ml-0.5">원</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 주문 버튼 */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <Button size="xl" className="w-full" onClick={handleOrder}>
            <ShoppingCart className="w-5 h-5" />
            {totalPrice.toLocaleString()}원 주문하기
          </Button>
        </div>
      </div>
    </div>
  )
}
