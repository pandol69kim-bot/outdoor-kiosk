import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { productPayloadSchema } from '@/lib/product-payload'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const includeHidden = request.nextUrl.searchParams.get('include_hidden') === 'true'
  const { data: { user } } = includeHidden
    ? await supabase.auth.getUser()
    : { data: { user: null } }

  let query = supabase
    .from('products')
    .select('*, wholesaler:wholesalers(*)')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (!includeHidden || !user) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const parseResult = productPayloadSchema.safeParse(await request.json())
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.issues[0]?.message ?? '입력값이 올바르지 않습니다.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('products')
    .insert(parseResult.data)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
