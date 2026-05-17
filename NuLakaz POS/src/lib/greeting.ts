const TZ = 'Indian/Mauritius'

export function timeGreeting(date = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: 'numeric', hour12: false }).format(date),
  )
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function firstName(fullName: string | null, email: string | null): string {
  if (fullName?.trim()) return fullName.trim().split(/\s+/)[0] ?? 'there'
  if (email) return email.split('@')[0] ?? 'there'
  return 'there'
}

export function formatHubDate(date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}
