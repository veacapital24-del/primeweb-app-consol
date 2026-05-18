'use client'

import { useState } from 'react'
import { FileUpload } from '@/components/admin/FileUpload'

export function ProductImagePreview({ initialUrl }: { initialUrl?: string | null }) {
  const [url, setUrl] = useState(initialUrl ?? '')

  return (
    <FileUpload
      name="image_url"
      bucket="product-images"
      value={url}
      onChange={setUrl}
      accept="image"
      aspectRatio="aspect-square"
      hint="JPG, PNG, or WebP · max 5 MB · stored in Supabase Storage"
    />
  )
}
