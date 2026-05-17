'use client'

import { useTransition, useState } from 'react'
import { setUserRole, setWhatsAppOptIn } from './actions'

const ROLES = ['customer', 'retailer', 'wholesaler', 'admin'] as const

export function RoleSelect({ userId, current }: { userId: string; current: string }) {
  const [pending, start] = useTransition()
  const [value, setValue] = useState(current)
  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as typeof ROLES[number]
        setValue(next)
        start(async () => { await setUserRole(userId, next) })
      }}
      className={`rounded-md border px-2 py-1 text-xs font-bold capitalize transition ${roleClass(value)}`}
    >
      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
    </select>
  )
}

export function OptInToggle({ userId, current }: { userId: string; current: boolean }) {
  const [pending, start] = useTransition()
  const [value, setValue] = useState(current)
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-xs">
      <input
        type="checkbox"
        checked={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.checked
          setValue(next)
          start(async () => { await setWhatsAppOptIn(userId, next) })
        }}
        className="h-4 w-4 rounded border-ink-300 text-prime-700 focus:ring-prime-500"
      />
      {value ? <span className="text-mint-600 font-semibold">on</span> : <span className="text-ink-500">off</span>}
    </label>
  )
}

function roleClass(role: string) {
  switch (role) {
    case 'admin':       return 'border-flash-500 bg-flash-50 text-flash-700'
    case 'wholesaler':  return 'border-prime-700 bg-prime-50 text-prime-700'
    case 'retailer':    return 'border-amber-500 bg-amber-50 text-amber-700'
    default:            return 'border-ink-300 bg-paper text-ink-700'
  }
}
