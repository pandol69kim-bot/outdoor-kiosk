import { NextRequest, NextResponse } from 'next/server'
import { sendOrderNotification } from '@/lib/email'
import { createBatchOrderInputSchema } from '@/lib/order-payload'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Order, Wholesaler } from '@/lib/types'

function generateOrderNumber(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 9000 + 1000)
  return `ORD-${date}-${random}`
}

export async function POST(request: NextRequest) {
  const parseResult = createBatchOrderInputSchema.safeParse(await request.json())
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.issues[0]?.message ?? '입력값이 올바르지 않습니다.' }, { status: 400 })
  }

  const body = parseResult.data
  const admin = createAdminClient()
  const productIds = [...new Set(body.items.map((item) => item.product_id))]

  const { data: products, error: productError } = await admin
    .from('products')
    .select('*, wholesaler:wholesalers(*)')
    .in('id', productIds)
    .eq('is_active', true)

  if (productError) return NextResponse.json({ error: productError.message }, { status: 500 })
  if (!products || products.length !== productIds.length) {
    return NextResponse.json({ error: '일부 상품을 찾을 수 없거나 현재 주문할 수 없습니다.' }, { status: 404 })
  }

  const productMap = new Map(products.map((product) => [product.id, product]))
  const orderRows = body.items.map((item) => {
    const product = productMap.get(item.product_id)
    if (!product) throw new Error('상품 정보가 올바르지 않습니다.')

    const wholesaler = product.wholesaler as Wholesaler | null

    return {
      order_number: generateOrderNumber(),
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      quantity: item.quantity,
      total_price: product.price * item.quantity,
      customer_name: body.customer_name,
      customer_phone: body.customer_phone,
      delivery_address: body.delivery_address,
      delivery_memo: body.delivery_memo,
      status: 'received' as const,
      wholesaler_id: wholesaler?.id || null,
      wholesaler_name: wholesaler?.name || null,
    }
  })

  const { data: createdOrders, error: orderError } = await admin
    .from('orders')
    .insert(orderRows)
    .select()

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })

  const orders = (createdOrders ?? []) as Order[]

  for (const order of orders) {
    const product = order.product_id ? productMap.get(order.product_id) : null
    const wholesaler = (product?.wholesaler as Wholesaler | null) ?? null

    if (wholesaler?.notify_type === 'email' && wholesaler.email) {
      try {
        await sendOrderNotification(order, wholesaler)
        await admin
          .from('orders')
          .update({ status: 'forwarded', notified_at: new Date().toISOString() })
          .eq('id', order.id)
        order.status = 'forwarded'
        order.notified_at = new Date().toISOString()
      } catch (emailError) {
        console.error('이메일 발송 실패:', emailError)
      }
    }
  }

  return NextResponse.json({
    orders,
    order_numbers: orders.map((order) => order.order_number),
    total: orders.reduce((sum, order) => sum + order.total_price, 0),
    count: orders.length,
  }, { status: 201 })
}
