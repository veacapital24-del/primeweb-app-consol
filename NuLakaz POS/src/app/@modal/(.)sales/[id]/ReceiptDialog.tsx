'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function ReceiptDialog({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') router.back()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [router])

  return (
    <div
      onClick={() => router.back()}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-900/60 px-4 py-8 backdrop-blur-sm print:static print:bg-transparent print:p-0 print:backdrop-blur-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-ink-300 bg-paper p-5 shadow-2xl print:max-w-none print:border-0 print:p-0 print:shadow-none"
      >
        <button
          onClick={() => router.back()}
          className="no-print absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-paper-dim/80 text-ink-700 hover:bg-paper-dim hover:text-ink-900"
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}
