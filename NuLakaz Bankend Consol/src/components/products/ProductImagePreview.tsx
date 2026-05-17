'use client'

import { useState } from 'react'
import { inputCls } from './ui'

export function ProductImagePreview({ initialUrl }: { initialUrl?: string | null }) {
  const [url, setUrl] = useState(initialUrl ?? '')
  const valid = url.length > 0 && /^https?:\/\//i.test(url)

  return (
    <div className="space-y-3">
      <input
        name="image_url"
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://cdn.example.com/product.jpg"
        className={inputCls}
      />
      <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-canvas/60 ring-1 ring-ink-200/40">
        {valid ? (
          <img src={url} alt="" className="aspect-square w-full object-cover" />
        ) : (
          <div className="flex aspect-square flex-col items-center justify-center gap-2 p-6 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-ink-100 text-ink-400">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
            <p className="text-xs text-ink-500">Image preview appears when you paste a valid URL</p>
          </div>
        )}
      </div>
    </div>
  )
}
