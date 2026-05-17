type IconProps = { className?: string }

export function IconRegister({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" d="M4 7h16M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2M6 7l-1 14h14L18 7" />
      <path strokeLinecap="round" d="M9 11v6M15 11v6" />
    </svg>
  )
}

export function IconShifts({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <path strokeLinecap="round" d="M12 8v4l3 2" />
    </svg>
  )
}

export function IconLocations({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  )
}

export function IconRegisters({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path strokeLinecap="round" d="M8 20h8M12 17v3" />
    </svg>
  )
}

export function IconStaff({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="9" cy="8" r="3" />
      <path strokeLinecap="round" d="M3 19c0-3.3 2.7-5 6-5" />
      <circle cx="17" cy="9" r="2.5" />
      <path strokeLinecap="round" d="M14 19c0-2.5 1.8-4 5-4" />
    </svg>
  )
}

export function IconStock({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8l8-4 8 4-8 4-8-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12l8 4 8-4M4 16l8 4 8-4" />
    </svg>
  )
}

export function IconTransfers({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h11M14 4l4 3-4 3M17 17H6M10 20l-4-3 4-3" />
    </svg>
  )
}

export function IconReports({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" d="M5 19V9M12 19V5M19 19v-6" />
    </svg>
  )
}

export function IconSettings({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
      />
    </svg>
  )
}

export function IconArrow({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h9M8 4l4 4-4 4" />
    </svg>
  )
}

export function IconExternal({ className = 'h-3.5 w-3.5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" d="M10 2h4v4M6 10l8-8M13 9v5H3V3h5" />
    </svg>
  )
}
