// Static site constants pulled from nulakaz.com live crawl (2026-04-16).
// Update these when branding changes — components read from here, not from strings.

export const site = {
  name: "NuLakaz",
  legalName: "NuLaz Online Grocery",
  tagline:
    "We provide a carefully curated selection of household staples, fresh produce, dry goods, snacks, and essential kitchen items sourced both locally and globally delivered straight to your door.",
  announcement: "Delivery on next day, from Mon-Fri from 10am - 6pm",
  origin: "https://nulakaz.com",
  contact: {
    email: "info@nulakaz.com",
    phone: "+230 5488 9652",
    supportPhone: "+230 5778525",
    address: "222 Royal Road, Riche Terre, Mauritius",
    hours: "Mon-Fri: 10:00 – 18:00",
  },
  currency: {
    code: "MUR",
    symbol: "₨",
    prefix: "₨",
    decimals: 2,
  },
  delivery: {
    freeOver: 1000, // Rs
    window: "Mon-Fri 10am-6pm",
    leadTime: "Next-day delivery",
  },
  nav: {
    categories: [
      { label: "Milk", slug: "milk" },
      {
        label: "Fresh Produce",
        slug: "fresh-produce",
        children: [
          {
            label: "Fresh Fruit",
            slug: "fresh-fruit",
            children: [
              { label: "Apple & Stone Fruits", slug: "apple-stone-fruits" },
              { label: "Berries", slug: "berries" },
              { label: "Tropical & Exotic", slug: "tropical-exotic" },
            ],
          },
        ],
      },
      { label: "Meat", slug: "meat" },
      { label: "Seafood", slug: "fish-seafood" },
      { label: "Baking", slug: "baking" },
      { label: "Drinks", slug: "drinks" },
    ],
    utility: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
      { label: "Monthly Essentials", href: "/monthly-essentials" },
      { label: "Brands", href: "/brands" },
      { label: "Order Tracking", href: "/order-tracking" },
      { label: "Contacts", href: "/contacts" },
    ],
  },
  footer: {
    shopLinks: [
      { label: "All products", href: "/shop" },
      { label: "Monthly Essentials", href: "/monthly-essentials" },
      { label: "Brands", href: "/brands" },
      { label: "Blog", href: "/blog" },
      { label: "Order tracking", href: "/order-tracking" },
      { label: "Contact", href: "/contacts" },
    ],
    companyLinks: [
      { label: "FAQ", href: "/faq" },
      { label: "Shipping policy", href: "/shipping-policy" },
      { label: "Refund policy", href: "/refund-policy" },
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms & conditions", href: "/terms-and-conditions" },
    ],
    newsletterPitch:
      "Sign up to get 10% off your first order and stay up to date on the latest product releases, special offers and news.",
    appStoreUrl: "#",
    playStoreUrl: "#",
    copyright: "© 2025 NuLaz Online Grocery. All Rights Reserved.",
  },
} as const;

export type SiteConfig = typeof site;
