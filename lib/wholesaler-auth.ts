import type { SupabaseClient, User } from '@supabase/supabase-js'

import type { Wholesaler } from '@/lib/types'

export async function getWholesalerByUser(
  adminClient: SupabaseClient,
  user: User | null
): Promise<Wholesaler | null> {
  const email = user?.email?.trim().toLowerCase()
  if (!email) return null

  const { data, error } = await adminClient
    .from('wholesalers')
    .select('*')
    .ilike('email', email)
    .single()

  if (error || !data) return null
  return data as Wholesaler
}

export type AuthenticatedWholesaler = Wholesaler
