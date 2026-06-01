import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getWholesalerByUser } from '@/lib/wholesaler-auth'

const schema = z.object({
  status: z.enum(['shipping', 'delivered']),
})

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const parseResult = schema.safeParse(await request.json())
  if (!parseResult.success) {
    return NextResponse.json({ error: '허용되지 않은 배송 상태입니다.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const wholesaler = await getWholesalerByUser(admin, user)
  if (!wholesaler) {
    return NextResponse.json({ error: '도매처 계정을 찾을 수 없습니다.' }, { status: 403 })
  }

  const { data: order, error: orderError } = await admin
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('wholesaler_id', wholesaler.id)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 })
  }

  const { data, error } = await admin
    .from('orders')
    .update({ status: parseResult.data.status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('wholesaler_id', wholesaler.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
