import Link from 'next/link'
import type { ReactNode } from 'react'

export function TextLink({
  href,
  children,
  external,
}: {
  href: string
  children: ReactNode
  external?: boolean
}) {
  const cls =
    'text-xs font-semibold text-prime-700 underline decoration-prime-300/60 underline-offset-2 transition hover:text-prime-800'

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  )
}
