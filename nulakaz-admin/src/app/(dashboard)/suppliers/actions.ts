'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { adminClient } from '@/lib/supabase'

export async function createSupplier(formData: FormData) {
  const sb = adminClient()
  const { data, error } = await sb
    .from('suppliers')
    .insert({
      name: formData.get('name') as string,
      contact_name: (formData.get('contact_name') as string) || null,
      email: (formData.get('email') as string) || null,
      phone: (formData.get('phone') as string) || null,
      address: (formData.get('address') as string) || null,
      notes: (formData.get('notes') as string) || null,
      active: true,
    })
    .select('id')
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Failed to create supplier')
  revalidatePath('/suppliers')
  redirect(`/suppliers/${data.id}`)
}

export async function updateSupplier(id: string, formData: FormData) {
  const sb = adminClient()
  const { error } = await sb
    .from('suppliers')
    .update({
      name: formData.get('name') as string,
      contact_name: (formData.get('contact_name') as string) || null,
      email: (formData.get('email') as string) || null,
      phone: (formData.get('phone') as string) || null,
      address: (formData.get('address') as string) || null,
      notes: (formData.get('notes') as string) || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/suppliers')
  revalidatePath(`/suppliers/${id}`)
  redirect('/suppliers')
}

export async function toggleSupplierActive(id: string, active: boolean) {
  const sb = adminClient()
  await sb
    .from('suppliers')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/suppliers')
  revalidatePath(`/suppliers/${id}`)
}
