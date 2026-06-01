'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { StatusBadge } from '@/components/admin/StatusBadge'
import type { Order, OrderStatus, Wholesaler } from '@/lib/types'

const STATUS_OPTIONS: { value: Extract<OrderStatus, 'shipping' | 'delivered'>; label: string }[] = [
  { value: 'shipping', label: '배송중' },
  { value: 'delivered', label: '배송 완료' },
]

export default function WholesalerOrdersPage() {
  const [wholesaler, setWholesaler] = useState<Wholesaler | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function fetchOrders() {
    const response = await fetch('/api/wholesaler/orders')
    const data = await response.json()
    if (response.ok) {
      setWholesaler(data.wholesaler)
      setOrders(data.orders)
    }
    setLoading(false)
  }

  useEffect(() => {
    async function loadOrders() {
      await fetchOrders()
    }

    void loadOrders()
  }, [])

  async function handleStatusChange(id: string, status: Extract<OrderStatus, 'shipping' | 'delivered'>) {
    setUpdatingId(id)
    const response = await fetch(`/api/wholesaler/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const data = await response.json()
      alert(data.error || '배송 상태 업데이트에 실패했습니다.')
    }

    setUpdatingId(null)
    fetchOrders()
  }

  return (
    <div className="max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">배송 주문 관리</h1>
        <p className="text-sm text-gray-500 mt-1">
          {wholesaler ? `${wholesaler.name} 도매처 주문 ${orders.length}건` : `총 ${orders.length}건 주문`}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400">할당된 주문이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50 lg:hidden">
            {orders.map(order => (
              <div key={order.id} className="space-y-4 px-4 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="font-mono text-xs font-semibold text-gray-700">{order.order_number}</span>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{order.product_name}</p>
                    <p className="text-xs text-gray-400">{order.quantity}개</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-400">배송 정보</p>
                    <p className="mt-1 text-gray-900">{order.customer_name}</p>
                    <p className="text-xs text-gray-400">{order.customer_phone}</p>
                    <p className="mt-1 break-words text-xs text-gray-400">{order.delivery_address}</p>
                    {order.delivery_memo && (
                      <p className="mt-1 text-xs text-gray-500">메모: {order.delivery_memo}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">금액 / 주문일</p>
                    <p className="mt-1 font-semibold text-gray-900">{order.total_price.toLocaleString()}원</p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('ko-KR')}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="relative inline-block">
                  <select
                    value={order.status === 'received' || order.status === 'forwarded' ? 'shipping' : order.status}
                    onChange={e => handleStatusChange(order.id, e.target.value as Extract<OrderStatus, 'shipping' | 'delivered'>)}
                    disabled={updatingId === order.id}
                    className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[920px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">주문번호</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">상품</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">배송 정보</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">금액</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">상태 변경</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">주문일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs font-semibold text-gray-700">{order.order_number}</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-gray-900">{order.product_name}</p>
                      <p className="text-xs text-gray-400">{order.quantity}개</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{order.customer_name}</p>
                      <p className="text-xs text-gray-400">{order.customer_phone}</p>
                      <p className="text-xs text-gray-400 mt-0.5 max-w-[240px] truncate">{order.delivery_address}</p>
                      {order.delivery_memo && (
                        <p className="text-xs text-gray-500 mt-1">메모: {order.delivery_memo}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-semibold text-gray-900 text-sm">{order.total_price.toLocaleString()}원</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <StatusBadge status={order.status} />
                        <div className="relative inline-block">
                          <select
                            value={order.status === 'received' || order.status === 'forwarded' ? 'shipping' : order.status}
                            onChange={e => handleStatusChange(order.id, e.target.value as Extract<OrderStatus, 'shipping' | 'delivered'>)}
                            disabled={updatingId === order.id}
                            className="appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-medium border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                          >
                            {STATUS_OPTIONS.map(option => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('ko-KR')}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
