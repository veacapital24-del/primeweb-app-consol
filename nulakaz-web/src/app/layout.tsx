import type { Metadata } from "next";
import "./globals.css";
import { connection } from "next/server";
import { headers } from "next/headers";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { ComingSoon } from "@/components/maintenance/ComingSoon";
import { site } from "@/lib/site";
import { getMaintenanceMode } from "@/lib/maintenance";

export const dynamic = "force-dynamic";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — Online Grocery Mauritius`,
    template: `%s | ${site.name}`,
  },
  description: site.tagline,
  metadataBase: new URL(site.origin),
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Ensure this layout resolves at request time before maintenance check.
  await connection();
  const [maintenanceEnabled, h] = await Promise.all([
    getMaintenanceMode(),
    headers(),
  ]);
  const pathname = h.get("x-pathname") ?? "";
  const isComingSoonRoute = pathname === "/coming-soon";

  if (maintenanceEnabled || isComingSoonRoute) {
    return (
      <html
        lang="en"
        className={`${jakarta.variable} ${fraunces.variable} h-full antialiased`}
      >
        <body className="min-h-full">
          {isComingSoonRoute && !maintenanceEnabled ? children : <ComingSoon />}
        </body>
      </html>
    );
  }

  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AnnouncementBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {/* Slide-out cart drawer — mounted once at the layout level so the
            cart-icon-button on every page can trigger it via custom event. */}
        <CartDrawer />
      </body>
    </html>
  );
}
