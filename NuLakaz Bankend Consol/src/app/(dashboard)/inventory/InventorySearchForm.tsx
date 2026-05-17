'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { inputCls } from '@/components/admin/ui'

type Props = {
  defaultQ: string
  filter: string
  location?: string
}

function buildUrl(q: string, filter: string, location?: string) {
  const params = new URLSearchParams()
  const trimmed = q.trim()
  if (trimmed) params.set('q', trimmed)
  if (filter && filter !== 'all') params.set('filter', filter)
  if (location && location !== 'all' && location !== 'warehouse') {
    params.set('location', location)
  }
  const qs = params.toString()
  return qs ? `/inventory?${qs}` : '/inventory'
}

export function InventorySearchForm({ defaultQ, filter, location }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState(defaultQ)
  const [isPending, startTransition] = useTransition()
  const skipDebounce = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setQuery(defaultQ)
    skipDebounce.current = true
  }, [defaultQ])

  useEffect(() => {
    if (skipDebounce.current) {
      skipDebounce.current = false
      return
    }

    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const next = buildUrl(query, filter, location)
      const current = buildUrl(defaultQ, filter, location)
      if (next !== current) {
        startTransition(() => router.replace(next, { scroll: false }))
      }
    }, 280)

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [query, filter, location, defaultQ, router])

  const searching = query.trim() !== defaultQ.trim() || isPending

  return (
    <div className="relative min-w-0 flex-1">
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search name or SKU…"
        autoComplete="off"
        spellCheck={false}
        aria-label="Search products by name or SKU"
        className={`${inputCls} pl-10 ${query ? 'pr-16' : 'pr-10'} ${searching ? 'ring-prime-200/80' : ''}`}
      />
      {searching && (
        <span
          className="pointer-events-none absolute right-9 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-ink-200 border-t-prime-700"
          aria-hidden
        />
      )}
      {query.length > 0 && (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[11px] font-semibold text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
          aria-label="Clear search"
        >
          Clear
        </button>
      )}
    </div>
  )
}
