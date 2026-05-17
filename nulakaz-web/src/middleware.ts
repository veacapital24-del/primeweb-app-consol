import { NextRequest, NextResponse } from "next/server";

// Stamp the pathname into a request header so server components (e.g. the
// root layout) can branch on the current route — needed to render
// /coming-soon full-bleed without the storefront chrome.
export function middleware(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/|favicon|api/).*)"],
};
