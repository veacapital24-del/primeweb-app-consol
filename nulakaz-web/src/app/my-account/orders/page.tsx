import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";

export const metadata: Metadata = {
  title: "Orders — My account",
};

const orders = [
  { id: "#1048", date: "2026-04-18", status: "Processing", total: "Rs 2,480", items: 7 },
  { id: "#1039", date: "2026-04-10", status: "Delivered", total: "Rs 1,120", items: 4 },
  { id: "#1021", date: "2026-03-28", status: "Delivered", total: "Rs 890", items: 3 },
  { id: "#1012", date: "2026-03-14", status: "Delivered", total: "Rs 3,240", items: 11 },
  { id: "#0998", date: "2026-02-28", status: "Cancelled", total: "Rs 420", items: 2 },
];

const tone = (s: string) =>
  s === "Delivered"
    ? "bg-[#5a8a3d]/10 text-[#3f6828]"
    : s === "Processing"
      ? "bg-amber-400/20 text-amber-700"
      : s === "Cancelled"
        ? "bg-[#c43f3f]/10 text-[#c43f3f]"
        : "bg-background text-foreground-muted";

export default function OrdersPage() {
  return (
    <AccountShell active="orders" title="Orders">
      <section className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-foreground">All orders</h2>
          <span className="text-sm text-foreground-muted">
            {orders.length} total
          </span>
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="text-left text-foreground-muted bg-background/60">
              <tr>
                <th className="text-[11px] uppercase tracking-wide font-bold px-6 py-3">Order</th>
                <th className="text-[11px] uppercase tracking-wide font-bold px-6 py-3">Date</th>
                <th className="text-[11px] uppercase tracking-wide font-bold px-6 py-3">Status</th>
                <th className="text-[11px] uppercase tracking-wide font-bold px-6 py-3">Total</th>
                <th className="text-[11px] uppercase tracking-wide font-bold px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-border">
                  <td className="px-6 py-4 font-semibold text-foreground">{o.id}</td>
                  <td className="px-6 py-4 text-foreground/70">{o.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide rounded-full px-2.5 py-0.5 ${tone(o.status)}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-meta font-bold text-brand-2">
                    {o.total}{" "}
                    <span className="text-foreground-muted font-normal">
                      · {o.items} items
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href="#"
                      className="text-brand hover:underline font-semibold"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="sm:hidden divide-y divide-border">
          {orders.map((o) => (
            <li key={o.id} className="px-5 py-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">{o.id}</span>
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide rounded-full px-2.5 py-0.5 ${tone(o.status)}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {o.status}
                </span>
              </div>
              <p className="text-[13px] text-foreground/70">
                {o.date} · {o.items} items
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="font-meta font-bold text-brand-2">{o.total}</span>
                <a
                  href="#"
                  className="text-sm text-brand hover:underline font-semibold"
                >
                  View →
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </AccountShell>
  );
}
