import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderNotification } from '@/lib/email'
import type { Wholesaler } from '@/lib/types'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const admin = createAdminClient()
  const { data: order, error: orderError } = await admin
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 })
  }

  if (!order.wholesaler_id) {
    return NextResponse.json({ error: '연결된 도매처가 없습니다.' }, { status: 400 })
  }

  const { data: wholesaler, error: wholesalerError } = await admin
    .from('wholesalers')
    .select('*')
    .eq('id', order.wholesaler_id)
    .single()

  if (wholesalerError || !wholesaler) {
    return NextResponse.json({ error: '도매처를 찾을 수 없습니다.' }, { status: 404 })
  }

  try {
    await sendOrderNotification(order, wholesaler as Wholesaler)
    const { data: updated } = await admin
      .from('orders')
      .update({
        status: 'forwarded',
        notified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    return NextResponse.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : '이메일 발송 실패'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
