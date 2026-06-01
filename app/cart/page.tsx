'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShoppingCart, Trash2 } from 'lucide-react'
import { QuantitySelector } from '@/components/consumer/QuantitySelector'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/hooks/useCart'

export default function CartPage() {
  const router = useRouter()
  const { items, isReady, totalAmount, totalQuantity, removeItem, updateQuantity } = useCart()

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="뒤로"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">장바구니</h1>
            <p className="text-sm text-gray-500">총 {totalQuantity}개 상품</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-lg font-semibold text-gray-900">장바구니가 비어 있습니다.</p>
            <p className="mt-2 text-sm text-gray-500">상품을 담은 뒤 한 번에 주문할 수 있습니다.</p>
            <Link href="/" className="inline-block mt-6">
              <Button size="lg">상품 보러가기</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.product_id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex gap-3 sm:gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gray-100 sm:h-24 sm:w-24">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="(max-width: 640px) 80px, 96px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl text-gray-300">📦</div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-semibold text-gray-900 sm:text-base">{item.name}</p>
                        <p className="mt-1 text-sm text-gray-500">{item.price.toLocaleString()}원 / 개</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.product_id)}
                        className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label="상품 제거"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 xs:flex-row xs:items-center xs:justify-between">
                      <div className="min-w-0">
                        <QuantitySelector
                          value={item.quantity}
                          onChange={(quantity) => updateQuantity(item.product_id, quantity)}
                          compact
                        />
                      </div>
                      <p className="shrink-0 text-right text-base font-bold text-indigo-600 sm:text-lg">
                        {(item.price * item.quantity).toLocaleString()}원
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>총 상품 수</span>
                <span>{totalQuantity}개</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-base font-semibold text-gray-900">총 주문 금액</span>
                <span className="text-right text-xl font-bold text-indigo-600 sm:text-2xl">{totalAmount.toLocaleString()}원</span>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link href="/" className="flex-1">
                  <Button variant="secondary" size="lg" className="w-full">상품 더 담기</Button>
                </Link>
                <Button size="lg" className="flex-1" onClick={() => router.push('/order?source=cart')}>
                  주문하기
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
