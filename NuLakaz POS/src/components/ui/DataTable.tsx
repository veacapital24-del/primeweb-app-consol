import type { ReactNode } from 'react'

export function DataTable({
  children,
  minWidth = '640px',
  className = '',
}: {
  children: ReactNode
  minWidth?: string
  className?: string
}) {
  return (
    <div className={'overflow-x-auto rounded-2xl border border-ink-300/50 bg-paper shadow-sm ' + className}>
      <table className="w-full text-sm" style={{ minWidth }}>
        {children}
      </table>
    </div>
  )
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-paper-dim/50 text-left text-xs font-bold uppercase tracking-[0.12em] text-ink-500">
      {children}
    </thead>
  )
}

export function TableHeadRow({ children }: { children: ReactNode }) {
  return <tr className="border-b border-ink-300/60">{children}</tr>
}

export function Th({
  children,
  align = 'left',
  className = '',
}: {
  children?: ReactNode
  align?: 'left' | 'right' | 'center'
  className?: string
}) {
  const alignCls = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  return <th className={'px-5 py-3.5 ' + alignCls + ' ' + className}>{children}</th>
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-ink-300/50">{children}</tbody>
}

export function TableRow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <tr className={'transition hover:bg-prime-50/20 ' + className}>{children}</tr>
}

export function Td({
  children,
  align = 'left',
  className = '',
}: {
  children?: ReactNode
  align?: 'left' | 'right' | 'center'
  className?: string
}) {
  const alignCls = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  return <td className={'px-5 py-3.5 ' + alignCls + ' ' + className}>{children}</td>
}
