import type { ComponentType } from 'react'
import type { NavIconId } from '@/lib/nav'
import {
  IconLocations,
  IconRegister,
  IconRegisters,
  IconReports,
  IconSettings,
  IconShifts,
  IconStaff,
  IconStock,
  IconTransfers,
} from '@/components/hub/icons'

function IconHub({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  )
}

const MAP: Record<NavIconId, ComponentType<{ className?: string }>> = {
  hub: IconHub,
  register: IconRegister,
  shifts: IconShifts,
  reports: IconReports,
  locations: IconLocations,
  registers: IconRegisters,
  staff: IconStaff,
  stock: IconStock,
  transfers: IconTransfers,
  settings: IconSettings,
}

export function NavIcon({ id, className = 'h-5 w-5' }: { id: NavIconId; className?: string }) {
  const Cmp = MAP[id]
  return <Cmp className={className} />
}
