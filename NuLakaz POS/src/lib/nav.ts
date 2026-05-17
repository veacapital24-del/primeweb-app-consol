export type NavIconId =
  | 'hub'
  | 'register'
  | 'shifts'
  | 'reports'
  | 'locations'
  | 'registers'
  | 'staff'
  | 'stock'
  | 'transfers'
  | 'settings'

export type NavItem = {
  id: string
  label: string
  description?: string
  href?: string
  external?: boolean
  icon: NavIconId
  disabled?: boolean
}

export type NavSection = {
  title: string
  items: NavItem[]
}

const ADMIN_POS_SETTINGS = `${process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001'}/settings/pos`

export const POS_NAV: NavSection[] = [
  {
    title: 'Main',
    items: [
      {
        id: 'hub',
        label: 'Dashboard',
        description: 'Overview and quick actions',
        href: '/',
        icon: 'hub',
      },
    ],
  },
  {
    title: 'Sell & run',
    items: [
      {
        id: 'register',
        label: 'Register',
        description: 'Sell, scan, take payment',
        href: '/register',
        icon: 'register',
      },
      {
        id: 'shifts',
        label: 'Shifts',
        description: 'Open, close, cash counts',
        href: '/shifts',
        icon: 'shifts',
      },
      {
        id: 'reports',
        label: 'Reports',
        description: 'Sales, payments, tax',
        href: '/reports',
        icon: 'reports',
      },
    ],
  },
  {
    title: 'Locations & team',
    items: [
      {
        id: 'locations',
        label: 'Locations',
        description: 'Stores and warehouses',
        href: '/locations',
        icon: 'locations',
      },
      {
        id: 'registers',
        label: 'Registers',
        description: 'POS terminals',
        href: '/registers',
        icon: 'registers',
      },
      {
        id: 'staff',
        label: 'Staff',
        description: 'Cashiers and managers',
        href: '/staff',
        icon: 'staff',
      },
    ],
  },
  {
    title: 'Inventory',
    items: [
      {
        id: 'stock',
        label: 'Stock',
        description: 'On-hand counts',
        href: '/stock',
        icon: 'stock',
      },
      {
        id: 'transfers',
        label: 'Stock transfers',
        description: 'Move stock between sites',
        icon: 'transfers',
        disabled: true,
      },
    ],
  },
  {
    title: 'Configuration',
    items: [
      {
        id: 'settings',
        label: 'POS settings',
        description: 'Receipts, defaults, hardware',
        href: ADMIN_POS_SETTINGS,
        external: true,
        icon: 'settings',
      },
    ],
  },
]

export function isNavActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function findNavItem(pathname: string): NavItem | undefined {
  for (const section of POS_NAV) {
    for (const item of section.items) {
      if (item.href && !item.external && isNavActive(pathname, item.href)) return item
    }
  }
  return undefined
}
