'use client'

import { useRef, useState } from 'react'
import { browserClient } from '@/lib/supabase-browser'

type Accept = 'image' | 'video' | 'image+video'

type Props = {
  /** Hidden input name — the resolved public URL is written here */
  name: string
  /** Supabase storage bucket id */
  bucket: string
  /** Current value (URL) */
  value: string
  onChange: (url: string) => void
  accept?: Accept
  /** Aspect ratio class for the preview box, e.g. 'aspect-square' */
  aspectRatio?: string
  label?: string
  hint?: string
}

const ACCEPT_MAP: Record<Accept, string> = {
  image: 'image/jpeg,image/png,image/webp,image/gif,image/avif',
  video: 'video/mp4,video/quicktime,video/webm,video/x-m4v',
  'image+video': 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm',
}

function isVideo(url: string) {
  return /\.(mp4|mov|webm|m4v|m3u8)(\?|$)/i.test(url)
}

export function FileUpload({
  name,
  bucket,
  value,
  onChange,
  accept = 'image',
  aspectRatio = 'aspect-square',
  label,
  hint,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [urlMode, setUrlMode] = useState(false)

  const sb = browserClient()

  const upload = async (file: File) => {
    setUploading(true)
    setUploadError(null)
    try {
      const ext = file.name.split('.').pop() ?? 'bin'
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await sb.storage.from(bucket).upload(path, file, {
        cacheControl: '31536000',
        upsert: false,
      })
      if (error) throw new Error(error.message)
      const { data } = sb.storage.from(bucket).getPublicUrl(path)
      onChange(data.publicUrl)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }

  const hasMedia = value.trim().length > 0 && /^https?:\/\//i.test(value)
  const showVideo = hasMedia && isVideo(value)

  return (
    <div className="space-y-2">
      {/* Hidden form field */}
      <input type="hidden" name={name} value={value} />

      {label && (
        <p className="text-xs font-semibold text-ink-700">{label}</p>
      )}

      {/* Drop zone / preview */}
      <div
        className={`relative ${aspectRatio} min-h-[200px] overflow-hidden rounded-2xl border-2 border-dashed border-ink-300/70 bg-canvas/60 transition hover:border-prime-400/80`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        {hasMedia ? (
          showVideo ? (
            /* eslint-disable-next-line jsx-a11y/media-has-caption */
            <video
              key={value}
              src={value}
              className="h-full w-full object-contain bg-ink-950"
              controls
              playsInline
            />
          ) : (
            <img src={value} alt="" className="h-full w-full object-cover" />
          )
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center"
          >
            {uploading ? (
              <>
                <UploadSpinner />
                <p className="text-xs font-semibold text-prime-700">Uploading…</p>
              </>
            ) : (
              <>
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-prime-50 text-prime-600 ring-1 ring-prime-200/70">
                  {accept === 'video' ? <IconVideo /> : <IconUpload />}
                </div>
                <p className="text-sm font-bold text-ink-800">
                  {accept === 'video' ? 'Upload video' : 'Upload image'}
                </p>
                <p className="text-xs font-semibold text-prime-700 underline-offset-2 hover:underline">
                  Click to browse files
                </p>
                <p className="text-[11px] text-ink-500 mt-1">
                  {accept === 'image' ? 'JPG, PNG, WebP · max 5 MB' :
                   accept === 'video' ? 'MP4, MOV, WebM · max 500 MB' :
                   'Image or video · drag & drop or click'}
                </p>
              </>
            )}
          </button>
        )}

        {/* Replace overlay when media is present */}
        {hasMedia && !uploading && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute right-2 top-2 flex items-center gap-1.5 rounded-xl border border-ink-300/80 bg-paper/90 px-2.5 py-1.5 text-[11px] font-bold text-ink-800 shadow backdrop-blur-sm transition hover:border-prime-400 hover:text-prime-700"
          >
            <IconUpload className="h-3.5 w-3.5" />
            Replace
          </button>
        )}

        {uploading && hasMedia && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper/70 backdrop-blur-sm">
            <UploadSpinner />
          </div>
        )}
      </div>

      {uploadError && (
        <p className="rounded-lg border border-flash-500/30 bg-flash-50 px-3 py-2 text-xs text-flash-700">
          {uploadError}
        </p>
      )}

      {/* URL paste toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setUrlMode((m) => !m)}
          className="text-[11px] font-semibold text-prime-700 underline-offset-2 hover:underline"
        >
          {urlMode ? 'Hide URL field' : 'Or paste a URL instead'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => { onChange(''); setUploadError(null) }}
            className="text-[11px] font-semibold text-flash-600 hover:text-flash-700"
          >
            · Clear
          </button>
        )}
      </div>

      {urlMode && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          className="w-full rounded-xl border border-ink-300/80 bg-paper px-3 py-2.5 text-sm text-ink-900 shadow-inner shadow-ink-900/[0.03] placeholder:text-ink-400 focus:border-prime-400 focus:outline-none focus:ring-2 focus:ring-prime-200/60"
        />
      )}

      {hint && <p className="text-[11px] leading-relaxed text-ink-500">{hint}</p>}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT_MAP[accept]}
        className="sr-only"
        onChange={onFileChange}
      />
    </div>
  )
}

function UploadSpinner() {
  return (
    <svg className="h-6 w-6 animate-spin text-prime-600" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 10h-2a8 8 0 01-8-8z" />
    </svg>
  )
}

function IconUpload({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}
function IconVideo() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.862v6.276a1 1 0 0 1-1.447.931L15 14v-4Z" />
      <rect x="2" y="6" width="13" height="12" rx="2" />
    </svg>
  )
}
