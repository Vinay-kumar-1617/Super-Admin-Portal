import type { RoleKey } from '@fieldwork/shared'
import { supabase } from '../lib/supabase'

export type SignedInProfile = {
  roleKey: RoleKey
  email: string
}

export async function getSignedInProfile(userId: string, email: string): Promise<SignedInProfile | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('role_key')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null
  return { roleKey: (data as { role_key: RoleKey }).role_key, email }
}
