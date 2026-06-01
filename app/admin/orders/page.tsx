'use client'
import { useEffect, useState } from 'react'
import { Send, ChevronDown, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/admin/StatusBadge'
import type { Order, OrderStatus } from '@/lib/types'

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'received', label: '주문 접수' },
  { value: 'forwarded', label: '도매처 전달 완료' },
  { value: 'shipping', label: '배송중' },
  { value: 'delivered', label: '배송 완료' },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [notifyingId, setNotifyingId] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')

  async function fetchOrders() {
    const res = await fetch('/api/orders')
    const data = await res.json()
    if (Array.isArray(data)) setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    async function loadOrders() {
      await fetchOrders()
    }

    void loadOrders()
  }, [])

  async function handleStatusChange(id: string, status: OrderStatus) {
    setUpdatingId(id)
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setUpdatingId(null)
    fetchOrders()
  }

  async function handleNotify(id: string) {
    if (!confirm('도매처에 이메일을 발송하시겠습니까?')) return
    setNotifyingId(id)
    const res = await fetch(`/api/orders/${id}/notify`, { method: 'POST' })
    if (!res.ok) {
      const data = await res.json()
      alert(`이메일 발송 실패: ${data.error}`)
    } else {
      alert('이메일이 발송되었습니다.')
      fetchOrders()
    }
    setNotifyingId(null)
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.set('status', filter)
      }

      const response = await fetch(`/api/orders/export${params.size > 0 ? `?${params.toString()}` : ''}`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '엑셀 다운로드에 실패했습니다.')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = downloadUrl
      anchor.download = filter === 'all' ? 'orders-all.csv' : `orders-${filter}.csv`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      alert(error instanceof Error ? error.message : '엑셀 다운로드에 실패했습니다.')
    } finally {
      setDownloading(false)
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div className="max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">주문 관리</h1>
          <p className="text-sm text-gray-500 mt-1">총 {orders.length}개 주문</p>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              전체
            </button>
            {STATUS_OPTIONS.map(s => (
              <button
                key={s.value}
                onClick={() => setFilter(s.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s.value ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <Button type="button" variant="secondary" size="md" loading={downloading} onClick={handleDownload} className="w-full xl:w-auto">
            <Download className="w-4 h-4" />
            엑셀 다운로드
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400">주문이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50 lg:hidden">
            {filtered.map(order => (
              <div key={order.id} className="space-y-4 px-4 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="font-mono text-xs font-semibold text-gray-700">{order.order_number}</span>
                    {order.notified_at && (
                      <p className="mt-1 text-xs text-blue-500">발송됨</p>
                    )}
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900">{order.product_name}</p>
                  <p className="text-xs text-gray-400">{order.quantity}개 · {order.wholesaler_name || '도매처 없음'}</p>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-400">고객</p>
                    <p className="mt-1 text-gray-900">{order.customer_name}</p>
                    <p className="text-xs text-gray-400">{order.customer_phone}</p>
                    <p className="mt-1 text-xs text-gray-400 break-words">{order.delivery_address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">금액 / 주문일</p>
                    <p className="mt-1 font-semibold text-gray-900">{order.total_price.toLocaleString()}원</p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('ko-KR')}</p>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative inline-block">
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      disabled={updatingId === order.id}
                      className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                  </div>

                  <div className="flex justify-end">
                    {order.wholesaler_id && !order.notified_at && (
                      <button
                        onClick={() => handleNotify(order.id)}
                        disabled={notifyingId === order.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50"
                        title="도매처 이메일 발송"
                      >
                        <Send className="h-3 w-3" />
                        알림발송
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[960px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">주문번호</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">상품</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">고객</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">금액</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">상태</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">주문일</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs font-semibold text-gray-700">{order.order_number}</span>
                      {order.notified_at && (
                        <p className="text-xs text-blue-500 mt-0.5">발송됨</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-gray-900">{order.product_name}</p>
                      <p className="text-xs text-gray-400">{order.quantity}개 · {order.wholesaler_name || '도매처 없음'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900">{order.customer_name}</p>
                      <p className="text-xs text-gray-400">{order.customer_phone}</p>
                      <p className="text-xs text-gray-400 mt-0.5 max-w-[150px] truncate">{order.delivery_address}</p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-semibold text-gray-900 text-sm">{order.total_price.toLocaleString()}원</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          disabled={updatingId === order.id}
                          className="appearance-none pl-3 pr-8 py-1.5 rounded-xl text-xs font-medium border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('ko-KR')}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {order.wholesaler_id && !order.notified_at && (
                        <button
                          onClick={() => handleNotify(order.id)}
                          disabled={notifyingId === order.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
                          title="도매처 이메일 발송"
                        >
                          <Send className="w-3 h-3" />
                          알림발송
                        </button>
                      )}
                      {order.notified_at && (
                        <StatusBadge status={order.status} />
                      )}
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
