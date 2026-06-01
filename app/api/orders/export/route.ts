import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from '@/lib/types'

function escapeCsvValue(value: string | number | null) {
  if (value === null) return ''

  const stringValue = String(value)
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('ko-KR')
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const status = request.nextUrl.searchParams.get('status') as OrderStatus | null
  const admin = createAdminClient()

  let query = admin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status in ORDER_STATUS_LABELS) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const orders = (data ?? []) as Order[]
  const headers = [
    '주문번호',
    '상태',
    '상품명',
    '수량',
    '상품단가',
    '총금액',
    '도매처',
    '주문자명',
    '연락처',
    '배송지',
    '배송메모',
    '도매처발송일시',
    '주문일시',
  ]

  const rows = orders.map((order) => [
    order.order_number,
    ORDER_STATUS_LABELS[order.status],
    order.product_name,
    order.quantity,
    order.product_price,
    order.total_price,
    order.wholesaler_name,
    order.customer_name,
    order.customer_phone,
    order.delivery_address,
    order.delivery_memo,
    order.notified_at ? formatDateTime(order.notified_at) : null,
    formatDateTime(order.created_at),
  ])

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsvValue(cell ?? null)).join(','))
    .join('\r\n')

  const fileName = status && status in ORDER_STATUS_LABELS
    ? `orders-${status}.csv`
    : 'orders-all.csv'

  return new NextResponse(`\uFEFF${csvContent}`, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}