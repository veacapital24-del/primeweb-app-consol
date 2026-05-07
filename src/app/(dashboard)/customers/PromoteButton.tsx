'use client'

import { useTransition } from 'react'
import { setUserRole } from '../settings/team/actions'

// Lets an admin upgrade a customer to retailer / wholesaler from the customers list.
export function PromoteButton({ userId }: { userId: string }) {
  const [pending, start] = useTransition()
  return (
    <select
      defaultValue=""
      disabled={pending}
      onChange={(e) => {
        const v = e.target.value as 'retailer' | 'wholesaler' | 'admin' | ''
        if (!v) return
        if (!confirm(`Promote this user to "${v}"? They'll move to the Team list.`)) {
          e.target.value = ''
          return
        }
        start(async () => { await setUserRole(userId, v) })
      }}
      className="rounded-md border border-ink-300 bg-paper px-2 py-1 text-[11px] font-bold text-ink-700 hover:border-prime-700"
    >
      <option value="">Promote…</option>
      <option value="retailer">Retailer (tabagie)</option>
      <option value="wholesaler">Wholesaler (B2B)</option>
      <option value="admin">Admin</option>
    </select>
  )
}
