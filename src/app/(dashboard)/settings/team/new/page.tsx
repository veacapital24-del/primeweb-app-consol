import Link from 'next/link'
import { UserInviteForm } from './UserInviteForm'

type PageProps = { searchParams: Promise<{ kind?: 'team' | 'customer'; role?: string }> }

export default async function NewUserPage({ searchParams }: PageProps) {
  const { kind = 'team', role } = await searchParams
  const isCustomer = kind === 'customer'

  return (
    <div className="space-y-5">
      <header>
        <Link
          href={isCustomer ? '/customers' : '/settings/team'}
          className="text-xs font-semibold text-ink-500 underline hover:text-ink-900"
        >
          ← Back to {isCustomer ? 'customers' : 'team'}
        </Link>
        <h2 className="font-display mt-2 text-2xl font-black tracking-tight">
          {isCustomer ? 'Add customer' : 'Invite teammate'}
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          {isCustomer
            ? "Create a customer account by email — they'll set their own password."
            : 'Create an operator account: admin, wholesaler, or retailer.'}
        </p>
      </header>
      <UserInviteForm
        kind={kind}
        defaultRole={(role as 'customer' | 'retailer' | 'wholesaler' | 'admin' | undefined) ?? (isCustomer ? 'customer' : 'admin')}
      />
    </div>
  )
}
