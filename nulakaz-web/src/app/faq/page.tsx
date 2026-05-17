import type { Metadata } from "next";
import { PoliciesShell } from "@/components/policies/PoliciesShell";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about ordering, delivery, and returns on NuLakaz.",
};

export default function FaqPage() {
  return <PoliciesShell active="faq" />;
}
