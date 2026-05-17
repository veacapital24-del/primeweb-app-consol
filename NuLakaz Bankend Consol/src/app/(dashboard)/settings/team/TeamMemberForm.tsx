'use client'

import { useRef, useState, useTransition } from 'react'
import { sendTeamMemberRecoveryLink, updateTeamMember, updateTeamMemberAndRedirect } from './actions'

import {
  AlertError,
  Field,
  FormStickyBar,
  GlassCard,
  Toggle,
  inputCls,
} from '@/components/admin/ui'

type TeamRole = 'admin' | 'wholesaler' | 'retailer'

export type TeamMemberInitial = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  shop_name: string | null
  role: TeamRole
  whatsapp_opt_in: boolean
  created_at: string
}

const TEAM_ROLES: { value: TeamRole; desc: string }[] = [
  { value: 'admin', desc: 'Full access to this admin console.' },
  { value: 'wholesaler', desc: 'High-volume B2B. Special account terms.' },
  { value: 'retailer', desc: 'Tabagie buyer — sees wholesale tier on the storefront.' },
]

export function TeamMemberForm({
  member,
  isSelf,
}: {
  member: TeamMemberInitial
  isSelf?: boolean
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [recoveryUrl, setRecoveryUrl] = useState<string | null>(null)
  const [role, setRole] = useState<TeamRole>(member.role)

  const submit = (form: FormData, redirectAfter: boolean) => {
    setError(null)
    setSaved(false)
    start(async () => {
      try {
        if (redirectAfter) {
          await updateTeamMemberAndRedirect(member.id, form)
        } else {
          await updateTeamMember(member.id, form)
          setSaved(true)
          setTimeout(() => setSaved(false), 2500)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Save failed')
      }
    })
  }

  const saveAndClose = () => {
    if (!formRef.current) return
    submit(new FormData(formRef.current), true)
  }

  const onRecovery = () => {
    setError(null)
    start(async () => {
      try {
        const { recoveryUrl: url } = await sendTeamMemberRecoveryLink(member.id)
        setRecoveryUrl(url)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not generate link')
      }
    })
  }

  return (
    <form
      ref={formRef}
      action={(form) => submit(form, false)}
      className="space-y-6"
    >
      {error && <AlertError message={error} />}
      {saved && (
        <div className="rounded-xl border border-mint-500/30 bg-mint-100 px-4 py-3 text-sm font-semibold text-mint-600">
          Changes saved
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <GlassCard title="Profile">
            <Field label="Email" required hint="Used to sign in to the admin console">
              <input
                name="email"
                type="email"
                required
                defaultValue={member.email}
                className={inputCls}
              />
            </Field>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <input name="full_name" defaultValue={member.full_name ?? ''} className={inputCls} />
              </Field>
              <Field label="Phone">
                <input
                  name="phone"
                  type="tel"
                  defaultValue={member.phone ?? ''}
                  placeholder="+230 5xxx xxxx"
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Shop name" hint="For tabagie / wholesaler accounts" className="mt-4">
              <input name="shop_name" defaultValue={member.shop_name ?? ''} className={inputCls} />
            </Field>
          </GlassCard>

          <GlassCard title="Operator role">
            <div className="grid gap-2">
              {TEAM_ROLES.map((r) => (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                    role === r.value
                      ? 'border-prime-700 bg-prime-50'
                      : 'border-ink-300 bg-paper hover:border-ink-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    className="mt-1 h-4 w-4 text-prime-700 focus:ring-prime-500"
                  />
                  <div>
                    <div className="text-sm font-bold capitalize text-ink-900">{r.value}</div>
                    <p className="text-xs text-ink-500">{r.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </GlassCard>

          <GlassCard title="WhatsApp">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink-300 bg-paper-dim/40 px-4 py-3">
              <input
                type="checkbox"
                name="whatsapp_opt_in"
                defaultChecked={member.whatsapp_opt_in}
                className="h-4 w-4 rounded border-ink-300 text-prime-700 focus:ring-prime-500"
              />
              <span className="text-sm text-ink-800">Opted in to WhatsApp updates</span>
            </label>
          </GlassCard>
        </div>

        <aside className="space-y-4">
          <GlassCard title="Account">
            <dl className="space-y-2 text-xs">
              <div>
                <dt className="font-bold uppercase tracking-wider text-ink-500">User ID</dt>
                <dd className="mt-0.5 font-mono text-[11px] text-ink-700">{member.id}</dd>
              </div>
              <div>
                <dt className="font-bold uppercase tracking-wider text-ink-500">Joined</dt>
                <dd className="mt-0.5 text-ink-700">
                  {new Date(member.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </dd>
              </div>
            </dl>
            {isSelf && (
              <p className="mt-3 text-[11px] leading-relaxed text-ink-500">
                You are editing your own account. Role changes still apply — avoid removing the last admin.
              </p>
            )}
          </GlassCard>

          <GlassCard title="Password reset">
            <p className="text-xs leading-relaxed text-ink-600">
              Generate a one-time link for this user to set a new password.
            </p>
            <button
              type="button"
              onClick={onRecovery}
              disabled={isPending}
              className="mt-3 w-full rounded-lg border border-ink-300 bg-paper px-3 py-2 text-xs font-bold text-ink-900 transition hover:border-prime-500 hover:text-prime-700 disabled:opacity-50"
            >
              Generate recovery link
            </button>
            {recoveryUrl && (
              <div className="mt-3 space-y-2">
                <input
                  readOnly
                  value={recoveryUrl}
                  className="w-full rounded-lg border border-ink-300 bg-paper px-2 py-1.5 font-mono text-[10px]"
                />
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(recoveryUrl)}
                  className="w-full rounded-lg bg-ink-900 py-2 text-xs font-bold text-paper hover:bg-prime-700"
                >
                  Copy link
                </button>
              </div>
            )}
          </GlassCard>
        </aside>
      </div>

      <FormStickyBar
        backHref="/settings/team"
        backLabel="← Back to team"
        submitLabel="Save changes"
        isPending={isPending}
      /></form>
  )
}

