'use client'

import Link from 'next/link'

export default function PrintError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-flash-500/30 bg-flash-50 p-8 text-center">
      <h1 className="font-display text-lg font-bold text-flash-800">Could not load packing slip</h1>
      <p className="mt-2 text-sm text-flash-700">
        {error.message || 'Something went wrong while loading this order for printing.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-prime-700 px-4 py-2 text-sm font-bold text-paper hover:bg-prime-800"
        >
          Try again
        </button>
        <Link
          href="/orders"
          className="rounded-xl border border-ink-300 bg-paper px-4 py-2 text-sm font-semibold text-ink-800 hover:border-prime-400"
        >
          Back to orders
        </Link>
      </div>
    </div>
  )
}
