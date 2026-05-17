import Link from 'next/link'

export const inputCls =
  'w-full rounded-xl border border-ink-300/80 bg-paper px-3.5 py-2.5 text-sm text-ink-900 shadow-inner shadow-ink-900/[0.02] placeholder:text-ink-500 transition focus:border-prime-400 focus:bg-paper focus:outline-none focus:ring-[3px] focus:ring-prime-200/70'

export function GlassCard({
  title,
  desc,
  children,
  className = '',
}: {
  title: string
  desc?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`glass-card p-5 md:p-6 ${className}`}>
      <header className="mb-5">
        <h2 className="font-display text-base font-bold tracking-tight text-ink-900 md:text-lg">
          {title}
        </h2>
        {desc && <p className="mt-1 text-sm leading-relaxed text-ink-500">{desc}</p>}
      </header>
      {children}
    </section>
  )
}

export function Field({
  label,
  required,
  hint,
  children,
  className = '',
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-xs font-semibold text-ink-600">
          {label}
          {required && <span className="ml-0.5 text-flash-500">*</span>}
        </span>
      )}
      {children}
      {hint && <span className="mt-1.5 block text-[11px] leading-relaxed text-ink-500">{hint}</span>}
    </label>
  )
}

export function Toggle({
  name,
  label,
  desc,
  defaultChecked,
}: {
  name: string
  label: string
  desc?: string
  defaultChecked?: boolean
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-ink-200/80 bg-canvas/50 px-4 py-3.5 transition hover:border-prime-200/80 hover:bg-prime-50/30">
      <div>
        <div className="text-sm font-semibold text-ink-900">{label}</div>
        {desc && <p className="mt-0.5 text-xs text-ink-500">{desc}</p>}
      </div>
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span
          className="block h-7 w-12 rounded-full bg-ink-200 transition peer-checked:bg-prime-700 peer-focus-visible:ring-2 peer-focus-visible:ring-prime-400 peer-focus-visible:ring-offset-2 after:absolute after:left-0.5 after:top-0.5 after:block after:h-6 after:w-6 after:rounded-full after:bg-paper after:shadow-sm after:transition peer-checked:after:translate-x-5"
          aria-hidden
        />
      </span>
    </label>
  )
}

export function BtnPrimary({
  href,
  children,
  className = '',
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-xl bg-prime-700 px-4 py-2.5 text-sm font-bold text-paper shadow-md shadow-prime-900/15 transition hover:bg-prime-800 hover:shadow-lg active:scale-[0.98] ${className}`}
    >
      {children}
    </Link>
  )
}

export function BtnSecondary({
  href,
  children,
  className = '',
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-xl border border-ink-300/80 bg-paper px-4 py-2.5 text-sm font-semibold text-ink-800 shadow-sm transition hover:border-prime-300 hover:bg-prime-50/40 hover:text-prime-800 ${className}`}
    >
      {children}
    </Link>
  )
}

export function BtnEdit({ href, children = 'Edit' }: { href: string; children?: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-xs font-semibold text-prime-700 transition hover:text-prime-900"
    >
      {children}
      <span aria-hidden>→</span>
    </Link>
  )
}

export function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent?: 'prime' | 'amber' | 'flash' | 'mint'
}) {
  const ring =
    accent === 'prime'
      ? 'ring-prime-200/60'
      : accent === 'amber'
        ? 'ring-amber-400/40'
        : accent === 'flash'
          ? 'ring-flash-500/30'
          : accent === 'mint'
            ? 'ring-mint-400/40'
            : 'ring-ink-200/40'
  return (
    <div className={`glass-card px-4 py-3 ring-1 ${ring}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">{label}</p>
      <p className="font-display mt-1 text-2xl font-black tabular-nums text-ink-900">{value}</p>
    </div>
  )
}

export function ActiveBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex rounded-full bg-mint-50 px-2.5 py-1 text-[10px] font-bold text-mint-700 ring-1 ring-mint-500/25">
        Active
      </span>
    )
  }
  return (
    <span className="inline-flex rounded-full bg-flash-50 px-2.5 py-1 text-[10px] font-bold text-flash-700 ring-1 ring-flash-500/25">
      Inactive
    </span>
  )
}

export function AlertError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-flash-500/40 bg-flash-50 px-4 py-3 text-sm text-flash-700">
      {message}
    </div>
  )
}

export function FormStickyBar({
  backHref,
  backLabel,
  submitLabel,
  pendingLabel = 'Saving…',
  isPending,
}: {
  backHref: string
  backLabel: string
  submitLabel: string
  pendingLabel?: string
  isPending: boolean
}) {
  return (
    <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-2 rounded-2xl border border-ink-300/50 bg-paper/90 px-4 py-3 shadow-xl shadow-ink-900/10 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5">
      <Link
        href={backHref}
        className="text-center text-sm font-semibold text-ink-600 transition hover:text-prime-700 sm:text-left"
      >
        {backLabel}
      </Link>
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-prime-700 px-5 py-3 text-sm font-bold text-paper shadow-md shadow-prime-900/15 transition hover:bg-prime-800 disabled:opacity-50 sm:w-auto sm:py-2.5"
      >
        {isPending ? pendingLabel : submitLabel}
      </button>
    </div>
  )
}

export function EmptyState({
  title,
  action,
}: {
  title: string
  action?: { href: string; label: string }
}) {
  return (
    <div className="glass-card flex flex-col items-center justify-center gap-3 p-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-ink-100 text-ink-400">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 7h16M4 12h10M4 17h6" />
        </svg>
      </div>
      <p className="text-sm font-medium text-ink-700">{title}</p>
      {action && (
        <BtnPrimary href={action.href} className="mt-1">
          {action.label}
        </BtnPrimary>
      )}
    </div>
  )
}

export function SearchInput({
  name = 'q',
  defaultValue,
  placeholder,
  hiddenFields,
}: {
  name?: string
  defaultValue?: string
  placeholder?: string
  hiddenFields?: Record<string, string>
}) {
  return (
    <>
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`${inputCls} pl-10`}
      />
      {hiddenFields &&
        Object.entries(hiddenFields).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
    </>
  )
}

export function FilterPill({
  href,
  active,
  label,
  count,
}: {
  href: string
  active: boolean
  label: string
  count?: number
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
        active
          ? 'bg-prime-700 text-paper shadow-sm shadow-prime-900/15'
          : 'bg-paper text-ink-700 ring-1 ring-ink-200/80 hover:bg-prime-50/50 hover:ring-prime-200/80'
      }`}
    >
      {label}
      {count != null && (
        <span className={active ? 'opacity-75 tabular-nums' : 'tabular-nums text-ink-500'}>
          {count}
        </span>
      )}
    </Link>
  )
}

export function CatalogCard({
  href,
  children,
  className = '',
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <article
      className={`glass-card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink-900/8 ${className}`}
    >
      <Link href={href} className="block">
        {children}
      </Link>
    </article>
  )
}

export function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-card hidden overflow-x-auto sm:block">
      <table className="w-full text-sm">{children}</table>
    </div>
  )
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-ink-200/60 bg-canvas/40 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-500">
      {children}
    </thead>
  )
}

export function IconPlus({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function PriceInput({ name, defaultValue }: { name: string; defaultValue: number }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-ink-500">
        Rs
      </span>
      <input
        name={name}
        type="number"
        step="0.01"
        min={0}
        defaultValue={defaultValue}
        className={`${inputCls} pl-10 font-display text-lg font-bold tabular-nums`}
      />
    </div>
  )
}

export function StockBadge({ available }: { available: number | null }) {
  if (available == null) {
    return <span className="text-xs text-ink-400">—</span>
  }
  if (available === 0) {
    return (
      <span className="inline-flex rounded-full bg-flash-50 px-2.5 py-1 text-[10px] font-bold text-flash-700 ring-1 ring-flash-500/25">
        Sold out
      </span>
    )
  }
  if (available <= 5) {
    return (
      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-amber-500/25">
        {available} left
      </span>
    )
  }
  return <span className="font-semibold tabular-nums text-ink-900">{available}</span>
}

export function ProductTags({
  active,
  isHardDiscount,
}: {
  active: boolean
  isHardDiscount: boolean
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {!active && (
        <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold text-ink-600 ring-1 ring-ink-200/60">
          Inactive
        </span>
      )}
      {isHardDiscount && (
        <span className="rounded-full bg-prime-50 px-2 py-0.5 text-[10px] font-bold text-prime-700 ring-1 ring-prime-200/80">
          Hard discount
        </span>
      )}
    </div>
  )
}
