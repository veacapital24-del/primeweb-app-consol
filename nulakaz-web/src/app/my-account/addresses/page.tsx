import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { AddressPicker } from "@/components/account/AddressPicker";
import { DEMO_ADMIN } from "@/lib/demo-auth";

export const metadata: Metadata = {
  title: "Addresses — My account",
};

export default function AddressesPage() {
  return (
    <AccountShell active="addresses" title="Addresses">
      <section className="mb-8">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
          <h2 className="text-brand font-bold text-lg">
            Primary delivery address
          </h2>
          <span className="text-[11px] uppercase tracking-wide font-bold text-brand bg-brand-soft/60 rounded-full px-2.5 py-0.5">
            Map-pinned
          </span>
        </div>
        <p className="text-sm text-foreground/70 mb-4">
          Mauritian addresses can be vague — drop a pin so our driver finds
          you first try. Your location is only stored on this device.
        </p>
        <AddressPicker />
      </section>

      <section className="border-t border-border pt-8">
        <h2 className="text-brand font-bold text-lg mb-4">Billing address</h2>
        <div className="bg-white rounded-2xl border border-border p-6 max-w-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground">On file</h3>
            <button
              type="button"
              className="text-sm text-brand hover:underline font-semibold"
            >
              Edit
            </button>
          </div>
          <address className="not-italic text-sm text-foreground/80 leading-relaxed">
            {DEMO_ADMIN.displayName}
            <br />
            NuLaz Online Grocery
            <br />
            222 Royal Road
            <br />
            Riche Terre, Mauritius
          </address>
          <p className="text-[12px] text-foreground-muted mt-3">
            Billing reuses the delivery address unless you set a different one
            here.
          </p>
        </div>
      </section>
    </AccountShell>
  );
}
