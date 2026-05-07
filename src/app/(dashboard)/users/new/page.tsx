import { PageHeader } from '@/components/PageHeader'
import { UserInviteForm } from './UserInviteForm'

type PageProps = { searchParams: Promise<{ kind?: 'team' | 'customer'; role?: string }> }

export default async function NewUserPage({ searchParams }: PageProps) {
  const { kind = 'team', role } = await searchParams
  const isCustomer = kind === 'customer'

  return (
    <div>
      <PageHeader
        title={isCustomer ? 'Add customer' : 'Invite teammate'}
        subtitle={isCustomer
          ? "Create a customer account by email — they'll set their own password."
          : 'Create an operator account: admin, wholesaler, or retailer.'}
        breadcrumbs={
          isCustomer
            ? [{ label: 'People' }, { label: 'Customers', href: '/customers' }, { label: 'Add' }]
            : [{ label: 'People' }, { label: 'Team', href: '/users' }, { label: 'Invite' }]
        }
      />
      <UserInviteForm
        kind={kind}
        defaultRole={(role as 'customer' | 'retailer' | 'wholesaler' | 'admin' | undefined) ?? (isCustomer ? 'customer' : 'admin')}
      />
    </div>
  )
}
