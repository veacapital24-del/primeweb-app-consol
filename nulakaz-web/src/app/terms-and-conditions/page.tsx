import type { Metadata } from "next";
import { PoliciesShell } from "@/components/policies/PoliciesShell";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description: "NuLakaz terms of service governing your use of the site and delivery services.",
};

export default function TermsAndConditionsPage() {
  return <PoliciesShell active="terms-and-conditions" />;
}
