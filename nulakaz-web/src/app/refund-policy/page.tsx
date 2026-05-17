import type { Metadata } from "next";
import { PoliciesShell } from "@/components/policies/PoliciesShell";

export const metadata: Metadata = {
  title: "Refund policy",
  description: "NuLakaz refund policy — eligibility, process, and timelines for returning products.",
};

export default function RefundPolicyPage() {
  return <PoliciesShell active="refund-policy" />;
}
