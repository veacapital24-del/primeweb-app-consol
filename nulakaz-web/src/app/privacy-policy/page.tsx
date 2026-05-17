import type { Metadata } from "next";
import { PoliciesShell } from "@/components/policies/PoliciesShell";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How NuLakaz collects, stores, and uses your personal data.",
};

export default function PrivacyPolicyPage() {
  return <PoliciesShell active="privacy-policy" />;
}
