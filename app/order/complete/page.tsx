'use client'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'

function CompleteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order_number') || ''
  const total = parseInt(searchParams.get('total') || '0', 10)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="flex items-center justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">주문 완료!</h1>
        <p className="text-gray-500 mb-8">주문이 성공적으로 접수되었습니다.</p>

        <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">주문번호</span>
            <span className="text-sm font-semibold text-gray-900 font-mono">{orderNumber}</span>
          </div>
          {total > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">결제 금액</span>
              <span className="text-sm font-bold text-indigo-600">{total.toLocaleString()}원</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">배송 안내</span>
            <span className="text-sm text-gray-700">도매처 직배송</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-8">
          입력하신 연락처로 배송 안내가 전달됩니다.
        </p>

        <Button
          size="xl"
          className="w-full"
          onClick={() => router.push('/')}
        >
          <Home className="w-5 h-5" />
          처음으로 돌아가기
        </Button>
      </div>
    </div>
  )
}

export default function CompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    }>
      <CompleteContent />
    </Suspense>
  )
}
