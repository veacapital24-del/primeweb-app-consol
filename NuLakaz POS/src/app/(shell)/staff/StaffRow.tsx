'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { SELECT_CLASS, TableRow, Td } from '@/components/ui'
import { removeStaff, updateRole } from './actions'
import type { PosRole } from './types'

export function StaffRow({
  user_id,
  location_id,
  initialRole,
  userLabel,
  locationLabel,
}: {
  user_id: string
  location_id: string
  initialRole: PosRole
  userLabel: React.ReactNode
  locationLabel: React.ReactNode
}) {
  const [role, setRole] = useState<PosRole>(initialRole)
  const [error, setError] = useState<string | null>(null)
  const [isPending, start] = useTransition()
  const router = useRouter()

  return (
    <TableRow>
      <Td>{userLabel}</Td>
      <Td className="text-ink-700">{locationLabel}</Td>
      <Td>
        <select
          value={role}
          onChange={(e) => {
            const next = e.target.value as PosRole
            setError(null)
            setRole(next)
            start(async () => {
              const result = await updateRole(user_id, location_id, next)
              if (result?.error) {
                setError(result.error)
                setRole(initialRole)
              } else {
                router.refresh()
              }
            })
          }}
          disabled={isPending}
          className={SELECT_CLASS + ' px-2 py-1 text-xs font-semibold capitalize'}
        >
          <option value="cashier">cashier</option>
          <option value="manager">manager</option>
        </select>
        {error && <div className="mt-1 text-[11px] text-flash-700">{error}</div>}
      </Td>
      <Td align="right">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (!confirm('Remove this assignment?')) return
            start(async () => {
              const result = await removeStaff(user_id, location_id)
              if (result?.error) setError(result.error)
              else router.refresh()
            })
          }}
          className="text-xs font-semibold text-flash-700 underline hover:text-flash-500 disabled:opacity-50"
        >
          Remove
        </button>
      </Td>
    </TableRow>
  )
}
