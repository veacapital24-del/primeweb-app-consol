import { notFound } from 'next/navigation'
import { Receipt } from './Receipt'
import { loadReceipt } from './load'

export const dynamic = 'force-dynamic'

type PageProps = { params: Promise<{ id: string }> }

export default async function SalePage({ params }: PageProps) {
  const { id } = await params
  const data = await loadReceipt(id)
  if (!data) notFound()
  return <Receipt {...data} />
}
