import { notFound } from 'next/navigation'
import { Receipt } from '@/app/sales/[id]/Receipt'
import { loadReceipt } from '@/app/sales/[id]/load'
import { ReceiptDialog } from './ReceiptDialog'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ id: string }> }

export default async function InterceptedSalePage({ params }: PageProps) {
  const { id } = await params
  const data = await loadReceipt(id)
  if (!data) notFound()
  return (
    <ReceiptDialog>
      <Receipt {...data} embedded />
    </ReceiptDialog>
  )
}
