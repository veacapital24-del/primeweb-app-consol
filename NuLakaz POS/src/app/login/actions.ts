'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { serverClient } from '@/lib/supabase'

export async function signIn(form: FormData) {
  const email = String(form.get('email') ?? '').trim().toLowerCase()
  const password = String(form.get('password') ?? '')
  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const sb = await serverClient()
  const { error } = await sb.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
