import type { Metadata } from "next";
import { ComingSoon } from "@/components/maintenance/ComingSoon";

export const metadata: Metadata = {
  title: "Coming soon",
  description: "The new NuLakaz storefront is being polished — back very soon.",
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  return <ComingSoon />;
}
