import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Database } from '@supabase/supabase-js/dist/module/lib/types'

type WholesalerRecord = {
  id: string
  name: string
  email: string | null
  contact: string | null
  phone: string | null
  notify_type: 'email' | 'manual'
  memo: string | null
  created_at: string
}

export async function getWholesalerByUser(
  adminClient: SupabaseClient<Database>,
  user: User | null
): Promise<WholesalerRecord | null> {
  const email = user?.email?.trim().toLowerCase()
  if (!email) return null

  const { data, error } = await adminClient
    .from('wholesalers')
    .select('*')
    .ilike('email', email)
    .single()

  if (error || !data) return null
  return data as WholesalerRecord
}

export type AuthenticatedWholesaler = WholesalerRecord
