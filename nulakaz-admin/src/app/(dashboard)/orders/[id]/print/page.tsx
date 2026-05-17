import { notFound } from 'next/navigation'
import { fetchPackingSlip } from '@/lib/packing-slip'
import { PrintView } from './PrintView'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ auto?: string }>
}

export default async function OrderPrintPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { auto } = await searchParams

  let slip
  try {
    slip = await fetchPackingSlip(id)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load order'
    throw new Error(message)
  }

  if (!slip) notFound()

  return <PrintView slip={slip} autoPrint={auto === '1'} />
}
