import type { Metadata } from "next";
import { PoliciesShell } from "@/components/policies/PoliciesShell";

export const metadata: Metadata = {
  title: "Shipping policy",
  description: "How NuLakaz handles delivery, lead times, and shipping fees across Mauritius.",
};

export default function ShippingPolicyPage() {
  return <PoliciesShell active="shipping-policy" />;
}
