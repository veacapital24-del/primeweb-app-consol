import './globals.css'
import type { Metadata } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'

const sans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '700', '900'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'NuLakaz — POS',
  description: 'Cloud point-of-sale, online & offline, multi-location',
}

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
        {modal}
      </body>
    </html>
  )
}
