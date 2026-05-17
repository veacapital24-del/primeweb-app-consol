// Demo-only auth. No real backend — credentials are hardcoded so you can
// preview the logged-in /my-account screens. Replace with Supabase (or
// whichever auth backend you pick) when wiring real accounts.

export const DEMO_ADMIN = {
  email: "admin@nulakaz.com",
  password: "nulakaz-admin-2026",
  firstName: "Admin",
  lastName: "NuLakaz",
  displayName: "Admin NuLakaz",
  memberSince: "2025-06-01",
} as const;

export const SESSION_KEY = "nulakaz-demo-session";

export type DemoSession = {
  email: string;
  displayName: string;
  loggedInAt: number;
};
