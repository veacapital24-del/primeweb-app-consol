'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { canConfirmPackingFromPrint, normalizeOrderStatus } from '@/lib/order-status'
import { confirmPackingFromPrint } from '@/app/(dashboard)/orders/actions'

export function PrintPackingSlip({
  orderId,
  orderNumber,
  status,
  compact = false,
}: {
  orderId: string
  orderNumber: string
  status: string
  compact?: boolean
}) {
  const [isPending, start] = useTransition()
  const router = useRouter()
  const normalized = normalizeOrderStatus(status)
  const canConfirm = canConfirmPackingFromPrint(status)
  const printUrl = `/orders/${orderId}/print?auto=1`

  const btn =
    compact
      ? 'rounded-xl px-3 py-2 text-xs font-bold'
      : 'rounded-xl px-4 py-3 text-sm font-bold'

  const btnCls = (extra: string) =>
    `${btn} inline-flex items-center justify-center gap-2 transition ${extra}`

  const goPrint = (withConfirm: boolean) => {
    start(async () => {
      try {
        if (withConfirm && canConfirm) {
          await confirmPackingFromPrint(orderId)
        }
        router.push(printUrl)
      } catch (err) {
        console.error(err)
        window.alert(
          err instanceof Error
            ? err.message
            : 'Could not open the packing slip. Try again or refresh the page.',
        )
      }
    })
  }

  if (normalized === 'cancelled' || normalized === 'completed') {
    return (
      <Link href={printUrl} className={btnCls('border border-ink-300 bg-paper text-ink-800 hover:border-prime-400 no-underline')}>
        {compact ? 'Reprint slip' : 'Reprint packing slip'}
      </Link>
    )
  }

  return (
    <div className={compact ? 'flex flex-wrap gap-2' : 'flex flex-col gap-2 sm:flex-row sm:flex-wrap'}>
      {canConfirm ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => goPrint(true)}
          className={btnCls(
            `bg-ink-900 text-paper shadow-md hover:bg-prime-800 disabled:opacity-60`,
          )}
        >
          {isPending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
          ) : (
            <PrintIcon />
          )}
          Print &amp; confirm packing
        </button>
      ) : (
        <Link
          href={printUrl}
          className={btnCls('border border-ink-300 bg-paper text-ink-800 hover:border-prime-400 no-underline')}
        >
          <PrintIcon />
          Print packing slip
        </Link>
      )}

      {normalized === 'pending' && !compact && (
        <p className="text-xs text-ink-500 sm:self-center">
          Confirm the order first, then print to start packing.
        </p>
      )}

      {!compact && (
        <p className="w-full text-[11px] leading-relaxed text-ink-500">
          Opens in this tab. Use the browser print dialog → <strong>Save as PDF</strong>.
          {canConfirm ? ` Confirms packing for ${orderNumber} and deducts stock.` : ''}
        </p>
      )}
    </div>
  )
}

function PrintIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
      />
    </svg>
  )
}
