import type { Metadata } from "next";
import { AccountShell } from "@/components/account/AccountShell";
import { DEMO_ADMIN } from "@/lib/demo-auth";

export const metadata: Metadata = {
  title: "Account details — My account",
};

export default function AccountDetailsPage() {
  return (
    <AccountShell active="account-details" title="Account details">
      <form className="bg-white rounded-2xl border border-border p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="First name" name="first_name" defaultValue={DEMO_ADMIN.firstName} />
          <Field label="Last name" name="last_name" defaultValue={DEMO_ADMIN.lastName} />
        </div>
        <Field label="Display name" name="display_name" defaultValue={DEMO_ADMIN.displayName} />
        <Field label="Email address" name="email" type="email" defaultValue={DEMO_ADMIN.email} />

        <div className="border-t border-border pt-6">
          <h3 className="font-bold text-foreground mb-4">Password change</h3>
          <div className="space-y-5">
            <Field label="Current password" name="current_password" type="password" />
            <Field label="New password" name="new_password" type="password" />
            <Field label="Confirm new password" name="confirm_password" type="password" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="bg-brand text-white rounded-full h-11 px-8 font-semibold hover:bg-brand-dark transition-colors"
          >
            Save changes
          </button>
          <button
            type="reset"
            className="text-foreground/70 font-semibold hover:text-foreground text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </AccountShell>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-foreground/80 mb-1.5"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full bg-background border border-border rounded-full h-11 px-4 text-sm focus:outline-none focus:border-brand transition-colors"
      />
    </div>
  );
}
