import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderNotification } from '@/lib/email'
import type { CreateOrderInput, Wholesaler } from '@/lib/types'

function generateOrderNumber(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 9000 + 1000)
  return `ORD-${date}-${random}`
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body: CreateOrderInput = await request.json()
  const admin = createAdminClient()

  const { data: product, error: productError } = await admin
    .from('products')
    .select('*, wholesaler:wholesalers(*)')
    .eq('id', body.product_id)
    .eq('is_active', true)
    .single()

  if (productError || !product) {
    return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 })
  }

  const wholesaler = product.wholesaler as Wholesaler | null
  const total_price = product.price * body.quantity

  const orderData = {
    order_number: generateOrderNumber(),
    product_id: product.id,
    product_name: product.name,
    product_price: product.price,
    quantity: body.quantity,
    total_price,
    customer_name: body.customer_name,
    customer_phone: body.customer_phone,
    delivery_address: body.delivery_address,
    delivery_memo: body.delivery_memo || null,
    status: 'received' as const,
    wholesaler_id: wholesaler?.id || null,
    wholesaler_name: wholesaler?.name || null,
  }

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert(orderData)
    .select()
    .single()

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 })

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

  return NextResponse.json(order, { status: 201 })
}
