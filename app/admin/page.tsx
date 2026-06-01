import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Package, Users, ShoppingBag, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '@/lib/types'

export const revalidate = 60

async function getDashboardStats() {
  const supabase = createAdminClient()
  const [products, wholesalers, orders] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
    supabase.from('wholesalers').select('id', { count: 'exact' }),
    supabase.from('orders').select('id, status, total_price', { count: 'exact' }),
  ])

  const totalRevenue = (orders.data || []).reduce((sum, o) => sum + o.total_price, 0)
  const recentOrders = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return {
    productCount: products.count || 0,
    wholesalerCount: wholesalers.count || 0,
    orderCount: orders.count || 0,
    totalRevenue,
    recentOrders: recentOrders.data || [],
  }
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const stats = await getDashboardStats()

  const statCards = [
    { label: '활성 상품', value: stats.productCount, icon: Package, href: '/admin/products', color: 'bg-blue-50 text-blue-600' },
    { label: '도매처', value: stats.wholesalerCount, icon: Users, href: '/admin/wholesalers', color: 'bg-green-50 text-green-600' },
    { label: '총 주문', value: stats.orderCount, icon: ShoppingBag, href: '/admin/orders', color: 'bg-purple-50 text-purple-600' },
    { label: '총 매출', value: `${stats.totalRevenue.toLocaleString()}원`, icon: TrendingUp, href: '/admin/orders', color: 'bg-orange-50 text-orange-600' },
  ]

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-sm text-gray-500 mt-1">{user?.email} · 관리자</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </Link>
        ))}
      </div>

      {/* 최근 주문 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">최근 주문</h2>
          <Link href="/admin/orders" className="text-sm text-indigo-600 hover:underline">전체 보기</Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">주문이 없습니다.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {stats.recentOrders.map(order => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 font-mono">{order.order_number}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.product_name} · {order.customer_name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ORDER_STATUS_COLORS[order.status as OrderStatus]}`}>
                    {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {order.total_price.toLocaleString()}원
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
