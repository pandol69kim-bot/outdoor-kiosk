import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const schema = z.object({
  is_active: z.boolean(),
})

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const parseResult = schema.safeParse(await request.json())
  if (!parseResult.success) {
    return NextResponse.json({ error: '입력값이 올바르지 않습니다.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('products')
    .update({
      is_active: parseResult.data.is_active,
      updated_at: new Date().toISOString(),
    })
    .not('id', 'is', null)
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, updatedCount: data.length })
}