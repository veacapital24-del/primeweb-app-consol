'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { searchCustomers } from './actions'

export type CustomerOption = {
  id: string
  full_name: string | null
  phone: string | null
}

export function CustomerPicker({
  value,
  onChange,
}: {
  value: CustomerOption | null
  onChange: (c: CustomerOption | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [results, setResults] = useState<CustomerOption[]>([])
  const [isPending, start] = useTransition()
  const popRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!popRef.current) return
      if (!popRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    if (!open) return
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    const handle = setTimeout(() => {
      start(async () => {
        const rows = await searchCustomers(q)
        setResults(rows)
      })
    }, 200)
    return () => clearTimeout(handle)
  }, [q, open])

  const label = value ? (value.full_name ?? value.phone ?? value.id.slice(0, 8)) : null

  return (
    <div ref={popRef} className="relative">
      {value ? (
        <div className="flex items-center justify-between rounded-xl border border-prime-500/50 bg-prime-50 px-3 py-2">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-prime-700">Customer</div>
            <div className="truncate text-sm font-semibold">{label}</div>
            {value.phone && value.full_name && (
              <div className="truncate text-xs text-ink-500">{value.phone}</div>
            )}
          </div>
          <button
            onClick={() => onChange(null)}
            className="ml-2 shrink-0 rounded-md bg-paper px-2 py-1 text-xs font-bold text-ink-700 hover:text-flash-700"
            aria-label="Remove customer"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full rounded-xl border border-dashed border-ink-300 bg-paper-dim/40 px-3 py-2 text-left text-sm text-ink-700 hover:border-prime-500"
        >
          + Add customer
        </button>
      )}

      {open && !value && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-xl border border-ink-300 bg-paper p-2 shadow-lg">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or phone…"
            className="w-full rounded-lg border border-ink-300 bg-paper px-3 py-2 text-sm focus:border-prime-500 focus:outline-none focus:ring-2 focus:ring-prime-200"
          />
          <div className="mt-1.5 max-h-56 overflow-y-auto">
            {q.trim().length < 2 ? (
              <div className="px-2 py-2 text-xs text-ink-500">Type 2+ characters to search.</div>
            ) : isPending ? (
              <div className="px-2 py-2 text-xs text-ink-500">Searching…</div>
            ) : results.length === 0 ? (
              <div className="px-2 py-2 text-xs text-ink-500">No matches.</div>
            ) : (
              <ul className="space-y-0.5">
                {results.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => {
                        onChange(r)
                        setOpen(false)
                        setQ('')
                      }}
                      className="block w-full rounded-md px-2 py-2 text-left text-sm hover:bg-paper-dim"
                    >
                      <div className="font-semibold">{r.full_name ?? '—'}</div>
                      {r.phone && <div className="text-xs text-ink-500">{r.phone}</div>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
