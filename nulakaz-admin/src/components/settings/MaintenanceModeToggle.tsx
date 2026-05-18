'use client'

import { useState, useTransition } from 'react'
import { setMaintenanceMode } from '@/app/(dashboard)/settings/website/actions'

export function MaintenanceModeToggle({
  settingId,
  enabled: initialEnabled,
}: {
  settingId?: string
  enabled: boolean
}) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isPending, start] = useTransition()

  const onToggle = () => {
    const next = !enabled
    setEnabled(next)
    const form = new FormData()
    if (settingId) form.set('id', settingId)
    form.set('enabled', String(next))
    start(async () => {
      await setMaintenanceMode(form)
    })
  }

  return (
    <div className="maintenance-toggle-row">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink-900">
          {enabled ? 'Storefront is offline' : 'Storefront is live'}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-ink-500">
          {enabled
            ? 'Visitors see a maintenance page. Disable when updates are complete.'
            : 'Customers can browse and order normally.'}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={enabled ? 'Disable maintenance mode' : 'Enable maintenance mode'}
        disabled={isPending}
        onClick={onToggle}
        className={`maintenance-toggle ${enabled ? 'maintenance-toggle-on' : ''} ${isPending ? 'opacity-60' : ''}`}
      >
        <span className="maintenance-toggle-knob" aria-hidden />
      </button>
    </div>
  )
}
